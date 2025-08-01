// db.js (PostgreSQL)
const { Pool } = require('pg');

// 👉 configure aqui os dados do seu banco PostgreSQL
const pool = new Pool({
  user: 'seu_usuario',
  host: 'localhost',        // ou IP do VPS
  database: 'seu_banco',
  password: 'sua_senha',
  port: 5432,
});

// 🔧 Criação da tabela (roda automaticamente quando o projeto inicia)
async function criarTabela() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        numero TEXT,
        servico TEXT,
        valorConta INTEGER,
        vendedor TEXT,
        status TEXT,
        observacoes TEXT,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela leads verificada/criada com sucesso');
  } catch (err) {
    console.error('❌ Erro ao criar tabela leads:', err.message);
  }
}
criarTabela();

// 📥 Inserção de lead
async function salvarLead({ numero, servico, valorConta, vendedor, status = 'novo', observacoes = '' }) {
  try {
    await pool.query(
      `INSERT INTO leads (numero, servico, valorConta, vendedor, status, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [numero, servico, valorConta, vendedor, status, observacoes]
    );
    console.log('✅ Lead salvo no PostgreSQL');
  } catch (err) {
    console.error('❌ Erro ao salvar lead:', err.message);
    throw err;
  }
}

// 📤 Buscar todos os leads
async function getAllLeads() {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY data DESC');
    return result.rows;
  } catch (err) {
    console.error('❌ Erro ao buscar leads:', err.message);
    throw err;
  }
}

module.exports = {
  salvarLead,
  getAllLeads
};


module.exports = {
  salvarLead,
  getAllLeads
};
