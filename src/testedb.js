const { salvarLead, getAllLeads } = require('./db');

async function testarDB() {
  try {
    // Simula um lead de teste
    const novoLead = {
      numero: '5541999999999',
      servico: 'energia',
      valorConta: 350,
      vendedor: 'Helivelton',
      status: 'novo',
      observacoes: 'Lead de teste gerado pelo script.'
    };

    // Tenta salvar o lead
    const id = await salvarLead(novoLead);
    console.log(`✅ Lead salvo com sucesso! ID: ${id}`);

    // Busca todos os leads
    const leads = await getAllLeads();
    console.log('\n📋 Lista de leads cadastrados:');
    console.table(leads);

  } catch (erro) {
    console.error('❌ Erro ao salvar lead:', erro.message);
  }
}

testarDB();
