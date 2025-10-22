const { pool } = require('./db');

// 🧩 Função para pegar a lista de vendedores ativos
async function getVendedoresAtivos() {
  try {
    const res = await pool.query('SELECT * FROM consultores WHERE ativo = true ORDER BY id ASC');
    console.log("🧪 Vendedores ativos lidos do banco:", res.rows);
    return res.rows;
  } catch (err) {
    console.error("❌ Erro ao buscar vendedores ativos:", err.message);
    return [];
  }
}

// 🔹 Função para obter o índice atual da fila
async function getIndiceFila() {
  const res = await pool.query("SELECT valor FROM estado_fila WHERE chave = 'indice_fila'");
console.log('📋 Resultado da query consultores:', res.rows);
  if (res.rows.length === 0) {
    console.log("⚙️ Nenhum índice de fila encontrado. Criando valor inicial (0)...");
    await pool.query("INSERT INTO estado_fila (chave, valor) VALUES ('indice_fila', 0)");
    return 0;
  }
  return res.rows[0].valor;
}

// 🔹 Função para atualizar o índice da fila
async function setIndiceFila(novoIndice) {
  await pool.query("UPDATE estado_fila SET valor = $1 WHERE chave = 'indice_fila'", [novoIndice]);
}

// 🔹 Função principal: retorna o próximo vendedor ativo
async function getProximoVendedor() {
  const vendedores = await getVendedoresAtivos();

  // Caso não haja vendedores ativos
  if (vendedores.length === 0) {
    console.log("⚠️ Nenhum vendedor ativo encontrado no momento!");
    return null; // Evita erro fatal
  }

  // Caso haja apenas um vendedor ativo
  if (vendedores.length === 1) {
    console.log(`✅ Apenas um vendedor ativo (${vendedores[0].nome}). Retornando ele diretamente.`);
    return vendedores[0];
  }

  // Caso haja mais de um ativo → segue a lógica da fila
  let indiceAtual = await getIndiceFila();
  const vendedor = vendedores[indiceAtual % vendedores.length];

  console.log(`🎯 Vendedor selecionado: ${vendedor.nome} (índice ${indiceAtual})`);

  // Atualiza índice para o próximo da fila
  const novoIndice = (indiceAtual + 1) % vendedores.length;
  await setIndiceFila(novoIndice);

  console.log(`🔄 Fila atualizada. Próximo índice será ${novoIndice}.`);

  return vendedor;
}

module.exports = {
  getVendedoresAtivos,
  getProximoVendedor,
};
