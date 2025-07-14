// src/bot.js

const axios = require('axios');
require('dotenv').config();

const { processarFluxo } = require('./fluxoConversas'); // fluxo inteligente
const { enviarMensagem } = require('./zapiService');    // envio de mensagens e botões

// 👉 Formata número para o padrão da Z-API
function formatarNumero(numero) {
  if (!numero) return '';
  let num = numero.replace(/\D/g, '');

  if (num.length === 12 && num.startsWith('55')) return '55' + num.slice(2, 4) + '9' + num.slice(4);
  if (num.length === 13 && num.startsWith('55')) return num;
  if (num.length === 11) return '55' + num;
  if (num.length === 8) return '';
  if (!num.startsWith('55')) return '55' + num;

  return num;
}

// 👉 Webhook principal do bot
async function botWebhook(req, res) {
  const body = req.body;
  console.log('✅ [LOG] Webhook recebido:\n', JSON.stringify(body, null, 2));

  // Detecta o número do remetente (de forma robusta)
  const remetente =
    body.telefone || body.Telefone || body.phone || body.from ||
    body.sender?.phone || body.message?.from || null;

  if (!remetente) {
    console.error('❌ Remetente não encontrado!');
    return res.sendStatus(400);
  }

  const numeroFinal = formatarNumero(remetente);
  console.log('📞 Número formatado:', numeroFinal);

  // Detecta a mensagem e o tipo
  let texto = '';
  let tipoEntrada = 'texto'; // ou 'botao'

  if (body.button_response?.id) {
    texto = body.button_response.id;
    tipoEntrada = 'botao';
  } else {
    const textoRaw = body.texto || body.text?.mensagem || body.text?.message;
    if (typeof textoRaw === 'object' && (textoRaw.message || textoRaw.mensagem)) {
      texto = (textoRaw.message || textoRaw.mensagem).toLowerCase().trim();
    } else if (typeof textoRaw === 'string') {
      texto = textoRaw.toLowerCase().trim();
    }
  }

  console.log('💬 Entrada recebida:', texto, '| Tipo:', tipoEntrada);

  // Se mensagem e número válidos, chama o fluxo
  if (texto && numeroFinal) {
    const resposta = await processarFluxo(numeroFinal, texto, tipoEntrada);
    if (resposta?.texto) {
      await enviarMensagem(numeroFinal, resposta);
    }
  }

  res.sendStatus(200); // finaliza o webhook
}

module.exports = botWebhook;
