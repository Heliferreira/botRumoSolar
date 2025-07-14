// src/zapiService.js
const axios = require('axios');
require('dotenv').config();

function formatarNumero(numero) {
  let num = numero.replace(/\D/g, '');
  if (num.length === 11) return '55' + num;
  if (num.length === 12 && num.startsWith('55')) return '55' + num.slice(2, 4) + '9' + num.slice(4);
  if (num.length === 13 && num.startsWith('55')) return num;
  if (!num.startsWith('55')) return '55' + num;
  return num;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Client-Token': process.env.ZAPI_CLIENT_TOKEN
};

async function enviarMensagemSimples(numero, texto) {
  const instanceId = process.env.ZAPI_INSTANCE;
  const token = process.env.ZAPI_TOKEN;
  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;
  const phone = formatarNumero(numero);

  try {
    await axios.post(url, { phone, message: texto }, { headers: defaultHeaders });
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem simples:', err.response?.data || err.message);
  }
}

async function enviarMensagemComBotoes(numero, texto, botoes) {
  const instanceId = process.env.ZAPI_INSTANCE;
  const token = process.env.ZAPI_TOKEN;
  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-button-message`;
  const phone = formatarNumero(numero);

  try {
    await axios.post(url, {
      phone,
      message: texto,
      buttons: botoes.map(b => ({
        buttonId: b.id,
        buttonText: { displayText: b.text },
        type: 1
      }))
    }, { headers: defaultHeaders });
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem com botões:', err.response?.data || err.message);
  }
}

module.exports = {
  enviarMensagemSimples,
  enviarMensagemComBotoes
};
