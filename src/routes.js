// src/routes.js
const express = require('express');
const router = express.Router();
const botWebhook = require('./bot'); // importar função do bot
const { getAllLeads } = require('./db'); // se tiver

// 🧠 Dashboard de leads (GET)
router.get('/dashboard', async (req, res) => {
  try {
    const leads = await getAllLeads();
    res.render('dashboard', { leads });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    res.status(500).send('Erro ao carregar painel');
  }
});

// 🤖 Webhook da Z-API (POST)
router.post('/webhook', botWebhook);

module.exports = router;
