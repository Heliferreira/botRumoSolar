const express = require('express');
const router = express.Router();
const bot = require('./bot');
const { insertLead, getAllLeads } = require('./db');

// POST /mensagem
router.post('/mensagem', async (req, res) => {
  const { mensagem, nome } = req.body;
 const agora = new Date();
const dataAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')} ${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}:${String(agora.getSeconds()).padStart(2, '0')}`;



  try {
    const resposta = await bot.responder(mensagem, nome);

    if (resposta.dados) {
      await insertLead({
        nome,
        mensagemOriginal: mensagem,
        valorConta: resposta.dados.valorConta,
        consumoEstimado: resposta.dados.consumo,
        economiaMensal: resposta.dados.economiaMes,
        economiaAnual: resposta.dados.economiaAno,
        data: dataAtual
      });
    }

    res.json({ resposta: resposta.texto });
  } catch (err) {
    console.error('Erro ao processar mensagem:', err.message);
    res.status(500).json({ erro: 'Erro interno' });
  }
});

// GET /dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const leads = await getAllLeads();
    res.render('dashboard', { leads });
  } catch (err) {
    console.error('Erro ao buscar leads:', err.message);
    res.status(500).send('Erro ao carregar o painel');
  }
});

module.exports = router;
