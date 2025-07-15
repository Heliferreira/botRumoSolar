const { enviarMensagem } = require('./zapiService');
const { getProximoVendedor } = require('./vendedorService');
const { salvarLead } = require('./db');

const contexto = {}; // Armazena o estado da conversa por número
console.log('✅ Arquivo fluxoConversas.js carregado e contexto disponível!');

async function processarFluxo(numero, mensagem, tipo) {
  try {
    console.log('🌺 Fluxo acionado com:', { numero, mensagem, tipo });
    const estado = contexto[numero] || { etapa: 'inicio' };

    if (mensagem === 'voltar_menu') {
      contexto[numero] = { etapa: 'inicio' };
      console.log('🔄 Voltou para o menu principal');
      await enviarMensagem(numero, enviarMenuPrincipal(numero));
      return;
    }

    if (estado.etapa === 'inicio') {
      if (tipo === 'botao' && mensagem === 'servico_energia') {
        contexto[numero] = { etapa: 'aguardando_valor', servico: 'Energia Solar' };
        console.log('🔆 Escolheu: Energia Solar');
        await enviarMensagem(numero, {
          texto: '🔆 *Energia Solar*\nVocê pode economizar até *95%* na sua conta de luz!\n\n💬 Me diga quanto você gasta por mês (ex: 350)',
          botoes: [{ id: 'voltar_menu', text: '🔙 Voltar ao Menu' }]
        });
        return;
      } else {
        console.log('📩 Tipo de entrada não é botão, exibindo menu novamente.');
        await enviarMensagem(numero, enviarMenuPrincipal(numero));
        return;
      }
    }

    if (estado.etapa === 'aguardando_valor') {
      const valor = parseFloat(mensagem);
      if (!isNaN(valor)) {
        const economia = (valor * 0.95).toFixed(2);
        contexto[numero] = { etapa: 'confirmar_interesse', servico: estado.servico, valor };
        console.log(`💰 Valor informado: ${valor}, Economia estimada: ${economia}`);
        await enviarMensagem(numero, {
          texto: `💡 Com R$${valor}, você pode economizar até *R$${economia}* por mês!\nDeseja falar com um especialista?`,
          botoes: [
            { id: 'falar_especialista', text: '✅ Sim, quero simular' },
            { id: 'voltar_menu', text: '🔙 Voltar ao Menu' }
          ]
        });
        return;
      } else {
        console.log('❌ Valor inválido informado.');
        await enviarMensagem(numero, '❗ Envie apenas o valor numérico. Ex: 350');
        return;
      }
    }

    if (estado.etapa === 'confirmar_interesse' && mensagem === 'falar_especialista') {
      console.log('📍 Etapa: confirmar_interesse - usuário quer falar com especialista');
      const vendedor = await getProximoVendedor();
      console.log('🧑‍💼 Vendedor atribuído:', vendedor);
      await salvarLead({
        numero,
        servico: estado.servico,
        valorConta: estado.valor,
        vendedor: vendedor.nome,
        status: 'novo'
      });
      await enviarMensagem(vendedor.numero, `📥 Novo lead de *${estado.servico}*\nCliente: https://wa.me/${numero}\nValor: R$${estado.valor}`);
      contexto[numero] = { etapa: 'finalizado' };
      await enviarMensagem(numero, '✅ Especialista a caminho! Aguarde.');
      return;
    }

    console.log('❓ Fallback: enviando menu principal.');
    await enviarMensagem(numero, enviarMenuPrincipal(numero));
  } catch (err) {
    console.error('❌ Erro no fluxo:', err.message);
    try {
      await enviarMensagem(numero, '❗ Ocorreu um erro. Tente novamente.');
    } catch (e) {
      console.error('❌ Falha no envio do erro:', e.message);
    }
  }
}

function enviarMenuPrincipal(numero) {
  return {
    texto: 'Olá! 👋 Seja bem-vindo à *Rumo Solar*.\nEscolha um dos serviços abaixo:',
    botoes: [{ id: 'servico_energia', text: '☀️ Energia Solar' }]
  };
}

module.exports = { processarFluxo };