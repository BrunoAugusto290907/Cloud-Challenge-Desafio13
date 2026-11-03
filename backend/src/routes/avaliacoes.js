const router = require('express').Router();
const db = require('../db');
const { validarAvaliacao, idValido } = require('../validacao');

// Protecao simples para a area do gestor (nao ha login nesta versao)
function exigirGestor(req, res, next) {
  const esperado = process.env.GESTOR_TOKEN;
  if (!esperado) return res.status(503).json({ erro: 'Moderação indisponível.' });
  if (req.get('x-gestor-token') !== esperado) {
    return res.status(401).json({ erro: 'Acesso restrito ao gestor.' });
  }
  next();
}

// Registrar avaliacao anonima (nenhum dado de identificacao e coletado)
router.post('/', async (req, res) => {
  const { erros, valores } = validarAvaliacao(req.body);
  if (erros.length) return res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });

  const servico = await db.query('SELECT id FROM servicos WHERE id = $1', [valores.servico_id]);
  if (servico.rowCount === 0) return res.status(404).json({ erro: 'Serviço não encontrado.' });

  const { rows } = await db.query(
    `INSERT INTO avaliacoes (servico_id, nota, comentario)
     VALUES ($1, $2, $3)
     RETURNING id, servico_id, nota, criada_em`,
    [valores.servico_id, valores.nota, valores.comentario]
  );
  res.status(201).json(rows[0]);
});

// Area do gestor: lista TODAS as avaliacoes de um servico (inclui ocultas)
router.get('/', exigirGestor, async (req, res) => {
  const { servico_id } = req.query;
  if (!servico_id || !idValido(servico_id)) {
    return res.status(400).json({ erro: 'Informe servico_id válido na consulta.' });
  }
  const { rows } = await db.query(
    `SELECT id, servico_id, nota, comentario, oculta, criada_em
       FROM avaliacoes WHERE servico_id = $1 ORDER BY criada_em DESC`,
    [Number(servico_id)]
  );
  res.json(rows);
});

// Moderacao: oculta o comentario; a nota continua contando na media
router.patch('/:id/ocultar', exigirGestor, async (req, res) => {
  if (!idValido(req.params.id)) return res.status(400).json({ erro: 'id inválido.' });
  const id = Number(req.params.id);

  const atual = await db.query('SELECT id, comentario, oculta FROM avaliacoes WHERE id = $1', [id]);
  if (atual.rowCount === 0) return res.status(404).json({ erro: 'Avaliação não encontrada.' });
  if (!atual.rows[0].comentario) return res.status(409).json({ erro: 'Esta avaliação não tem comentário.' });
  if (atual.rows[0].oculta) return res.status(409).json({ erro: 'Comentário já está oculto.' });

  const { rows } = await db.query(
    'UPDATE avaliacoes SET oculta = true WHERE id = $1 RETURNING id, oculta',
    [id]
  );
  res.json(rows[0]);
});

module.exports = router;
