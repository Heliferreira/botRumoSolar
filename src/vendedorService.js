const { pool } = require('./db');

// Buscar índice atual da fila
async function carregarEstado() {
  const res = await pool.query("SELECT valor FROM estado_fila WHERE chave = 'ultimoIndex'");
  return res.rows[0]?.valor ?? -1;
}

// Atualizar índice da fila
async function salvarEstado(novoIndex) {
  await pool.query(`
    INSERT INTO estado_fila (chave, valor)
    VALUES ('ultimoIndex', $1)
    ON CONFLICT (chave) DO UPDATE SET valor = $1
  `, [novoIndex]);
}

// Buscar o próximo consultor ativo da fila
async function getProximoVendedor() {
  const consultoresAtivos = await pool.query("SELECT * FROM consultores WHERE ativo = true ORDER BY id");
  const lista = consultoresAtivos.rows;

  if (lista.length === 0) throw new Error('Nenhum consultor ativo disponível.');

  const ultimoIndex = await carregarEstado();
  const proximoIndex = (ultimoIndex + 1) % lista.length;

  await salvarEstado(proximoIndex);
  return lista[proximoIndex];
}

module.exports = {
  getProximoVendedor
};
