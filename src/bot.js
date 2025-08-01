
const { processarFluxo } = require('./fluxoConversas');
const { enviarMensagemSimples, formatarNumero } = require('./zapiService');

async function botWebhook(req, res) {
  let numeroFinal = '';
  try {
    console.log('📥 Webhook recebido!');
    console.log('📦 Dados recebidos:\n', JSON.stringify(req.body, null, 2));

    const body = req.body;

    if (!process.env.CLIENT_TOKEN || !process.env.ID_INSTANCE) {
      console.error('❌ Variáveis de ambiente ausentes');
      return res.sendStatus(500);
    }

    if (body.type !== 'ReceivedCallback') {
      console.warn('⚠️ Tipo de mensagem ignorado:', body.type);
      return res.sendStatus(200);
    }

    const remetente = body.phone;
    if (!remetente) {
      console.error('❌ Número do remetente ausente');
      return res.sendStatus(400);
    }

    numeroFinal = formatarNumero(remetente);
    const nomeCliente = body.pushName || 'Não identificado';

    let texto = '';
    let tipoEntrada = '';

    if (body?.buttonsResponseMessage?.message) {
      texto = body.buttonsResponseMessage.message;
      tipoEntrada = 'botao';
    } else if (body?.text?.message) {
      texto = body.text.message;
      tipoEntrada = 'texto';
    } else {
      console.warn('⚠️ Nenhuma mensagem útil encontrada.');
      return res.sendStatus(200);
    }

    texto = texto.toLowerCase().trim();
    console.log('💬 Entrada:', texto, '| Tipo:', tipoEntrada);

    await processarFluxo(numeroFinal, texto, tipoEntrada, nomeCliente);
    res.sendStatus(200);

  } catch (err) {
    console.error('❌ Erro no webhook:', err.message);
    if (numeroFinal) {
      try {
        await enviarMensagemSimples(numeroFinal, '❗ Ocorreu um erro. Tente novamente.');
      } catch (e) {
        console.error('❌ Falha ao enviar mensagem de erro:', e.message);
      }
    }
    res.sendStatus(500);
  }
}

module.exports = botWebhook;
