
const express = require('express');
const path = require('path');

const app = express();

app.use(express.json({ limit: '10kb' }));

// Disponibiliza os arquivos HTML, CSS e JavaScript
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rotas da API
app.use('/health', require('./routes/health'));
app.use('/api/servicos', require('./routes/servicos'));
app.use('/api/avaliacoes', require('./routes/avaliacoes'));
app.use('/api/painel', require('./routes/painel'));

// Tratamento de erros
app.use((erro, req, res, next) => {
  console.error('Erro na API:', erro.message);

  res.status(500).json({
    erro: 'Erro interno do servidor.'
  });
});

module.exports = app;
