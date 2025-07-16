const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
console.log("🔍 Variáveis de ambiente carregadas:");
console.log("ID_INSTANCE:", process.env.ID_INSTANCE);
console.log("CLIENT_TOKEN:", process.env.CLIENT_TOKEN);


const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { getAllLeads } = require('./db');


const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(routes);

app.get('/', async (req, res) => {
  try {
    const leads = await getAllLeads();
    res.render('dashboard', { leads });
  } catch (error) {
    console.error('❌ Erro no dashboard:', error);
    res.status(500).send('Erro ao carregar os leads.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
