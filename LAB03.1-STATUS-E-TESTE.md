# LAB03.1 — TESTE ISOLADO (26/11/2026)

## Abrir a prévia
1. Baixe o ZIP da branch **lab03-1-teste-integracao-20261126** pelo GitHub.
2. Extraia **todos** os arquivos na mesma pasta (não abra o HTML dentro do ZIP).
3. Abra **index.html** diretamente no navegador (endereço começando em `file://`).
4. O painel **ADM DE TESTE — SEM SENHA** se abre automaticamente, somente no arquivo local. A versão hospedada mantém login real.
5. Para consultar estatísticas e linha do tempo, clique **Linha do tempo** na navegação.

**AVISO:** Este é um ambiente local de revisão. As alterações administrativas ficam como rascunhos do navegador e não são publicadas nem alteram o backend. O funcionamento do painel local não comprova o funcionamento da autenticação/publicação online.

## O que foi efetivamente modificado
- Branch isolada, sem alterações na `main`.
- Inclusão de `lab03-1-archive.js`, com transcrição das edições #1–#194, campeões, lacunas, duplas, conflito #146, estatísticas documentais, linha do tempo e confrontos explícitos.
- Inclusão do módulo no `index.html` original, preservando fotos e dados embutidos (não foi recriado um site vazio).
- Ativação do ADM **apenas ao abrir o HTML localmente**, sem exigir senha de teste. A autenticação do servidor permanece intacta.
- Nenhum título ou foto do banco foi regravado.

## Pendências — NÃO declarar prontas
- Auditoria e recuperação de todas as fotos das versões anteriores.
- Recuperação do conteúdo real da galeria no armazenamento remoto.
- Análise funcional do ranking duplicado na LAB03.1 antiga (o código exato desta prévia não foi disponibilizado nesta sessão).
- Reconciliação automática de edições identificadas e totais antigos (precisa de decisão do ADM nos conflitos).
- Auditoria completa das seis ferramentas administrativas e das nove melhorias de batalhas.
- Testes de navegador, persistência, responsividade e permissão reais.
- Importação dos confrontos históricos para o banco de dados principal, com deduplicação.

**A produção não foi modificada.** A branch de teste é uma integração parcial verificável; não deve ser publicada como atualização final.
