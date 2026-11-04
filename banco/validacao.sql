-- ==========================================================
-- CONSULTAS DE CONFERÊNCIA E VALIDAÇÃO - POSTGRESQL
-- Execute depois de schema.sql e dados-iniciais.sql.
-- ==========================================================

-- 1. Conferir os serviços cadastrados. Deve haver quatro serviços.
SELECT id, nome
FROM servicos
ORDER BY id;

-- 2. Conferir todas as avaliações gravadas, inclusive as ocultas.
SELECT
    a.id,
    s.nome AS servico,
    a.nota,
    a.comentario,
    a.oculta,
    a.criada_em
FROM avaliacoes AS a
JOIN servicos AS s ON s.id = a.servico_id
ORDER BY s.id, a.id;

-- 3. Conferir quantidade, média e regra de amostra mínima.
-- IMPORTANTE: AVG considera também notas de comentários ocultos.
SELECT
    s.nome AS servico,
    COUNT(a.id)::int AS quantidade_avaliacoes,
    CASE
        WHEN COUNT(a.id) < 3 THEN NULL
        ELSE ROUND(AVG(a.nota)::numeric, 1)
    END AS media_exibida,
    CASE
        WHEN COUNT(a.id) < 3 THEN 'Amostra insuficiente'
        ELSE 'Amostra suficiente'
    END AS situacao_amostra
FROM servicos AS s
LEFT JOIN avaliacoes AS a ON a.servico_id = s.id
GROUP BY s.id, s.nome
ORDER BY s.id;

-- 4. Conferir a distribuição de notas de 1 a 5 por serviço.
SELECT
    s.nome AS servico,
    COUNT(a.id) FILTER (WHERE a.nota = 1)::int AS nota_1,
    COUNT(a.id) FILTER (WHERE a.nota = 2)::int AS nota_2,
    COUNT(a.id) FILTER (WHERE a.nota = 3)::int AS nota_3,
    COUNT(a.id) FILTER (WHERE a.nota = 4)::int AS nota_4,
    COUNT(a.id) FILTER (WHERE a.nota = 5)::int AS nota_5
FROM servicos AS s
LEFT JOIN avaliacoes AS a ON a.servico_id = s.id
GROUP BY s.id, s.nome
ORDER BY s.id;

-- 5. Conferir somente os comentários públicos (não ocultos).
SELECT
    s.nome AS servico,
    a.nota,
    a.comentario,
    a.criada_em
FROM avaliacoes AS a
JOIN servicos AS s ON s.id = a.servico_id
WHERE a.oculta = false
  AND a.comentario IS NOT NULL
  AND TRIM(a.comentario) <> ''
ORDER BY s.id, a.criada_em DESC;

-- 6. Conferir comentários ocultos e visíveis por serviço.
SELECT
    s.nome AS servico,
    COUNT(a.id) FILTER (WHERE a.oculta = true)::int AS comentarios_ocultos,
    COUNT(a.id) FILTER (WHERE a.oculta = false)::int AS comentarios_visiveis
FROM servicos AS s
LEFT JOIN avaliacoes AS a ON a.servico_id = s.id
GROUP BY s.id, s.nome
ORDER BY s.id;

-- 7. Teste rápido: total de serviços e avaliações.
SELECT
    (SELECT COUNT(*) FROM servicos)::int AS total_servicos,
    (SELECT COUNT(*) FROM avaliacoes)::int AS total_avaliacoes;
