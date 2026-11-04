const router = require('express').Router();
const db = require('../db');
const { idValido } = require('../validacao');

const MIN_AMOSTRA = 3; // regra central: menos de 3 avaliacoes => "amostra insuficiente"

// A media e as contagens consideram TODAS as notas, inclusive de comentarios ocultos.
const SQL = `
  SELECT s.id AS servico_id,
         s.nome,
         COUNT(a.id)::int                          AS quantidade,
         ROUND(AVG(a.nota)::numeric, 1)            AS media,
         COUNT(*) FILTER (WHERE a.nota = 1)::int   AS n1,
         COUNT(*) FILTER (WHERE a.nota = 2)::int   AS n2,
         COUNT(*) FILTER (WHERE a.nota = 3)::int   AS n3,
         COUNT(*) FILTER (WHERE a.nota = 4)::int   AS n4,
         COUNT(*) FILTER (WHERE a.nota = 5)::int   AS n5
    FROM servicos s
    LEFT JOIN avaliacoes a ON a.servico_id = s.id
   WHERE ($1::int IS NULL OR s.id = $1)
   GROUP BY s.id, s.nome
   ORDER BY s.nome`;

function formatar(r) {
  const insuficiente = r.quantidade < MIN_AMOSTRA;
  return {
    servico_id: r.servico_id,
    nome: r.nome,
    quantidade: r.quantidade,
    amostra_insuficiente: insuficiente,
    media: insuficiente ? null : Number(r.media), // exibir com toFixed(1) na interface
    distribuicao: { 1: r.n1, 2: r.n2, 3: r.n3, 4: r.n4, 5: r.n5 },
  };
}

router.get('/', async (req, res) => {
  const { rows } = await db.query(SQL, [null]);
  res.json(rows.map(formatar));
});

router.get('/:servicoId', async (req, res) => {
  if (!idValido(req.params.servicoId)) return res.status(400).json({ erro: 'id do serviço inválido.' });
  const { rows } = await db.query(SQL, [Number(req.params.servicoId)]);
  if (rows.length === 0) return res.status(404).json({ erro: 'Serviço não encontrado.' });
  res.json(formatar(rows[0]));
});

module.exports = router;

SELECT 
    s.id, 
    s.nome, 
    COUNT(a.id) AS total_avaliacoes,
    AVG(a.nota) AS media_notas
FROM 
    servicos s
LEFT JOIN 
    avaliacoes a ON s.id = a.servico_id
GROUP BY 
    s.id, s.nome
ORDER BY 
    s.id ASC;

SELECT 
    nota, 
    COUNT(*) AS quantidade
FROM 
    avaliacoes
WHERE 
    servico_id = $1
GROUP BY 
    nota
ORDER BY 
    nota DESC;