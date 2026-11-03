const router = require('express').Router();
const db = require('../db');

const iniciadoEm = new Date().toISOString(); // muda a cada reinicio (prova de persistencia)

router.get('/', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', banco: 'conectado', iniciado_em: iniciadoEm });
  } catch (e) {
    console.error('health: falha ao consultar o banco:', e.code || e.message);
    res.status(503).json({ status: 'erro', banco: 'indisponivel', iniciado_em: iniciadoEm });
  }
});

module.exports = router;
