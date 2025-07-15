const { processarFluxo } = require('./fluxoConversas');
const { enviarMensagemSimples, verificarNumero } = require('./zapiService');
const formatarNumero = require('./zapiService').formatarNumero;

async function botWebhook(req, res) {
  try {
    if (!process.env.ZAPI_CLIENT_TOKEN || !process.env.ZAPI_INSTANCE) {
      console.error('❌ Variáveis ZAPI_CLIENT_TOKEN ou ZAPI_INSTANCE não definidas!');
      return res.sendStatus(500);
    }
    const body = req.body;
    console.log('✅ Webhook recebido:\n', JSON.stringify(body, null, 2));
    const remetente = body.phone || body.sender?.phone || body.message?.from;
    if (!remetente) {
      console.error('❌ Remetente não encontrado!');
      return res.sendStatus(400);
    }
    const numeroFinal = formatarNumero(remetente);
    if (!(await verificarNumero(numeroFinal))) {
      console.error('❌ Número não registrado ou sem consentimento:', numeroFinal);
      return res.sendStatus(400);
    }
    let texto = '';
    let tipoEntrada = 'texto';
    if (body.button_response?.id) {
      texto = body.button_response.id;
      tipoEntrada = 'botao';
    } else {
      texto = (body.text?.message || body.texto || '').toLowerCase().trim();
    }
    console.log('💬 Entrada:', texto, '| Tipo:', tipoEntrada);
    if (texto && numeroFinal) {
      await processarFluxo(numeroFinal, texto, tipoEntrada);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erro no webhook:', err.message);
    try {
      await enviarMensagemSimples(numeroFinal, '❗ Ocorreu um erro. Tente novamente.');
    } catch (e) {
      console.error('❌ Falha no fallback:', e.message);
    }
    res.sendStatus(500);
  }
}

module.exports = botWebhook;