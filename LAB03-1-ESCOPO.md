# LAB03.1 — escopo consolidado aprovado (26/11/2026)

**Base:** branch `lab03-1-carrossel-2026-completo`. **Produção:** `main` permanece intacta. Nenhum merge nem publicação definitiva automática.

## Regras de dados (invariantes)
- Preservar títulos cadastrados ainda sem edição identificada.
- Conciliar documentação histórica com títulos, sem duplicar conquistas nem inventar datas, placares, finais, vencedores ou números.
- Se o acervo documenta mais conquistas do que o cadastro, analisar e reconciliar com evidências; preservar rastreabilidade da mudança.
- Sinalizar confirmado / parcial / pendente.
- Nomes/IDs, fotos e vínculos existentes não devem se perder. Divergência #146 exige revisão humana.
- Qualquer mudança pública depende de permissão de servidor, rascunho, prévia, teste e aprovação.

## Nove melhorias de batalhas aprovadas
1. Histórico completo de confrontos por edição, inclusive parciais.
2. Estatísticas individuais somente a partir de confrontos documentados.
3. Retrospectos 1×1, sem confundir duplas/triplas com duelos.
4. Linha do tempo cronológica por ano.
5. Recordes sustentados por registros comprovados.
6. Rivalidades históricas com fontes, mídias e retrospecto.
7. Chaveamentos em dupla com título individual para cada campeão, sem duplicação.
8. Página individual por edição com participantes, chaveamento e mídias.
9. Reconstrução colaborativa com sugestões do público e aprovação administrativa.

## Administração obrigatória
Preservar todas as opções atuais (MCs, títulos, ranks, rankings, temas Clássico/Street/Arquivo P&B, tipografia, cores, música, agenda, galeria, chaveamentos, confrontos, importação/exportação). Acrescentar rascunho+desfazer, auditoria de mudanças, central de pendências, papéis administrador/editor/revisor, backup/restauração e prévia móvel/desktop. Autorização efetiva sempre no servidor.

## Carrossel 2026 — integração inicial LAB03.1
- Uma entrada por **conquista de 2026**, inclusive várias por MC. Contagem individual, perfil e foto.
- Somente `titleLink` de edição publicada com campeão final compatível identifica número/edição.
- Sem vínculo verificado: manter título e exibir “edição pendente”.
- Foto ausente: avatar padrão. Responsivo e por toque; seta desktop; respeitar movimento reduzido.
- ADM controla exibição e velocidade; alterações públicas respeitam fluxo de publicação.

## Critérios de aceite gerais
- Teste automático para regras puras, integração e regressões; teste manual no navegador.
- Conferência dos títulos históricos (incluindo BOB, Jaime, Zel e #146).
- Verificar segurança de auth, armazenamento e upload antes da publicação.
- Não afirmar que função está pronta por ter apenas interface.
- `PR #11` (acervo #1–#194) permanece separada, sujeita à revisão histórica e merge explícito.

## Estado
Etapa atual: carrossel 2026 aprimorado na branch LAB03.1; nove módulos e novas funções ADM **a implementar ou validar** em etapas. Nenhuma autorização para publicar a versão incompleta.
