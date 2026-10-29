-- Conecte ao MySQL da FinStart antes de executar. Consultas somente de leitura.
USE finstart;
SHOW TABLES;
SHOW CREATE TABLE metas;
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY
FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'finstart'
ORDER BY TABLE_NAME, ORDINAL_POSITION;
SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'finstart' AND REFERENCED_TABLE_NAME IS NOT NULL;
-- Não exibir hashes de senha, tokens ou e-mails durante a apresentação.
SELECT id, titulo, alvo_centavos / 100 AS valor_alvo,
guardado_centavos / 100 AS valor_guardado, prazo_meses, status FROM metas;
SELECT m.titulo, p.variacao_centavos / 100 AS variacao,
p.saldo_centavos / 100 AS saldo, p.data_registro
FROM progresso_meta p JOIN metas m ON m.id = p.meta_id ORDER BY p.id;
SELECT c.titulo, cat.nome AS categoria, c.nivel, c.fontes_json
FROM conteudo c JOIN categoria cat ON cat.id = c.categoria_id;
