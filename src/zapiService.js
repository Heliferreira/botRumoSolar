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
    return { error: true, message: 'Texto ou número não fornecido' };
  }
  const instanceId = process.env.ZAPI_INSTANCE;
  if (!instanceId) return { error: true, message: 'ZAPI_INSTANCE não definido' };
  const url = `https://api.z-api.io/instances/${instanceId}/send-text`;
  const phone = formatarNumero(numero);

  try {
    const response = await axios.post(url, { phone, message: texto }, { headers: defaultHeaders });
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

// Envio de mensagem com botões
async function enviarMensagemComBotoes(numero, texto, botoes) {
  if (!texto || !numero || !botoes?.length) {
    console.warn('⚠️ Texto, número ou botões não fornecidos corretamente.');
    return { error: true, message: 'Texto, número ou botões inválidos' };
  }
  const instanceId = process.env.ZAPI_INSTANCE;
  if (!instanceId) return { error: true, message: 'ZAPI_INSTANCE não definido' };
  const url = `https://api.z-api.io/instances/${instanceId}/send-button-message`;
  const phone = formatarNumero(numero);

  try {
    const response = await axios.post(
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

// ✅ Função universal para envio (decide se envia botão ou texto simples)
async function enviarMensagem(numero, resposta) {
  if (!resposta) return { error: true, message: 'Resposta não fornecida' };

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
  return { error: true, message: 'Formato de resposta inválido' };
}

// Verifica se o número está registrado e tem consentimento
async function verificarNumero(phone) {
  const instanceId = process.env.ZAPI_INSTANCE;
  if (!instanceId) return false;
  const url = `https://api.z-api.io/instances/${instanceId}/check-number/${phone}`;
  try {
    const response = await axios.get(url, { headers: defaultHeaders });
    console.log('📋 Status do número:', response.data);
    return response.data.isRegistered && response.data.isOptedIn;
  } catch (err) {
    console.error('❌ Erro ao verificar número:', err.response?.data || err.message);
    return false;
  }
}

// Exporta os métodos
module.exports = {
  enviarMensagemSimples,
  enviarMensagemComBotoes,
  enviarMensagem,
  verificarNumero,
  formatarNumero
};