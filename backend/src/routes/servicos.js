const router = require('express').Router();
const db = require('../db');
const { idValido } = require('../validacao');

// Lista os servicos avaliados (carregados pelo script de dados iniciais)
router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT id, nome FROM servicos ORDER BY nome');
  res.json(rows);
});

// Lista PUBLICA de comentarios: nao mostra comentarios ocultos
router.get('/:id/avaliacoes', async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ erro: 'id do serviço inválido.' });
  const id = Number(req.params.id);

  const servico = await db.query('SELECT id, nome FROM servicos WHERE id = $1', [id]);
  if (servico.rowCount === 0) return res.status(404).json({ erro: 'Serviço não encontrado.' });

  const { rows } = await db.query(
    `SELECT id, nota, comentario, criada_em
       FROM avaliacoes
      WHERE servico_id = $1 AND oculta = false AND comentario IS NOT NULL
      ORDER BY criada_em DESC`,
    [id]
  );
  res.json({ servico: servico.rows[0], avaliacoes: rows });
});

module.exports = router;
