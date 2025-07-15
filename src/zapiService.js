// src/zapiService.js
const axios = require('axios');
require('dotenv').config();

// 🧠 Formata o número para o padrão da Z-API (com DDI 55 e 9 no meio, se necessário)
function formatarNumero(numero) {
  let num = numero.replace(/\D/g, '');
  if (num.length === 11) return '55' + num;
  if (num.length === 12 && num.startsWith('55')) return '55' + num.slice(2, 4) + '9' + num.slice(4);
  if (num.length === 13 && num.startsWith('55')) return num;
  if (!num.startsWith('55')) return '55' + num;
  return num;
}

// Headers padrão da API com o Client-Token
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Client-Token': process.env.ZAPI_CLIENT_TOKEN
};

// Envio de mensagem simples
async function enviarMensagemSimples(numero, texto) {
  if (!texto || !numero) {
    console.warn('⚠️ Texto ou número não fornecido.');
    return;
  }

  const instanceId = process.env.ZAPI_INSTANCE;
  const token = process.env.ZAPI_TOKEN;
  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;
  const phone = formatarNumero(numero);

  try {
    await axios.post(url, { phone, message: texto }, { headers: defaultHeaders });
    console.log(`✅ Mensagem simples enviada para ${phone}`);
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem simples:', err.response?.data || err.message);
  }
}

// Envio de mensagem com botões
async function enviarMensagemComBotoes(numero, texto, botoes) {
  if (!texto || !numero || !botoes?.length) {
    console.warn('⚠️ Texto, número ou botões não fornecidos corretamente.');
    return;
  }

  const instanceId = process.env.ZAPI_INSTANCE;
  const token = process.env.ZAPI_TOKEN;
  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-button-message`;
  const phone = formatarNumero(numero);

  try {
    await axios.post(
      url,
      {
        phone,
        message: texto,
        buttons: botoes.map(b => ({
          buttonId: b.id,
          buttonText: { displayText: b.text },
          type: 1
        }))
      },
      { headers: defaultHeaders }
    );
    console.log(`✅ Mensagem com botões enviada para ${phone}`);
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem com botões:', err.response?.data || err.message);
  }
}

// ✅ Função universal para envio (decide se envia botão ou texto simples)
async function enviarMensagem(numero, resposta) {
  if (!resposta) return;

  if (resposta.texto && resposta.botoes) {
    return enviarMensagemComBotoes(numero, resposta.texto, resposta.botoes);
  }

  if (typeof resposta === 'string') {
    return enviarMensagemSimples(numero, resposta);
  }

  if (resposta.texto) {
    return enviarMensagemSimples(numero, resposta.texto);
  }

  console.warn('⚠️ Formato de resposta desconhecido:', resposta);
}

// Exporta os métodos
module.exports = {
  enviarMensagemSimples,
  enviarMensagemComBotoes,
  enviarMensagem // 👈 agora você pode usar essa função no webhook
};
