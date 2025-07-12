const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes'); // Importa suas rotas

const app = express();
const PORT = process.env.PORT || 3000;

// 📦 Middlewares essenciais
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🧠 View engine (opcional, se estiver usando o dashboard)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 📁 Arquivos estáticos (se tiver)
app.use(express.static(path.join(__dirname, 'public')));

// 🔁 Rotas gerais
app.use('/', routes);

// 🚀 Inicialização do servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
