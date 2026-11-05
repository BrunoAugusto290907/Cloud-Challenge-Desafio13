-- Ver todos os serviços
SELECT * FROM servicos;

-- Ver todas as avaliações
SELECT * FROM avaliacoes;

-- Quantidade de avaliações por serviço
SELECT
    s.nome AS servico,
    COUNT(a.id) AS total_avaliacoes
FROM servicos s
LEFT JOIN avaliacoes a
    ON s.id = a.servico_id
GROUP BY s.id, s.nome
ORDER BY s.nome;

-- Média das notas por serviço
SELECT
    s.nome AS servico,
    COUNT(a.id) AS total_avaliacoes,
    ROUND(AVG(a.nota), 1) AS media_notas
FROM servicos s
LEFT JOIN avaliacoes a
    ON s.id = a.servico_id
GROUP BY s.id, s.nome
ORDER BY s.nome;

-- Ver comentários ocultos
SELECT
    s.nome AS servico,
    a.comentario,
    a.oculta
FROM avaliacoes a
INNER JOIN servicos s
    ON s.id = a.servico_id
WHERE a.oculta = TRUE;