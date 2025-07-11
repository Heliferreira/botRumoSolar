const express = require('express');
const router = express.Router();
const { getAllLeads } = require('./db');

// Rota principal só para teste rápido
//router.get('/', (req, res) => {
//  res.send('Bot Rumo Solar rodando!');
//});

// Rota do painel de leads
router.get('/dashboard', async (req, res) => {
  try {
    const leads = await getAllLeads();   // busca os dados do banco
    res.render('dashboard', { leads });  // envia os leads para o EJS
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    res.status(500).send('Erro ao carregar painel');
  }
});

module.exports = router;
