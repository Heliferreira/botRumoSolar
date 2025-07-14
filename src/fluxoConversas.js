const { enviarMensagemSimples, enviarMensagemComBotoes } = require('./zapiService');
const { getProximoVendedor } = require('./vendedorService');
const { salvarLead } = require('./db');

const contexto = {}; // Armazena o estado da conversa por número
console.log('✅ Arquivo fluxoConversas.js carregado e contexto disponível!');

async function processarFluxo(numero, mensagem, tipo) {
  console.log('🌺 Fluxo acionado com:', { numero, mensagem, tipo });

  const estado = contexto[numero] || { etapa: 'inicio' };

  // RESET para voltar ao menu
  if (mensagem === 'voltar_menu') {
    contexto[numero] = { etapa: 'inicio' };
    console.log('🔄 Voltou para o menu principal');
    return enviarMenuPrincipal(numero);
  }

  // ETAPA 1: Menu Inicial
  if (estado.etapa === 'inicio') {
    console.log('📍 Etapa: inicio');
    if (tipo === 'botao') {
      if (mensagem === 'servico_energia') {
        contexto[numero] = { etapa: 'aguardando_valor', servico: 'Energia Solar' };
        console.log('🔆 Escolheu: Energia Solar');
        return {
          texto: '🔆 *Energia Solar*\nVocê pode economizar até *95%* na sua conta de luz!\n\n💬 Me diga quanto você gasta por mês com energia elétrica (ex: 350)',
          botoes: [{ id: 'voltar_menu', text: '🔙 Voltar ao Menu' }]
        };
      }
    } else {
      console.log('📩 Tipo de entrada não é botão, exibindo menu novamente.');
      return enviarMenuPrincipal(numero);
    }
  }

  // ETAPA 2: Simulação
  if (estado.etapa === 'aguardando_valor') {
    console.log('📍 Etapa: aguardando_valor');

    const valor = parseFloat(mensagem);
    if (!isNaN(valor)) {
      const economia = (valor * 0.95).toFixed(2);
      contexto[numero] = { etapa: 'confirmar_interesse', servico: estado.servico, valor };

      console.log(`💰 Valor informado: ${valor}, Economia estimada: ${economia}`);

      return {
        texto: `💡 Com uma conta de R$${valor}, você pode economizar até *R$${economia}* por mês!\n\nDeseja falar com um especialista agora?`,
        botoes: [
          { id: 'falar_especialista', text: '✅ Sim, quero simular' },
          { id: 'voltar_menu', text: '🔙 Voltar ao Menu' }
        ]
      };
    } else {
      console.log('❌ Valor inválido informado.');
      return { texto: '❗ Envie apenas o valor numérico da sua conta. Ex: 350' };
    }
  }

  // ETAPA 3: Confirmação e Encaminhamento
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

    await enviarMensagemSimples(
      vendedor.numero,
      `📥 Novo lead de *${estado.servico}*\nCliente: https://wa.me/${numero}\nValor da conta: R$${estado.valor}`
    );

    contexto[numero] = { etapa: 'finalizado' };
    return { texto: '✅ Um especialista está a caminho! Aguarde nosso contato.' };
  }

  // FALLBACK — qualquer entrada fora do fluxo esperado
  console.log('❓ Fallback: nenhuma condição atendida, enviando menu novamente.');
  return enviarMenuPrincipal(numero);
}

// ✅ Menu principal com botão
function enviarMenuPrincipal(numero) {
  return {
    texto: 'Olá! 👋 Seja bem-vindo à *Rumo Solar*.\nEscolha um dos serviços abaixo:',
    botoes: [{ id: 'servico_energia', text: '☀️ Energia Solar' }]
  };
}

module.exports = { processarFluxo };
