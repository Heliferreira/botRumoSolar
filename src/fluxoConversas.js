const { enviarMensagemSimples } = require('./zapiService');
const { getProximoVendedor } = require('./vendedorService');
const { salvarLead } = require('./db');

const contexto = {};

console.log('✅ Arquivo fluxoConversas.js carregado e contexto disponível!');

async function processarFluxo(numero, mensagem, tipo) {
  try {
    console.log('🌺 Fluxo acionado com:', { numero, mensagem, tipo });
    const estado = contexto[numero] || { etapa: 'inicio' };

    if (mensagem === 'voltar_menu' || mensagem === 'voltar' || mensagem === 'menu') {
      contexto[numero] = { etapa: 'inicio' };
      await enviarMensagemSimples(numero, enviarMenuPrincipal());
      return;
    }

    if (estado.etapa === 'inicio') {
      if (mensagem === 'servico_energia' || mensagem.includes('energia')) {
        contexto[numero] = { etapa: 'aguardando_valor', servico: 'Energia Solar' };
        await enviarMensagemSimples(
          numero,
          '🔆 *Energia Solar*\nVocê pode economizar até *95%* na sua conta de luz!\n\n💬 Me diga quanto você gasta por mês (ex: 350)\n\nSe quiser voltar ao menu, digite: *voltar*'
        );
        return;
      } else {
        await enviarMensagemSimples(numero, enviarMenuPrincipal());
        return;
      }
    }

    if (estado.etapa === 'aguardando_valor') {
      const valor = parseFloat(mensagem);
      if (!isNaN(valor)) {
        const economia = (valor * 0.95).toFixed(2);
        contexto[numero] = { etapa: 'confirmar_interesse', servico: estado.servico, valor };
        await enviarMensagemSimples(
          numero,
          `💡 Com R$${valor}, você pode economizar até *R$${economia}* por mês!\nDeseja falar com um especialista?\n\nDigite *sim* para continuar ou *voltar* para o menu.`
        );
        return;
      } else {
        await enviarMensagemSimples(numero, '❗ Envie apenas o valor numérico. Ex: 350');
        return;
      }
    }

    if (estado.etapa === 'confirmar_interesse' && mensagem.includes('sim')) {
      const vendedor = await getProximoVendedor();
      await salvarLead({
        numero,
        servico: estado.servico,
        valorConta: estado.valor,
        vendedor: vendedor.nome,
        status: 'novo'
      });
      await enviarMensagemSimples(vendedor.numero, `📥 Novo lead de *${estado.servico}*\nCliente: https://wa.me/${numero}\nValor: R$${estado.valor}`);
      contexto[numero] = { etapa: 'finalizado' };
      await enviarMensagemSimples(numero, '✅ Especialista a caminho! Aguarde.');
      return;
    }

    console.log('⚠️ Fallback ativado: entrada inesperada, retornando ao menu.');
    await enviarMensagemSimples(numero, enviarMenuPrincipal());

  } catch (err) {
    console.error('❌ Erro no fluxo:', err.message);
    try {
      await enviarMensagemSimples(numero, '❗ Ocorreu um erro. Tente novamente.');
    } catch (e) {
      console.error('❌ Falha no envio do erro:', e.message);
    }
  }
}

function enviarMenuPrincipal() {
  return 'Olá! 👋 Seja bem-vindo à *Rumo Solar*.\n\nDigite uma das opções abaixo para começar:\n\n☀️ *energia* → para simular economia com energia solar\n🔙 *voltar* → para voltar ao menu';
}

module.exports = { processarFluxo };
