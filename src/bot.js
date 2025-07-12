const axios = require('axios');
require('dotenv').config();

// Função de resposta automática
async function responder(mensagem, nome = 'amigo') {
  const msg = mensagem.toLowerCase();

  if (msg.includes('oi') || msg.includes('olá')) {
    return {
      texto: `Olá, ${nome}! 😄 Seja muito bem-vindo(a) à nossa central de atendimento.

Somos especialistas em *Energia Solar*, mas também oferecemos:

🔌 Iluminação & Elétrica  
🏠 Automação de Ambientes  
📹 Segurança (Câmeras, Alarmes, Interfones)  
⚡ Carregadores para Veículos Elétricos

Como posso te ajudar hoje?`
    };
  }

  if (msg.includes('orçamento') || msg.includes('valor') || msg.includes('preço')) {
    return {
      texto: `Perfeito, ${nome}! Para te passar um orçamento mais certeiro, me diga:

📍 Sua cidade  
💡 O valor médio da sua conta de luz  
🏠 E o tipo de imóvel (residência, comércio, rural, etc.)`
    };
  }

  const match = msg.match(/(\d{2,5})\s*(reais|r\$)?/);
  if (match) {
    const valorConta = parseInt(match[1]);
    const consumo = Math.round(valorConta / 1.0);
    const economiaMes = Math.round(valorConta * 0.95);
    const economiaAno = economiaMes * 12;

    return {
      texto: `📊 Simulação com base na sua conta de luz:

💰 Conta atual: R$${valorConta}  
⚡ Consumo estimado: ${consumo} kWh/mês  
🔋 Economia estimada com energia solar:  
→ R$${economiaMes}/mês  
→ R$${economiaAno}/ano

Incrível, né? 😍 Quer que eu te mostre como montar esse sistema aí na sua casa ou empresa?`,
      dados: { valorConta, consumo, economiaMes, economiaAno }
    };
  }

  if (msg.includes('obrigado') || msg.includes('valeu')) {
    return { texto: `Tamo junto, ${nome}! Qualquer coisa, é só me chamar. 🤝` };
  }

  return { texto: `Não entendi muito bem, ${nome}. Pode me explicar de novo com outras palavras? Estou aqui pra te ajudar! 😉` };
}

// Enviar mensagem pela Z-API
async function enviarMensagem(remetente, mensagem) {
  const instanceId = process.env.ZAPI_INSTANCE;
  const token = process.env.ZAPI_TOKEN;

  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;

  try {
    await axios.post(url, {
      phone: remetente,
      message: mensagem
    }, {
      headers: {
        // Esse é o segredo que você acabou de gerar
        'Client-Token': process.env.ZAPI_CLIENT_TOKEN
      }
    });
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error.response?.data || error.message);
  }
}


// Middleware do webhook
async function botWebhook(req, res) {
  const body = req.body;
  console.log('📥 Webhook recebido:', JSON.stringify(body, null, 2));

  // Tenta pegar texto e remetente em diferentes estruturas
  const texto =
    body.texto?.mensagem ||
    body.message?.text?.body ||
    body.message?.body ||
    null;

  const remetente =
    body.telefone ||
    body.sender?.phone ||
    body.message?.from ||
    null;

  const nome = body.senderName || body.chatName || 'amigo';

  if (texto && remetente) {
    const resposta = await responder(texto, nome);

    if (resposta?.texto) {
      await enviarMensagem(remetente, resposta.texto);
    }
  }

  res.sendStatus(200);
}

module.exports = botWebhook;
