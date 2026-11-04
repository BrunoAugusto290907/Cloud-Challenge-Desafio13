-- Inserção dos serviços exigidos pela ficha
INSERT INTO servicos (nome) VALUES
('Secretaria'),
('Biblioteca'),
('Cantina'),
('Laboratórios');

-- Secretaria (Suficiente: 3 avaliações)
INSERT INTO avaliacoes (servico_id, nota, comentario, oculta) VALUES
(1, 4, 'Atendimento rápido e eficaz.', false),
(1, 3, 'Poderia ser um pouco mais rápido nas senhas.', false),
(1, 5, 'Muito prestativos a resolver o meu problema.', false);

-- Biblioteca (Suficiente: 3 avaliações)
INSERT INTO avaliacoes (servico_id, nota, comentario, oculta) VALUES
(2, 5, 'Ambiente muito silencioso e organizado.', false),
(2, 5, 'Ótimo acervo bibliográfico.', false),
(2, 4, 'Faltam algumas tomadas nas mesas do fundo.', false);

-- Cantina (Suficiente: 3 avaliações, incluindo 1 comentário oculto pelo gestor)
INSERT INTO avaliacoes (servico_id, nota, comentario, oculta) VALUES
(3, 5, 'Comida excelente e barata!', false),
(3, 4, 'As filas são grandes ao meio-dia.', false),
(3, 1, 'Encontrei um inseto na sopa, horrível!', true); -- Oculto: Não deve aparecer o texto, mas o "1" entra na média

-- Laboratórios (Amostra insuficiente: apenas 2 avaliações)
INSERT INTO avaliacoes (servico_id, nota, comentario, oculta) VALUES
(4, 2, 'Computadores lentos e com ratos avariados.', false),
(4, 3, 'Falta ar condicionado na sala 3.', false);