# Batalha da Foice — V9 candidata (não definitiva)

## Conteúdo
- `index.html`: interface pública do ranking com login administrativo.
- `data.json`: **somente** o conjunto público inicial, com 29 MCs, 287 títulos e sem logs administrativos.
- `auth-config.js`: campo para a **chave web pública do Firebase**, a preencher pelo proprietário.
- `functions/api/public.js`: leitura de dados publicados.
- `functions/api/admin/*.js`: sessão, rascunho, publicação e backup protegidos.
- `functions/api/_lib.js`: verificação da assinatura do Firebase e validações.
- `CONFIGURAR-LOGIN-E-CLOUDFLARE.md`: instruções completas em português.
- `PROMPT-MESTRE-V9.md`: especificação extensa e itens que ainda precisam ser desenvolvidos.
- `RELATORIO-V9.md`: testes efetuados, limites e mudanças.

Esta entrega **não altera GitHub nem Cloudflare automaticamente**. Configurar Firebase e o KV é indispensável para editar online.

**Não inclua arquivos de backup integral/privado ao publicar.** Os backups são entregues separadamente.