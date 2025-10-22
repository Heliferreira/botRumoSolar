require('dotenv').config();
const { enviarMensagemSimples } = require('./zapiService');

async function testarEnvio() {
  try {
    const numero = '5541998164599'; // Coloque seu número aqui no formato internacional
    const texto = 'Mensagem simples de teste via Z-API';

    const resposta = await enviarMensagemSimples(numero, texto);
    console.log('Resposta do envio:', resposta);
  } catch (err) {
    console.error('Erro ao enviar mensagem simples:', err);
  }
}

testarEnvio();
