// src/server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');

const app = express();

// Configura o EJS como view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Permite usar arquivos estáticos como CSS, imagens, JS
app.use(express.static(path.join(__dirname, 'public')));

// Permite o uso de JSON no corpo das requisições
app.use(bodyParser.json());

// Usa as rotas definidas no routes.js
app.use(routes);

// Sobe o servidor na porta 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
