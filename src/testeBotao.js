require('dotenv').config();
const axios = require('axios');

async function testeEnvioBotao() {
  const instanceId = process.env.ID_INSTANCE;
  const token = process.env.TOKEN_DA_INSTANCIA;
  const clientToken = process.env.CLIENT_TOKEN;

  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-button-list`;

  const payload = {
    phone: '5541998164599', // substitua pelo seu número
    message: 'Teste simples com botão',
    buttonList: {
      buttons: [
        { id: '1', label: 'Ok' }
      ]
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': clientToken,
      }
    });
    console.log('✅ Resposta Z-API:', response.data);
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem com botão:', err.response?.data || err.message);
  }
}

testeEnvioBotao();
