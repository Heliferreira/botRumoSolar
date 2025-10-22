// fluxoConversas.js — fluxo conversacional do bot
require('dotenv').config();
const { enviarMensagemSimples, enviarMensagemComBotoes, formatarNumero } = require('./zapiService');
const { getProximoVendedor } = require('./vendedorService');
const { pool, salvarLead } = require('./db');

// 🧠 Memória de sessão (mantém estado temporário dos usuários)
const contexto = {};
console.log('✅ fluxoConversas.js carregado');

// 🔧 Mensagens de serviços
const opcoes = {
  'Energia Solar': '🌞 *Energia Solar*\nVocê pode economizar até *95%* na sua conta de luz!',
  'Elétrica e Iluminação': '💡 *Serviços Elétricos e Iluminação*\nProjetos com segurança, eficiência e estética.',
  'Alarmes e Monitoramento': '🔒 *Alarmes e Monitoramento*\nProteja seu patrimônio com tecnologia de ponta.',
  'Carregadores Elétricos': '⚡ *Carregadores para Carros Elétricos*\nTecnologia para abastecer o futuro!',
  'Automação de Ambientes': '🏠 *Automação de Ambientes*\nConforto, praticidade e controle na palma da mão.'
};

// Helpers
const norm = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const OPCOES_NORMALIZADAS = Object.fromEntries(Object.keys(opcoes).map(k => [norm(k), k]));

async function enviarMenuServicos(numero) {
  return enviarMensagemComBotoes(numero, '🚀 Escolha o serviço desejado:', Object.keys(opcoes));
}

// ===============================================================
// =============== FUNÇÃO PRINCIPAL DO FLUXO =====================
// ===============================================================
async function processarFluxo(numero, mensagem, tipo = 'texto', nomeCliente = 'Visitante', contexto) {
  try {
    if (!contexto[numero]) contexto[numero] = { etapa: 'inicio' };
    const estado = contexto[numero];
    const original = mensagem || '';
    const m = norm(original);

    console.log('⚙️ Novo fluxo:', { numero, mensagem: original, tipo });
    console.log('📍 Etapa atual:', estado.etapa);

    // ===== INÍCIO =====
    if (estado.etapa === 'inicio') {
      await enviarMensagemComBotoes(
        numero,
        `Olá ${nomeCliente.split(' ')[0]} 👋 Que bom ter você por aqui!\n\nPara iniciarmos seu atendimento, me diga se você é *Cliente* ou *Fornecedor*:`,
        ['Cliente', 'Fornecedor']
      );
      estado.etapa = 'aguardando_tipo_pessoa';
      return;
    }

    // (segue o restante do fluxo normalmente abaixo...)


    // ===== CLIENTE ou FORNECEDOR =====
    if (estado.etapa === 'aguardando_tipo_pessoa') {
      if (m === 'fornecedor') {
        const numeroChefe = process.env.NUMERO_CHEFE || '5541998308533';
        const numeroFormatado = formatarNumero(numero);

        await enviarMensagemSimples(numeroFormatado, 'Legal! Seu contato será encaminhado ao setor responsável.');
        await enviarMensagemSimples(numeroChefe, `📥 Novo fornecedor:\nhttps://wa.me/${numeroFormatado}`);

        // 🕒 Mantém o contexto por 10 min antes de limpar
        setTimeout(() => {
          delete contexto[numero];
          console.log(`🧹 Contexto limpo para ${numero}`);
        }, 10 * 60 * 1000);
        return;
      }

      if (m === 'cliente') {
        estado.etapa = 'aguardando_servico';
        await enviarMenuServicos(numero);
        return;
      }

      await enviarMensagemComBotoes(numero, 'Por favor, selecione uma opção abaixo 👇', ['Cliente', 'Fornecedor']);
      return;
    }

    // ===== ESCOLHA DE SERVIÇO =====
    if (estado.etapa === 'aguardando_servico') {
      const chaveServico = OPCOES_NORMALIZADAS[m];
      if (chaveServico) {
        estado.servico = chaveServico;
        estado.etapa = 'confirmar';
        await enviarMensagemComBotoes(
          numero,
          `${opcoes[chaveServico]}\n\n📲 Deseja falar com um consultor agora?`,
          ['Sim', 'Voltar ao Menu']
        );
        return;
      }
      await enviarMenuServicos(numero);
      return;
    }

// ===== CONFIRMAR =====
if (estado.etapa === 'confirmar') {
  if (m === 'sim') {
    if (estado.jaEnviadoParaConsultor) {
      console.log(`⚠️ Lead ${numero} já foi enviado — ignorando clique duplicado.`);
      return;
    }

    const vendedor = await getProximoVendedor();

    await salvarLead({
      numero,
      servico: estado.servico,
      valorConta: 0,
      vendedor: vendedor ? vendedor.nome : null,
      status: 'novo',
      observacoes: vendedor
        ? 'Lead confirmado e encaminhado ao consultor'
        : 'Lead confirmado (sem vendedor ativo)',
      lead_enviado: true,
    });

    estado.jaEnviadoParaConsultor = true;

    if (vendedor) {
      await enviarMensagemSimples(
        vendedor.telefone.replace('@c.us', ''),
        `📩 Novo lead de *${estado.servico}*\n👤 Cliente: https://wa.me/${numero.replace('@c.us', '')}`
      );

      await enviarMensagemSimples(
        numero,
        `✅ Seu interesse em *${estado.servico}* foi registrado!\nO consultor *${vendedor.nome}* entrará em contato em breve.`
      );
    } else {
      await enviarMensagemSimples(
        numero,
        `✅ Seu interesse em *${estado.servico}* foi registrado! Um consultor entrará em contato em breve.`
      );
    }

    setTimeout(() => {
      delete contexto[numero];
      console.log(`🧹 Contexto limpo para ${numero}`);
    }, 10 * 60 * 1000);

    return;
  }

  if (m === 'voltar ao menu') {
    estado.etapa = 'aguardando_servico';
    await enviarMenuServicos(numero);
    return;
  }
}


// ===== DEFAULT =====
if (!['inicio', 'aguardando_tipo_pessoa', 'aguardando_servico', 'confirmar', 'finalizar'].includes(estado.etapa)) {
  console.warn(`⚠️ Fluxo inesperado para ${numero}. Resetando contexto...`);
  delete contexto[numero];
  await enviarMensagemSimples(numero, '⚠️ Algo deu errado. Vamos recomeçar o atendimento...');
  return;
}

} catch (err) {
  console.error('❌ Erro no fluxoConversas.js:', err.message);
  await enviarMensagemSimples(numero, '❌ Ocorreu um erro no sistema. Tente novamente mais tarde.');
}
}

module.exports = { processarFluxo };
