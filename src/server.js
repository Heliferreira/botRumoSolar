<!-- src/views/dashboard.ejs -->
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Painel de Leads</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
  <div class="container mt-5">
    <h2 class="mb-4">📋 Painel de Leads</h2>

    <table class="table table-bordered table-striped">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Mensagem</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        <% leads.forEach((lead) => { %>
          <tr>
            <td><%= lead.id %></td>
            <td><%= lead.nome %></td>
            <td><%= lead.mensagem %></td>
            <td><%= lead.data %></td>
          </tr>
        <% }) %>
      </tbody>
    </table>
  </div>
</body>
</html>
