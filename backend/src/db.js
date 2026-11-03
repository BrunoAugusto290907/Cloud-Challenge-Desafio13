const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // vem do ambiente, nunca do codigo
  ssl: process.env.DATABASE_SSL === 'false' ? false : true,
  connectionTimeoutMillis: 5000,
  max: 5,
});

pool.on('error', (e) => console.error('Erro no pool do banco:', e.code || e.message));

module.exports = { query: (texto, params) => pool.query(texto, params), pool };
