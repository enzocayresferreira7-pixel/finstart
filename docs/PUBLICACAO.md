# Publicação e verificação — 29/10/2026

Site: https://finstart-publicacao.vercel.app

API: https://finstart-api-l60v.onrender.com

O frontend está na Vercel, com proxy `/api` para o backend Node/Express no Render. O backend usa MySQL persistente na Aiven, com TLS validado. Credenciais ficam nas variáveis privadas do serviço, nunca nos arquivos públicos. PUBLIC_ORIGIN deve ser exatamente https://finstart-publicacao.vercel.app.

## Verificação executada no endereço público

O script `scripts/verificar-online.mjs` foi executado com TEST_BASE_URL apontando para o domínio da Vercel. Passaram: página pública; saúde do banco pelo proxy; cadastro; login; cookie Secure/HttpOnly/SameSite=Strict; cálculo de juros (R$ 6.213,55); gravação e consulta de orçamento, juros e metas; atualização e histórico do progresso; comparação e histórico; conteúdos; isolamento de duas contas; logout e persistência após novo login; exclusão dos registros de teste; bloqueio de acesso a .env, server/index.js e database/schema.mysql.sql. As duas contas fictícias permaneceram, sem os registros financeiros usados nos testes.

No navegador, o simulador de juros também exibiu R$ 6.213,55 para R$ 1.000 iniciais, R$ 200 por mês, 0,5% ao mês e 24 meses.

## Limites desta verificação

Não foi comprovada nesta rodada a persistência após reinício da API, nem foram validados todos os fluxos visuais e mobile. A execução automatizada HTTP não substitui esses testes. A integração automática dos serviços com novos commits do GitHub ainda precisa ser concluída/verificada.

Render gratuito pode suspender o serviço por inatividade. O primeiro acesso à API pode demorar. O frontend espera até 90 segundos, sem repetir automaticamente gravações. Antes de apresentar, abra o site e consulte /api/saude. A apresentação depende de internet e disponibilidade dos provedores.

## Atualização

O deploy inicial da Vercel foi feito pela CLI a partir de pasta estática selecionada por scripts/build-static.js. O deploy direto da raiz encontrou detecção de Docker e ainda precisa de ajuste antes de automatizar pelo Git. Não publique a raiz como arquivos estáticos: use apenas os arquivos selecionados, sem banco, credenciais ou código do servidor.
