
INSERT INTO servicos (nome)
VALUES
    ('Secretaria'),
    ('Biblioteca'),
    ('Cantina'),
    ('Laboratórios')
ON CONFLICT (nome) DO NOTHING;
