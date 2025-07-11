require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');
const { getAllLeads } = require('./db');


const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public'))); // Se tiver pasta public depois

// Body parser
app.use(bodyParser.json());

// Usa rotas (incluindo /webhook e /dashboard)
app.use(routes);

// Rota inicial redireciona pro dashboard
app.get('/', async (req, res) => {
  try {
    const leads = await getAllLeads();
    res.render('dashboard', { leads });
  } catch (error) {
    console.error('Erro ao carregar leads:', error);
    res.status(500).send('Erro ao carregar os leads.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
