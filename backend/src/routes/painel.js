
const router = require('express').Router();
const db = require('../db');
const { idValido } = require('../validacao');

const MIN_AMOSTRA = 3;

const SQL = `
  SELECT
    s.id AS servico_id,
    s.nome,
    COUNT(a.id)::int AS quantidade,
    ROUND(AVG(a.nota)::numeric, 1) AS media,
    COUNT(*) FILTER (WHERE a.nota = 1)::int AS n1,
    COUNT(*) FILTER (WHERE a.nota = 2)::int AS n2,
    COUNT(*) FILTER (WHERE a.nota = 3)::int AS n3,
    COUNT(*) FILTER (WHERE a.nota = 4)::int AS n4,
    COUNT(*) FILTER (WHERE a.nota = 5)::int AS n5
  FROM servicos s
  LEFT JOIN avaliacoes a ON a.servico_id = s.id
  WHERE ($1::int IS NULL OR s.id = $1)
  GROUP BY s.id, s.nome
  ORDER BY s.nome
`;

function formatar(resultado) {
  const insuficiente = resultado.quantidade < MIN_AMOSTRA;

  return {
    servico_id: resultado.servico_id,
    nome: resultado.nome,
    quantidade: resultado.quantidade,
    amostra_insuficiente: insuficiente,
    media: insuficiente ? null : Number(resultado.media),
    distribuicao: {
      1: resultado.n1,
      2: resultado.n2,
      3: resultado.n3,
      4: resultado.n4,
      5: resultado.n5
    }
  };
}

// GET /api/painel
router.get('/', async (req, res) => {
  const { rows } = await db.query(SQL, [null]);
  res.json(rows.map(formatar));
});

// GET /api/painel/:servicoId
router.get('/:servicoId', async (req, res) => {
  if (!idValido(req.params.servicoId)) {
    return res.status(400).json({
      erro: 'ID do serviço inválido.'
    });
  }

  const { rows } = await db.query(SQL, [
    Number(req.params.servicoId)
  ]);

  if (rows.length === 0) {
    return res.status(404).json({
      erro: 'Serviço não encontrado.'
    });
  }

  res.json(formatar(rows[0]));
});

module.exports = router;
