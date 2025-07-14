const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'leads.db');
const db = new sqlite3.Database(dbPath);

// Criação da tabela com campos de CRM
db.run(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT,
    servico TEXT,
    valorConta INTEGER,
    vendedor TEXT,
    status TEXT,
    observacoes TEXT,
    data TEXT
  )
`);

// Inserção de lead
function salvarLead({ numero, servico, valorConta, vendedor, status = 'novo', observacoes = '' }) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO leads (numero, servico, valorConta, vendedor, status, observacoes, data)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    db.run(sql, [numero, servico, valorConta, vendedor, status, observacoes], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

// Buscar todos os leads
function getAllLeads() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM leads ORDER BY data DESC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  salvarLead,
  getAllLeads
};
