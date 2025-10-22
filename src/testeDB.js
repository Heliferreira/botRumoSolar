const { salvarLead, getAllLeads } = require('./db');

async function teste() {
  try {
    console.log('Inserindo lead de teste...');
    await salvarLead({
      numero: '5511999999999',
      servico: 'Teste de serviço',
      valorConta: 100,
      vendedor: 'Teste',
      status: 'novo',
      observacoes: 'Lead inserido via script de teste'
    });

    console.log('Consultando leads...');
    const leads = await getAllLeads();
    console.log('Leads encontrados:', leads);

  } catch (error) {
    console.error('Erro no teste:', error.message || error);
  }
}

teste();
