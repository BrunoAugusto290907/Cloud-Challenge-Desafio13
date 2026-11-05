
const router = require('express').Router();
const db = require('../db');
const { validarAvaliacao, idValido } = require('../validacao');

// Verifica o token do gestor
function exigirGestor(req, res, next) {
  const esperado = process.env.GESTOR_TOKEN;

  if (!esperado) {
    return res.status(503).json({
      erro: 'Moderação indisponível.'
    });
  }

  const informado = req.get('x-gestor-token');

  if (informado !== esperado) {
    return res.status(401).json({
      erro: 'Acesso restrito ao gestor.'
    });
  }

  next();
}

// POST /api/avaliacoes
// Salva avaliações públicas e privadas no PostgreSQL
router.post('/', async (req, res) => {
  const { erros, valores } = validarAvaliacao(req.body);

  if (erros.length > 0) {
    return res.status(400).json({
      erro: 'Dados inválidos.',
      detalhes: erros
    });
  }

  const servico = await db.query(
    'SELECT id FROM servicos WHERE id = $1',
    [valores.servico_id]
  );

  if (servico.rowCount === 0) {
    return res.status(404).json({
      erro: 'Serviço não encontrado.'
    });
  }

  const { rows } = await db.query(
    `INSERT INTO avaliacoes
       (servico_id, nota, comentario, privada)
     VALUES ($1, $2, $3, $4)
     RETURNING id, servico_id, nota, privada, criada_em`,
    [
      valores.servico_id,
      valores.nota,
      valores.comentario,
      valores.privada
    ]
  );

  return res.status(201).json(rows[0]);
});

// GET /api/avaliacoes
// Apenas gestor: lista avaliações públicas e privadas
router.get('/', exigirGestor, async (req, res) => {
  const { servico_id } = req.query;

  if (servico_id !== undefined && !idValido(servico_id)) {
    return res.status(400).json({
      erro: 'Informe um servico_id válido.'
    });
  }

  const parametros = [];
  let filtro = '';

  if (servico_id !== undefined) {
    filtro = 'WHERE a.servico_id = $1';
    parametros.push(Number(servico_id));
  }

  const { rows } = await db.query(
    `SELECT
       a.id,
       a.servico_id,
       s.nome AS servico_nome,
       a.nota,
       a.comentario,
       a.privada,
       a.oculta,
       a.criada_em
     FROM avaliacoes a
     JOIN servicos s ON s.id = a.servico_id
     ${filtro}
     ORDER BY a.criada_em DESC, a.id DESC`,
    parametros
  );

  return res.json(rows);
});

// PATCH /api/avaliacoes/:id/ocultar
// Oculta comentário sem remover a nota da média
router.patch('/:id/ocultar', exigirGestor, async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({
      erro: 'ID inválido.'
    });
  }

  const id = Number(req.params.id);

  const atual = await db.query(
    `SELECT id, comentario, privada, oculta
     FROM avaliacoes
     WHERE id = $1`,
    [id]
  );

  if (atual.rowCount === 0) {
    return res.status(404).json({
      erro: 'Avaliação não encontrada.'
    });
  }

  const avaliacao = atual.rows[0];

  if (avaliacao.privada) {
    return res.status(409).json({
      erro: 'Esta avaliação já é privada.'
    });
  }

  if (!avaliacao.comentario) {
    return res.status(409).json({
      erro: 'Esta avaliação não possui comentário.'
    });
  }

  if (avaliacao.oculta) {
    return res.status(409).json({
      erro: 'Comentário já está oculto.'
    });
  }

  const { rows } = await db.query(
    `UPDATE avaliacoes
     SET oculta = TRUE
     WHERE id = $1
     RETURNING id, oculta`,
    [id]
  );

  return res.json(rows[0]);
});

module.exports = router;
