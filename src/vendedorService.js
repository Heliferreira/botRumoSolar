// src/vendedorService.js
const fs = require('fs');
const path = require('path');

const vendedores = [
 
  { nome: 'Heli Ferreira', numero: '5541987285450' },// substitua pelo seu número real
  { nome: 'Ana', numero: '5511988880002' },
  { nome: 'Carlos', numero: '5511977770003' },
];

const statePath = path.join(__dirname, 'ultimoVendedor.json');

function carregarEstado() {
  try {
    const raw = fs.readFileSync(statePath);
    return JSON.parse(raw);
  } catch (err) {
    return { ultimoIndex: -1 };
  }
}

function salvarEstado(index) {
  fs.writeFileSync(statePath, JSON.stringify({ ultimoIndex: index }));
}

async function getProximoVendedor() {
  const estado = carregarEstado();
  const proximoIndex = (estado.ultimoIndex + 1) % vendedores.length;
  salvarEstado(proximoIndex);
  return vendedores[proximoIndex];
}

module.exports = {
  getProximoVendedor
};
