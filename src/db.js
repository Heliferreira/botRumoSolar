// db.js — conexão e manipulação do banco de dados PostgreSQL com controle de duplicação
require('dotenv').config();
const { Pool } = require('pg');

// 🔒 Evita duplicação do código de conexão e criação de tabelas
if (global._dbIniciado) {
  module.exports = global._dbPool;
  return;
}
global._dbIniciado = true;

// 🔗 Conexão com o banco PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: false
});

// 🧱 Criação das tabelas (executa apenas uma vez)
async function criarTabelas() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        numero TEXT NOT NULL,
        servico TEXT NOT NULL,
        valorConta INTEGER DEFAULT 0,
        vendedor TEXT,
        status TEXT DEFAULT 'novo',
        observacoes TEXT,
        lead_enviado BOOLEAN DEFAULT FALSE,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela "leads" verificada/criada com sucesso');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS estado_fila (
        id SERIAL PRIMARY KEY,
        nome TEXT,
        prioridade INTEGER
      );
    `);
    console.log('✅ Tabela "estado_fila" verificada/criada com sucesso');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS consultores (
        id SERIAL PRIMARY KEY,
        nome TEXT,
        numero TEXT,
        ativo BOOLEAN DEFAULT TRUE
      );
    `);
    console.log('✅ Tabela "consultores" verificada/criada com sucesso');

    console.log('\n🚀 Bot RumoSolar iniciado e conectado ao banco PostgreSQL com sucesso!');
    console.log('📡 Aguardando mensagens do WhatsApp...\n');
  } catch (err) {
    console.error('❌ Erro ao criar/verificar tabelas:', err.message);
  }
}

// 🚀 Executa apenas uma vez (quando o módulo é carregado)
(async () => {
  if (!global._tabelasCriadas) {
    global._tabelasCriadas = true;
    await criarTabelas();
  }
})();

// 🔍 Função: buscar todos os leads
async function getAllLeads() {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY data DESC');
    return result.rows;
  } catch (err) {
    console.error('❌ Erro ao buscar leads:', err.message);
    return [];
  }
}

// 💾 Função: salvar lead com proteção contra duplicação
async function salvarLead({
  numero,
  servico,
  valorConta = 0,
  vendedor = null,
  status = 'novo',
  observacoes = ''
}) {
  try {
    // 🔍 Verifica se já existe um lead marcado como enviado
    const existe = await pool.query(
      'SELECT id FROM leads WHERE numero = $1 AND lead_enviado = true',
      [numero]
    );

    if (existe.rowCount > 0) {
      console.log(`⚠️ Lead ${numero} já está cadastrado com lead_enviado = true. Ignorando duplicação.`);
      return;
    }

    // 💾 Insere o novo lead com lead_enviado = true
    const query = `
      INSERT INTO leads (numero, servico, valorConta, vendedor, status, observacoes, lead_enviado)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id;
    `;
    const params = [numero, servico, valorConta, vendedor, status, observacoes];
    const result = await pool.query(query, params);

    console.log(`✅ Lead salvo com sucesso (ID: ${result.rows[0].id})`);
    return result.rows[0];

  } catch (err) {
    console.error('❌ Erro ao salvar lead:', err.message);
    throw err;
  }
}

// 🔁 Exporta tudo
global._dbPool = pool;
module.exports = { pool, getAllLeads, salvarLead };
