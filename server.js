require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const botWebhook = require('./bot'); // webhook principal

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rota principal do webhook (usada pela Z-API)
app.post('/webhook', botWebhook);

// Rota de teste simples
app.get('/', (req, res) => {
  res.send('✅ Bot Rumo Solar rodando com sucesso!');
});

// Inicializa servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

