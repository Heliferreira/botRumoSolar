const axios = require('axios');
require('dotenv').config();

const { processarFluxo } = require('./fluxoConversas'); // fluxo inteligente
const { enviarMensagemSimples } = require('./zapiService'); // usado só no catch

function formatarNumero(numero) {
  if (!numero) return '';
  let num = numero.replace(/\D/g, '');

  if (num.length === 12 && num.startsWith('55')) return '55' + num.slice(2, 4) + '9' + num.slice(4);
  if (num.length === 13 && num.startsWith('55')) return num;
  if (num.length === 11) return '55' + num;
  if (!num.startsWith('55')) return '55' + num;

  return num;
}

async function botWebhook(req, res) {
  try {
    const body = req.body;
    console.log('✅ Webhook recebido:\n', JSON.stringify(body, null, 2));

    const remetente =
      body.telefone ||
      body.Telefone ||
      body.phone ||
      body.from ||
      body.sender?.phone ||
      body.message?.from;

    if (!remetente) {
      console.error('❌ Remetente não encontrado!');
      return res.sendStatus(400);
    }

    const numeroFinal = formatarNumero(remetente);
    console.log('📞 Número formatado:', numeroFinal);

    // Detecta a mensagem e o tipo:
    let texto = '';
    let tipoEntrada = 'texto';

    if (body.button_response?.id) {
      texto = body.button_response.id;
      tipoEntrada = 'botao';
    } else {
      const textoRaw =
        body.texto || body.text?.mensagem || body.text?.message;

      if (typeof textoRaw === 'object' && (textoRaw.message || textoRaw.mensagem)) {
        texto = (textoRaw.message || textoRaw.mensagem).toLowerCase().trim();
      } else if (typeof textoRaw === 'string') {
        texto = textoRaw.toLowerCase().trim();
      }
    }

    console.log('💬 Entrada recebida:', texto, '| Tipo:', tipoEntrada);

    // Chama o fluxo, que já se encarrega de responder
    if (texto && numeroFinal) {
      console.log('⚡️Mensagem recebida, executando o fluxo...');
      await processarFluxo(numeroFinal, texto, tipoEntrada);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erro ao processar webhook:', err.message);
    try {
      await enviarMensagemSimples(numeroFinal, '❗ Ocorreu um erro. Tente novamente mais tarde.');
    } catch (e) {
      console.error('❌ Falha ao enviar mensagem de erro:', e.message);
    }
    res.sendStatus(500);
  }
}

module.exports = botWebhook;
