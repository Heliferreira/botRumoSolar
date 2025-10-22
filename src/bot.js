const { processarFluxo } = require('./fluxoConversas');
const { enviarMensagemSimples, formatarNumero } = require('./zapiService');
const { getProximoVendedor } = require('./vendedorService'); // ✅ adicionado

// 🧠 Contexto global para manter estado entre mensagens
global.contexto = global.contexto || {};


module.exports = async function botWebhook(req, res) {
  let numeroFinal = '';

  try {
    console.log('🔥 Webhook recebido!');
    console.log('📩 Dados recebidos:\n', JSON.stringify(req.body, null, 2));

    const dados = req.body;
    const mensagem = dados?.data?.message || dados;

    const tipo = (
      dados?.data?.type ||
      dados?.type ||
      dados?.data?.message?.type ||
      (dados?.data?.text ? 'text' : undefined) ||
      'undefined'
    );

    const remetente =
      dados?.data?.from ||
      dados?.data?.chatId ||
      dados?.phone ||
      dados?.from ||
      '';

    const nomeCliente =
      dados?.data?.pushName ||
      dados?.pushName ||
      dados?.senderName ||
      dados?.data?.senderName ||
      'Visitante';

    if (!process.env.CLIENT_TOKEN || !process.env.ID_INSTANCE) {
      console.error('❌ Variáveis de ambiente ausentes!');
      return res.sendStatus(500);
    }

    const tiposAceitos = [
      'text',
      'button',
      'buttons_response',
      'interactive',
      'ReceivedCallback',
      'image',
      'audio',
      'video',
    ];

    if (!tiposAceitos.includes(tipo)) {
      console.warn('⚠️ Tipo de mensagem ignorado:', tipo);
      return res.sendStatus(200);
    }

    if (!remetente) {
      console.error('❌ Número do remetente ausente');
      return res.sendStatus(400);
    }

    numeroFinal = formatarNumero(remetente);

    let texto = '';
    let tipoEntrada = '';

    if (mensagem?.text?.body) {
      texto = mensagem.text.body;
      tipoEntrada = 'texto';
    } else if (mensagem?.text?.message) {
      texto = mensagem.text.message;
      tipoEntrada = 'texto';
    } else if (
      mensagem?.buttonResponseMessage?.selectedButtonId ||
      mensagem?.buttonsResponseMessage?.message
    ) {
      texto =
        mensagem?.buttonResponseMessage?.selectedButtonId ||
        mensagem?.buttonsResponseMessage?.message ||
        '';
      tipoEntrada = 'botao';


} else {
  // 🧠 Verifica se é uma mídia (foto, áudio, vídeo, documento)
  if (mensagem.type && ['image', 'video', 'audio', 'document'].includes(mensagem.type)) {
    console.log(`🎧 Mídia recebida (${mensagem.type}) de ${numeroFinal}`);

    await enviarMensagemSimples(
      numeroFinal,
      '📷 Recebi sua mídia! No momento só entendo mensagens de texto ou botões. 😊\nPor favor, envie uma opção válida do menu para continuar o atendimento.'
    );

    // 🔒 Limpa o contexto pra evitar travas
    if (global.contexto[numeroFinal]) {
      delete global.contexto[numeroFinal];
      console.log(`🧹 Contexto limpo após mídia recebida de ${numeroFinal}`);
    }

    return res.sendStatus(200);
  }

  // Se não for mídia, ignora
  console.warn('⚠️ Nenhuma mensagem útil encontrada');
  return res.sendStatus(200);
}

texto = texto.toLowerCase().trim();



// ==== TRIAGEM DA MENSAGEM (botão, texto, mídia) ====

// flags de presença
const temBotao =
  !!(mensagem?.buttonResponseMessage || mensagem?.buttonsResponseMessage);
const temTexto =
  !!(mensagem?.text?.message || mensagem?.conversation || typeof mensagem?.message === 'string');

// detecta mídia pelos campos comuns da Z-API
const tipoMidia =
  mensagem?.type ||
  (mensagem?.image && 'image') ||
  (mensagem?.audio && 'audio') ||
  (mensagem?.video && 'video') ||
  (mensagem?.document && 'document') ||
  (mensagem?.sticker && 'sticker') ||
  null;


if (temBotao) {
  // BOTÃO
  texto =
    mensagem?.buttonResponseMessage?.selectedButtonId ||
    mensagem?.buttonsResponseMessage?.message ||
    '';
  tipoEntrada = 'botao';

} else if (temTexto) {
  // TEXTO
  texto =
    mensagem?.text?.message ||
    mensagem?.conversation ||
    mensagem?.message ||
    '';
  tipoEntrada = 'texto';

} else if (
  mensagem?.image ||
  mensagem?.audio ||
  mensagem?.video ||
  mensagem?.document ||
  mensagem?.sticker
) {
  let tipoMidia = 'mídia';
  if (mensagem.image) tipoMidia = 'imagem';
  if (mensagem.audio) tipoMidia = 'áudio';
  if (mensagem.video) tipoMidia = 'vídeo';
  if (mensagem.document) tipoMidia = 'documento';
  if (mensagem.sticker) tipoMidia = 'figura';

  console.log(`🎧 ${tipoMidia} recebida de ${numeroFinal}`);

  await enviarMensagemSimples(
    numeroFinal,
    `📷 Recebi sua ${tipoMidia}! No momento só entendo mensagens de texto ou botões. 😊\nPor favor, envie uma opção válida do menu para continuar o atendimento.`
  );

  if (global.contexto?.[numeroFinal]) {
    delete global.contexto[numeroFinal];
    console.log(`🧹 Contexto limpo após ${tipoMidia} recebida de ${numeroFinal}`);
  }

  return res.sendStatus(200);

} else {
  console.warn('⚠️ Nenhuma mensagem útil encontrada');
  return res.sendStatus(200);
}



// só chega aqui se for texto ou botão
texto = (texto || '').toLowerCase().trim();



// 🧠 Continua o fluxo do bot normalmente
await processarFluxo(numeroFinal, texto, tipoEntrada, nomeCliente, global.contexto);

res.sendStatus(200);


  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.sendStatus(500);
  }
};
