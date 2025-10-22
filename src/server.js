require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const routes = require('./routes.js');
const { getAllLeads } = require('./db');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use('/', routes);

app.get('/', async (req, res) => {
  try {
    const status = req.query.status || '';
    const leads = await getAllLeads();
    res.render('dashboard', { leads, filtroStatus: status });
  } catch (error) {
    console.error('❌ Erro no dashboard:', error);
    res.status(500).send('Erro ao carregar os leads.');
  }
});

const PORT = process.env.PORT || 3000;

app.get('/teste', (req, res) => {
  res.send('Servidor está respondendo!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

