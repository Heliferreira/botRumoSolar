// src/fluxoConversas.js
const { enviarMensagemSimples, enviarMensagemComBotoes } = require('./zapiService');
const { getProximoVendedor } = require('./vendedorService');
const { salvarLead } = require('./db');

const contexto = {}; // estado temporário por número

async function processarFluxo(numero, mensagem, tipo) {
  const estado = contexto[numero] || { etapa: 'inicio' };

  if (mensagem === 'voltar_menu') {
    contexto[numero] = { etapa: 'inicio' };
    return enviarMenuPrincipal(numero);
  }

  // ETAPA 1: MENU INICIAL
  if (estado.etapa === 'inicio') {
    if (tipo === 'botao') {
      if (mensagem === 'servico_energia') {
        contexto[numero] = { etapa: 'aguardando_valor', servico: 'Energia Solar' };
        return enviarMensagemComBotoes(numero,
          '🔆 *Energia Solar*\nVocê pode economizar até *95%* na sua conta de luz!\n\n💬 Me diga quanto você gasta por mês com energia elétrica (ex: 350)',
          [{ id: 'voltar_menu', text: '🔙 Voltar ao Menu' }]
        );
      }
      // outros serviços aqui...
    } else {
      return enviarMenuPrincipal(numero);
    }
  }

  // ETAPA 2: SIMULAÇÃO
  if (estado.etapa === 'aguardando_valor') {
    const valor = parseFloat(mensagem);
    if (!isNaN(valor)) {
      const economia = (valor * 0.95).toFixed(2);
      contexto[numero] = { etapa: 'confirmar_interesse', servico: estado.servico, valor };

      return enviarMensagemComBotoes(numero,
        `💡 Com uma conta de R$${valor}, você pode economizar até *R$${economia}* por mês!\n\nDeseja falar com um especialista agora?`,
        [
          { id: 'falar_especialista', text: '✅ Sim, quero simular' },
          { id: 'voltar_menu', text: '🔙 Voltar ao Menu' }
        ]
      );
    } else {
      return enviarMensagemSimples(numero, '❗ Envie apenas o valor numérico da sua conta. Ex: 350');
    }
  }

  // ETAPA 3: CONFIRMAÇÃO
  if (estado.etapa === 'confirmar_interesse' && mensagem === 'falar_especialista') {
    const vendedor = await getProximoVendedor();

    await salvarLead({
      numero,
      servico: estado.servico,
      valorConta: estado.valor,
      vendedor: vendedor.nome,
      status: 'novo'
    });

    await enviarMensagemSimples(vendedor.numero,
      `📥 Novo lead de *${estado.servico}*\nCliente: https://wa.me/${numero}\nValor da conta: R$${estado.valor}`
    );

    contexto[numero] = { etapa: 'finalizado' };
    return enviarMensagemSimples(numero, '✅ Um especialista está a caminho! Aguarde nosso contato.');
  }

  // FALLBACK
  return enviarMenuPrincipal(numero);
}

function enviarMenuPrincipal(numero) {
  return enviarMensagemComBotoes(numero,
    'Olá! 👋 Seja bem-vindo à *Villa Energia*.\nEscolha um dos serviços abaixo:',
    [
      { id: 'servico_energia', text: '☀️ Energia Solar' }
      // outros serviços podem ser adicionados aqui...
    ]
  );
}

module.exports = { processarFluxo };
