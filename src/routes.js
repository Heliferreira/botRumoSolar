const express = require('express');
const router = express.Router();
const { getAllLeads } = require('./db');
const botWebhook = require('./bot'); // novo!

router.get('/dashboard', async (req, res) => {
  try {
    const leads = await getAllLeads();
    res.render('dashboard', { leads });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    res.status(500).send('Erro ao carregar painel');
  }
});

// Rota de Webhook da Z-API
router.post('/webhook', botWebhook); // agora chama o middleware do bot

module.exports = router;
