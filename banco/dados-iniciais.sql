-- Cadastro dos serviços
INSERT INTO servicos (nome)
SELECT dados.nome
FROM (
    SELECT 'Secretaria' AS nome
    UNION ALL SELECT 'Biblioteca'
    UNION ALL SELECT 'Cantina'
    UNION ALL SELECT 'Laboratórios'
) AS dados
WHERE NOT EXISTS (
    SELECT 1
    FROM servicos
    WHERE servicos.nome = dados.nome
);

-- Avaliações fictícias
INSERT INTO avaliacoes (servico_id, nota, comentario, oculta)
SELECT s.id, d.nota, d.comentario, d.oculta
FROM (
    SELECT 'Secretaria' AS servico, 5 AS nota,
           'Atendimento rápido e funcionários muito educados.' AS comentario,
           FALSE AS oculta
    UNION ALL SELECT 'Secretaria', 4, 'Consegui resolver meu problema sem dificuldades.', FALSE
    UNION ALL SELECT 'Secretaria', 3, 'O atendimento foi bom, mas a espera foi longa.', FALSE
    UNION ALL SELECT 'Secretaria', 2, 'Demoraram bastante para atender.', FALSE
    UNION ALL SELECT 'Secretaria', 5, 'Equipe muito atenciosa e prestativa.', FALSE
    UNION ALL SELECT 'Secretaria', 1, 'Não consegui resolver minha solicitação.', FALSE
    UNION ALL SELECT 'Secretaria', 4, 'Bom atendimento, poderia melhorar a organização.', FALSE
    UNION ALL SELECT 'Secretaria', 5, 'Fui muito bem recebido.', FALSE

    UNION ALL SELECT 'Biblioteca', 5, 'Ambiente limpo, organizado e silencioso.', FALSE
    UNION ALL SELECT 'Biblioteca', 4, 'Boa variedade de livros.', FALSE
    UNION ALL SELECT 'Biblioteca', 5, 'Funcionários muito prestativos.', FALSE
    UNION ALL SELECT 'Biblioteca', 3, 'Poderia ter mais computadores disponíveis.', FALSE
    UNION ALL SELECT 'Biblioteca', 2, 'Poucos lugares disponíveis para estudar.', FALSE
    UNION ALL SELECT 'Biblioteca', 5, 'Ótimo espaço para estudar.', FALSE
    UNION ALL SELECT 'Biblioteca', 4, 'Bom acervo e ambiente agradável.', FALSE
    UNION ALL SELECT 'Biblioteca', 5, 'Excelente atendimento.', FALSE

    UNION ALL SELECT 'Cantina', 5, 'Comida saborosa e preço acessível.', FALSE
    UNION ALL SELECT 'Cantina', 4, 'Boa variedade de lanches.', FALSE
    UNION ALL SELECT 'Cantina', 3, 'A comida é boa, mas a fila é grande.', FALSE
    UNION ALL SELECT 'Cantina', 2, 'Os preços poderiam ser melhores.', FALSE
    UNION ALL SELECT 'Cantina', 1, 'O atendimento demorou muito.', FALSE
    UNION ALL SELECT 'Cantina', 5, 'Atendimento rápido e lanche muito bom.', FALSE
    UNION ALL SELECT 'Cantina', 4, 'Boa qualidade dos alimentos.', FALSE
    UNION ALL SELECT 'Cantina', 3, 'Faltam opções de refeições.', FALSE
    UNION ALL SELECT 'Cantina', 5, 'Funcionários educados.', FALSE
    UNION ALL SELECT 'Cantina', 2, 'O espaço fica muito cheio no intervalo.', FALSE
    UNION ALL SELECT 'Cantina', 4, 'Gostei das opções disponíveis.', FALSE
    UNION ALL SELECT 'Cantina', 1, 'Experiência ruim, não gostei do atendimento.', TRUE

    -- Laboratórios: somente duas avaliações
    UNION ALL SELECT 'Laboratórios', 4, 'Equipamentos funcionaram corretamente.', FALSE
    UNION ALL SELECT 'Laboratórios', 3, 'Alguns computadores estão lentos.', FALSE
) AS d
JOIN servicos s ON s.nome = d.servico
WHERE NOT EXISTS (
    SELECT 1
    FROM avaliacoes a
    WHERE a.servico_id = s.id
      AND a.comentario = d.comentario
);