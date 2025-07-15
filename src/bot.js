const { processarFluxo } = require('./fluxoConversas');
const { enviarMensagemSimples, verificarNumero, formatarNumero } = require('./zapiService');

async function botWebhook(req, res) {
  let numeroFinal = ''; // Declara fora do try para usar no catch
  try {
    // 🧪 LOG DE DEBUG
    console.log('📥 Webhook chegou!');
    console.log('📦 Dados recebidos:\n', JSON.stringify(req.body, null, 2));

    // 🔐 Verificação de variáveis de ambiente
    if (!process.env.ZAPI_CLIENT_TOKEN || !process.env.ZAPI_INSTANCE) {
      console.error('❌ Variáveis ZAPI_CLIENT_TOKEN ou ZAPI_INSTANCE não definidas!');
      return res.sendStatus(500);
    }

    const body = req.body;

    // ✅ CAPTURA DO REMETENTE
    const remetente = body?.phone;
    if (!remetente) {
      console.error('❌ Remetente não encontrado!');
      return res.sendStatus(400);
    }

    numeroFinal = formatarNumero(remetente);

    // ⚠️ Verificação do número (desativada para testes)
    // if (!(await verificarNumero(numeroFinal))) {
    //   console.error('❌ Número não registrado ou sem consentimento:', numeroFinal);
    //   return res.sendStatus(400);
    // }

    // ✅ CAPTURA DO TEXTO OU ID DO BOTÃO
    let texto = '';
    let tipoEntrada = 'texto';

    if (body.button_response?.id) {
      texto = body.button_response.id;
      tipoEntrada = 'botao';
    } else {
      texto =
        body?.text?.message ||
        body?.messages?.[0]?.text?.body ||
        '';
      texto = texto.toLowerCase().trim();
    }

    console.log('💬 Entrada:', texto, '| Tipo:', tipoEntrada);

    // ✅ PROCESSAMENTO DO FLUXO
    if (texto && numeroFinal) {
      await processarFluxo(numeroFinal, texto, tipoEntrada);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erro no webhook:', err.message);

    try {
      if (numeroFinal) {
        await enviarMensagemSimples(numeroFinal, '❗ Ocorreu um erro. Tente novamente.');
      }
    } catch (e) {
      console.error('❌ Falha ao enviar mensagem de erro:', e.message);
    }

    res.sendStatus(500);
  }
}

module.exports = botWebhook;
