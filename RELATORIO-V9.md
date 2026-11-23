# Relatório técnico — V9 candidata à publicação

## Base inspecionada
`Batalha-da-Foice-V8-Street-Restaurado.zip` e `PROMPT-MESTRE-V9.md` (especificação de 20 KB). O pacote analisado continha 29 MCs, 287 títulos, 154 entradas de log administrativo, 8 IDs destacados de campeões de 2026, e listas vazias de eventos, galeria e chaveamentos. Os registros de MCs, as fotos e contagens foram preservados na V9 inicial. Não criei resultados históricos.

## Implementado nesta entrega
1. Nova build pública candidata com `LOCAL_PREVIEW=false` e a navegação para a tela de login, mantendo a estrutura existente dos cards e do Street restaurado.
2. Login por e-mail e senha via Firebase Authentication, recuperação de senha, verificação do token no servidor Cloudflare com chave pública, projeto, emissor, expiração e UID permitido.
3. API pública sem o log interno; sistema de publicação no KV Cloudflare que exige token verificado e confirmação explícita; armazenamento de rascunho protegido e versão anterior de publicação.
4. API de sessão (`/api/admin/session`), rascunho (`/api/admin/draft`), publicação (`/api/admin/publish`) e backup administrativo (`/api/admin/backup`).
5. Separação de dados públicos do backup histórico integral. O backup não está dentro da pasta destinada à implantação.
6. Registro determinístico de 287 IDs de título histórico a partir das contagens preexistentes (`mcId:ano:ordinal`), sem somar novos títulos. A interface de vínculo legado é preservada, com esquema de migração de ID a completar.
7. Pequenos ajustes na camada geral de navegação/estética com fontes e cores semelhantes, sem reescrever `.card`/`.sr`.
8. Arquivos de proteção básica por cabeçalhos e resposta 404.

## Testes que passaram
- Sintaxe de JavaScript de todas as Pages Functions e do script principal da página (Node `--check`).
- Teste `npm test`: 29 MCs, total 287 títulos, ausência do `log` no JSON público, validação de IDs duplicados, APIs de sessão retornando HTTP 401 sem token válido e rota pública retornando JSON esperado na simulação local.
- Renderização de abertura em Chromium de uma prévia visual com os totais 29/287 (screenshot `BDF-V9-previa-desktop.png`).

## Não testado / bloqueios para declarar versão definitiva
- **Não foi possível verificar login real, gravação KV, recuperação de senha e publicação remota**, pois exigem conectar e configurar as contas Firebase/Cloudflare do proprietário.
- O fluxo visual automatizado de login da página inteira não foi concluído por tempo limite do navegador no ambiente de testes; é obrigatório testar no seu navegador.
- Os requisitos do prompt que exigem nova arquitetura completa, banco relacional transacional, papéis de editor e MFA obrigatório, galeria com armazenamento R2, revisão completa de CSP e XSS, SEO por rota, WCAG 2.2 AA, importação reversível, histórico integral de diffs e bateria completa de testes ainda estão **pendentes**.
- KV tem consistência eventual. O controle de versão implementado reduz conflitos comuns, mas não substitui transações atômicas ou bloqueio concorrente robusto. Para uma versão final com vários administradores, migrar armazenamento para D1.
- Os dados legados de mídia ainda podem usar base64, com limitações de tamanho; antes de cadastrar grandes galerias, projetar armazenamento R2.
- A tela permite editar rascunhos e publicar; não é uma garantia de que toda função do painel antigo esteja perfeita. Faça um teste completo de MCs, ranks, chaveamentos e backups na conta de homologação.

## Segurança e publicação
- A parte pública **não oferece gravação administrativa sem autenticação**. Publicação é bloqueada se o servidor não receber token com assinatura válida e UID configurado.
- O cadastro do administrador NÃO é feito pelo usuário anônimo na página; o primeiro usuário deve ser criado pelo proprietário no Firebase Console e autorizado em `BDF_ADMIN_UID` no Cloudflare Pages.
- A chave pública Web Firebase em `auth-config.js` precisa ser preenchida; até lá, o login não funciona.
- Não coloque arquivos com dados privados, tokens, log administrativo ou backups históricos na raiz da hospedagem.

## Veredito
**V9 candidata / homologação, não versão definitiva.** A infraestrutura básica de login está codificada e protegida no servidor, mas seu funcionamento real precisa da configuração e dos testes externos. Não foi feita qualquer alteração no GitHub ou no Cloudflare do usuário.