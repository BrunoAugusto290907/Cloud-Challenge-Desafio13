-- ==========================================================
-- DADOS INICIAIS - AVALIE O ATENDIMENTO
-- PostgreSQL
-- Execute depois de banco/schema.sql.
-- Pode ser executado novamente sem duplicar os dados de demonstração.
-- ==========================================================

BEGIN;

-- 1. Serviços exigidos pela ficha.
INSERT INTO servicos (nome) VALUES
    ('Secretaria'),
    ('Biblioteca'),
    ('Cantina'),
    ('Laboratórios')
ON CONFLICT (nome) DO NOTHING;

-- 2. Avaliações fictícias. Os serviços são localizados pelo nome;
-- assim, o script não depende de IDs fixos (1, 2, 3 ou 4).
WITH dados_demo (servico, nota, comentario, oculta) AS (
    VALUES
        ('Secretaria', 4, 'Atendimento rápido e eficaz.', false),
        ('Secretaria', 3, 'Poderia ser um pouco mais rápido nas senhas.', false),
        ('Secretaria', 5, 'Muito prestativos a resolver o meu problema.', false),

        ('Biblioteca', 5, 'Ambiente muito silencioso e organizado.', false),
        ('Biblioteca', 5, 'Ótimo acervo bibliográfico.', false),
        ('Biblioteca', 4, 'Faltam algumas tomadas nas mesas do fundo.', false),

        ('Cantina', 5, 'Comida excelente e barata!', false),
        ('Cantina', 4, 'As filas são grandes ao meio-dia.', false),
        ('Cantina', 1, 'Encontrei um inseto na sopa, horrível!', true),

        -- Somente duas avaliações: deve aparecer "amostra insuficiente".
        ('Laboratórios', 2, 'Computadores lentos e com ratos avariados.', false),
        ('Laboratórios', 3, 'Falta ar condicionado na sala 3.', false)
)
INSERT INTO avaliacoes (servico_id, nota, comentario, oculta)
SELECT s.id, d.nota, d.comentario, d.oculta
  FROM dados_demo AS d
  JOIN servicos AS s ON s.nome = d.servico
 WHERE NOT EXISTS (
       SELECT 1
         FROM avaliacoes AS a
        WHERE a.servico_id = s.id
          AND a.nota = d.nota
          AND a.comentario IS NOT DISTINCT FROM d.comentario
          AND a.oculta = d.oculta
 );

COMMIT;

-- Quantidade esperada após a primeira execução em um banco vazio:
-- Secretaria: 3 | Biblioteca: 3 | Cantina: 3 | Laboratórios: 2
-- Total: 11 avaliações. Uma avaliação da Cantina tem comentário oculto,
-- mas sua nota continua contando na média e na distribuição.
