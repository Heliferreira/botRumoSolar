const { enviarMensagemSimples } = require('./zapiService');
const { getProximoVendedor } = require('./vendedorService');
const { salvarLead } = require('./db');

const contexto = {};
console.log('✅ fluxoConversas.js carregado');

async function processarFluxo(numero, mensagem, tipo) {
  try {
    console.log('🌸 Mensagem recebida no fluxo:', { numero, mensagem, tipo });

    const estado = contexto[numero] || { etapa: 'inicio' };

    if (['voltar', 'menu', 'voltar_menu'].includes(mensagem)) {
      contexto[numero] = { etapa: 'inicio' };
      await enviarMensagemSimples(numero, enviarMenuPrincipal());
      return;
    }

    if (estado.etapa === 'inicio') {
      if (mensagem.includes('energia')) {
        contexto[numero] = { etapa: 'aguardando_valor', servico: 'Energia Solar' };
        await enviarMensagemSimples(
          numero,
          '🔆 *Energia Solar*\nVocê pode economizar até *95%* na sua conta de luz!\n\n💬 Me diga quanto você gasta por mês (ex: 350)'
        );
        return;
      }

      // 🧠 Mesmo que não digite energia, responde o menu
      await enviarMensagemSimples(numero, enviarMenuPrincipal());
      return;
    }

    if (estado.etapa === 'aguardando_valor') {
      const valor = parseFloat(mensagem);
      if (!isNaN(valor)) {
        const economia = (valor * 0.95).toFixed(2);
        contexto[numero] = {
          etapa: 'confirmar_interesse',
          servico: estado.servico,
          valor,
        };
        await enviarMensagemSimples(
          numero,
          `💡 Com R$${valor}, você pode economizar até *R$${economia}* por mês!\nDeseja falar com um especialista?\nDigite *sim* ou *voltar*.`
        );
        return;
      }

      await enviarMensagemSimples(numero, '❗ Envie apenas números. Ex: 300');
      return;
    }

    if (estado.etapa === 'confirmar_interesse' && mensagem.includes('sim')) {
      const vendedor = await getProximoVendedor();
      await salvarLead({
        numero,
        servico: estado.servico,
        valorConta: estado.valor,
        vendedor: vendedor.nome,
        status: 'novo',
      });
      await enviarMensagemSimples(
        vendedor.numero,
        `📥 Novo lead de *${estado.servico}*\nCliente: https://wa.me/${numero}\nValor: R$${estado.valor}`
      );
      contexto[numero] = { etapa: 'finalizado' };
      await enviarMensagemSimples(numero, '✅ Um especialista vai te chamar!');
      return;
    }

    // Fallback
    await enviarMensagemSimples(numero, enviarMenuPrincipal());

  } catch (err) {
    console.error('❌ Erro no fluxo:', err.message);
    await enviarMensagemSimples(numero, '❗ Erro interno. Tente novamente.');
  }
}

function enviarMenuPrincipal() {
  return 'Olá! 👋 Seja bem-vindo à *Rumo Solar*.\n\nEscolha uma opção:\n\n☀️ Digite *energia* para simular economia com energia solar\n🔙 Digite *voltar* para reiniciar o atendimento';
}

module.exports = { processarFluxo };
