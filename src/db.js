const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'leads.db');
const db = new sqlite3.Database(dbPath);

// Criação da tabela se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    mensagemOriginal TEXT,
    valorConta INTEGER,
    consumoEstimado INTEGER,
    economiaMensal INTEGER,
    economiaAnual INTEGER,
    data TEXT
  )
`);

function insertLead(lead) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO leads (nome, mensagemOriginal, valorConta, consumoEstimado, economiaMensal, economiaAnual, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      lead.nome,
      lead.mensagemOriginal,
      lead.valorConta,
      lead.consumoEstimado,
      lead.economiaMensal,
      lead.economiaAnual,
      lead.data,
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
    stmt.finalize();
  });
}

function getAllLeads() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM leads ORDER BY data DESC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  insertLead,
  getAllLeads
};
