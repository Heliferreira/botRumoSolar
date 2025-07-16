const axios = require('axios');
require('dotenv').config();

// 🧪 Log de teste para verificar se o .env foi carregado corretamente
console.log('🔍 INSTANCIA_ID:', process.env.ID_INSTANCE);
console.log('🔍 TOKEN:', process.env.CLIENT_TOKEN);
console.log('🔍 CLIENT_TOKEN:', process.env.TOKEN_DA_INSTANCIA);

// 🧼 Formata número para o padrão 55 + DDD + 9 + número
function formatarNumero(numero) {
  if (!numero) return '';
  const num = numero.replace(/\D/g, '');

  if (num.length === 13 && num.startsWith('55')) return num;                      // já está ok
  if (num.length === 12 && num.startsWith('55')) return '55' + num.slice(2, 4) + '9' + num.slice(4);
  if (num.length === 11) return '55' + num;
  if (num.length === 10) return '55' + num.slice(0, 2) + '9' + num.slice(2);
  return num;
}

// 🔐 Carrega dados do .env com nomes amigáveis
const INSTANCIA_ID = process.env.ID_INSTANCE;
const TOKEN = process.env.CLIENT_TOKEN;
const CLIENT_TOKEN = process.env.TOKEN_DA_INSTANCIA;

const API_BASE = `https://api.z-api.io/instances/${INSTANCIA_ID}/token/${TOKEN}`;

// 📨 Envia mensagem de texto simples
async function enviarMensagemSimples(numero, mensagem) {
  const telefone = formatarNumero(numero);

  const payload = {
    phone: telefone,
    message: mensagem
  };

  const headers = {
    'Content-Type': 'application/json',
    'Client-Token': CLIENT_TOKEN
  };

  const url = `${API_BASE}/send-text`;

  console.log('📦 Enviando mensagem simples...');
  console.log('🌐 URL:', url);
  console.log('📨 Payload:', payload);
  console.log('🛡️ Headers:', headers);

  try {
    const resposta = await axios.post(url, payload, { headers });
    console.log(`✅ Mensagem enviada com sucesso para ${telefone}`);
    return resposta.data;
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem:', err.response?.data || err.message);
    return { error: true, message: err.response?.data || err.message };
  }
}

// 🔘 Envia mensagem com botões
async function enviarMensagemComBotoes(numero, botoes) {
  const telefone = formatarNumero(numero);

  const payload = {
    phone: telefone,
    message: botoes.message,
    listButtons: botoes.listButtons
  };

  const headers = {
    'Content-Type': 'application/json',
    'Client-Token': CLIENT_TOKEN
  };

  const url = `${API_BASE}/send-button-message`;

  console.log('📦 Enviando mensagem com botões...');
  console.log('🌐 URL:', url);
  console.log('📨 Payload:', payload);
  console.log('🛡️ Headers:', headers);

  try {
    const resposta = await axios.post(url, payload, { headers });
    console.log(`✅ Mensagem com botões enviada para ${telefone}`);
    return resposta.data;
  } catch (err) {
    console.error('❌ Erro ao enviar botões:', err.response?.data || err.message);
    return { error: true, message: err.response?.data || err.message };
  }
}

module.exports = {
  enviarMensagemSimples,
  enviarMensagemComBotoes,
  formatarNumero
};
