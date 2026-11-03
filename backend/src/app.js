const path = require('path');
const express = require('express');

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..', 'public'))); // frontend do Bernardo

app.use('/health', require('./routes/health'));
app.use('/api/servicos', require('./routes/servicos'));
app.use('/api/avaliacoes', require('./routes/avaliacoes'));
app.use('/api/painel', require('./routes/painel'));

app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// Tratamento central de erros: nunca expoe detalhes internos ao cliente
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido.' });
  if (err.type === 'entity.too.large') return res.status(400).json({ erro: 'Corpo da requisição grande demais.' });

  const codigo = err.code || '';
  const semBanco =
    ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'].includes(codigo) ||
    /^(08|57P0|53300)/.test(codigo) ||
    /timeout|Connection terminated/i.test(err.message || '');

  console.error(`[erro] ${req.method} ${req.path} -> ${codigo || err.message}`);
  if (semBanco) return res.status(503).json({ erro: 'Serviço temporariamente indisponível.' });
  res.status(500).json({ erro: 'Erro interno.' });
});

module.exports = app;
