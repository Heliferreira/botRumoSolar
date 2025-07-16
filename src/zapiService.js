const axios = require('axios');
require('dotenv').config();

const INSTANCIA_ID = process.env.ID_INSTANCE;
const TOKEN = process.env.CLIENT_TOKEN;
const CLIENT_TOKEN = process.env.TOKEN_DA_INSTANCIA;

const API_URL = `https://api.z-api.io/instances/${INSTANCIA_ID}/token/${TOKEN}/send-text`;

async function enviarMensagemSimples(telefone, mensagem) {
  try {
    const payload = {
      phone: telefone,
      message: mensagem
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': CLIENT_TOKEN
      }
    };

    const resposta = await axios.post(API_URL, payload, config);
    return resposta.data;

  } catch (err) {
    console.error('Erro:', err.response?.data || err.message);
    return { error: true, message: err.response?.data || err.message };
  }
}
