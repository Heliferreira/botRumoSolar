require('dotenv').config();
const axios = require('axios');

// 📦 Configuração base da Z-API
function getApiConfig() {
  const instanceId = process.env.ID_INSTANCE;
  const tokenInstancia = process.env.TOKEN_DA_INSTANCIA;
  const clientToken = process.env.CLIENT_TOKEN;

  if (!instanceId || !tokenInstancia || !clientToken) {
    throw new Error('❌ Variáveis de ambiente ausentes no .env!');
  }

  const baseUrl = `https://api.z-api.io/instances/${instanceId}/token/${tokenInstancia}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Client-Token': clientToken,
  };

  return { baseUrl, headers };
}

// 🌎 Formatar número no padrão internacional completo (para Z-API)
function formatarNumero(numero) {
  if (!numero) return '';
  let num = numero.toString().replace(/\D/g, ''); // remove tudo que não é número

  // Garante o código do país (55)
  if (!num.startsWith('55')) num = '55' + num;

  // Adiciona o sufixo @c.us exigido pela Z-API
  if (!num.endsWith('@c.us')) num = `${num}@c.us`;

  console.log('🔢 Número final formatado:', num);
  return num;
}


// 📦 Configuração base
function getApiConfig() {
  const instanceId = process.env.ID_INSTANCE;
  const tokenInstancia = process.env.TOKEN_DA_INSTANCIA;
  const clientToken = process.env.CLIENT_TOKEN;

  if (!instanceId || !tokenInstancia || !clientToken) {
    throw new Error('❌ Variáveis de ambiente ausentes no .env!');
  }

  const baseUrl = `https://api.z-api.io/instances/${instanceId}/token/${tokenInstancia}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Client-Token': clientToken,
  };

  return { baseUrl, headers };
}

// 💬 Enviar mensagem de texto simples
async function enviarMensagemSimples(numero, texto) {
  try {
    if (!numero || !texto) throw new Error('Número ou texto ausente.');
    const { baseUrl, headers } = getApiConfig();
    const url = `${baseUrl}/send-text`;

    const response = await axios.post(url, { phone: formatarNumero(numero), message: texto }, { headers });
    console.log('✅ Mensagem de texto enviada:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem simples:', err.response?.data || err.message);
    return { error: true, message: err.message };
  }
}

// 🔘 Enviar mensagem com botões
async function enviarMensagemComBotoes(numero, mensagem, botoes) {
  try {
    if (!numero || !mensagem || !Array.isArray(botoes) || botoes.length === 0)
      throw new Error('Dados inválidos para enviar botões.');

    const { baseUrl, headers } = getApiConfig();
    const url = `${baseUrl}/send-button-list`;

    const payload = {
      phone: formatarNumero(numero),
      message: mensagem,
      buttonList: {
        buttons: botoes.map((b, i) => ({ id: String(i + 1), label: b })),
      },
    };

    const response = await axios.post(url, payload, { headers });
    console.log('✅ Mensagem com botões enviada:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem com botões:', err.response?.data || err.message);
    return { error: true, message: err.message };
  }
}

// 🖼️ Enviar imagem (com legenda opcional)
async function enviarImagem(numero, urlImagem, legenda = '') {
  try {
    if (!numero || !urlImagem) throw new Error('Número ou URL da imagem ausente.');
    const { baseUrl, headers } = getApiConfig();
    const url = `${baseUrl}/send-image`;

    const payload = {
      phone: formatarNumero(numero),
      image: urlImagem,
      caption: legenda,
    };

    const response = await axios.post(url, payload, { headers });
    console.log('🖼️ Imagem enviada com sucesso:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ Erro ao enviar imagem:', err.response?.data || err.message);
    return { error: true, message: err.message };
  }
}

// 📄 Enviar arquivo PDF/documento (com nome e legenda opcionais)
async function enviarArquivo(numero, urlArquivo, nomeArquivo = 'documento.pdf', legenda = '') {
  try {
    if (!numero || !urlArquivo) throw new Error('Número ou URL do arquivo ausente.');
    const { baseUrl, headers } = getApiConfig();
    const url = `${baseUrl}/send-document`;

    const payload = {
      phone: formatarNumero(numero),
      document: urlArquivo,
      fileName: nomeArquivo,
      caption: legenda,
    };

    const response = await axios.post(url, payload, { headers });
    console.log('📄 Arquivo enviado com sucesso:', response.data);
    return response.data;
  } catch (err) {
    console.error('❌ Erro ao enviar arquivo:', err.response?.data || err.message);
    return { error: true, message: err.message };
  }
}

// 🧠 Enviar mensagem de fallback (segurança)
async function enviarFallback(numero, motivo = 'erro_desconhecido') {
  const mensagem =
    motivo === 'erro_desconhecido'
      ? '⚠️ Ocorreu um problema ao processar sua solicitação. Tente novamente em alguns instantes.'
      : '⚠️ Sistema temporariamente indisponível.';
  return enviarMensagemSimples(numero, mensagem);
}

module.exports = {
  enviarMensagemSimples,
  enviarMensagemComBotoes,
  enviarImagem,
  enviarArquivo,
  enviarFallback,
  formatarNumero,
};
