const axios = require('axios');
require('dotenv').config();

// Formata o número no padrão 55 + DDD + número com 9
function formatarNumero(numero) {
  if (!numero) return '';
  let num = numero.replace(/\D/g, '');

  if (num.length === 12 && num.startsWith('55')) return '55' + num.slice(2, 4) + '9' + num.slice(4);
  if (num.length === 13 && num.startsWith('55')) return num;
  if (num.length === 11) return '55' + num;
  if (!num.startsWith('55')) return '55' + num;

  return num;
}

// Envia mensagem simples (texto)
async function enviarMensagemSimples(numero, texto) {
  if (!texto || !numero) {
    console.warn('⚠️ Texto ou número não fornecido.');
    return { error: true, message: 'Texto ou número não fornecido' };
  }

  const instanceId = process.env.ZAPI_INSTANCE;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN; // Vai no HEADER
  const token = process.env.CLIENT_TOKEN; // Vai na URL

  if (!instanceId || !token || !clientToken) {
    return { error: true, message: 'Variáveis de ambiente ausentes!' };
  }

  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;
  const phone = formatarNumero(numero);

  console.log(`📨 Tentando enviar mensagem para: ${phone} | Mensagem: "${texto}"`);

  try {
    const response = await axios.post(url, {
      phone,
      message: texto,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': clientToken
      }
    });

    console.log(`✅ Resposta Z-API para ${phone}:`, response.data);

    if (response.data.error) {
      console.error('❌ Erro Z-API:', response.data.message);
      return { error: true, message: response.data.message };
    }

    return response.data;

  } catch (err) {
    console.error('❌ Erro ao enviar mensagem simples:', err.response?.data || err.message);
    throw err;
  }
}

// Envia mensagem com botões
async function enviarMensagemComBotoes(numero, botoes) {
  const instanceId = process.env.ZAPI_INSTANCE;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;
  const token = process.env.CLIENT_TOKEN;

  if (!instanceId || !token || !clientToken) {
    return { error: true, message: 'Variáveis de ambiente ausentes!' };
  }

  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-button-message`;
  const phone = formatarNumero(numero);

  console.log(`📨 Tentando enviar mensagem com botões para: ${phone}`);

  try {
    const response = await axios.post(url, {
      phone,
      message: botoes.message,
      listButtons: botoes.listButtons,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': clientToken
      }
    });

    console.log(`✅ Resposta Z-API para ${phone} (botões):`, response.data);

    if (response.data.error) {
      console.error('❌ Erro Z-API:', response.data.message);
      return { error: true, message: response.data.message };
    }

    return response.data;

  } catch (err) {
    console.error('❌ Erro ao enviar mensagem com botões:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = {
  enviarMensagemSimples,
  enviarMensagemComBotoes,
  formatarNumero,
};
