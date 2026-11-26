# Relatório de conciliação — Batalha da Foice #1–#194

Fonte: lista de edições fornecida pelo organizador em 26/11/2026. Este relatório não inventa resultados, adversários, placares, datas nem vencedores de edições vazias.

## Regras aplicadas
- Os totais de títulos, a distribuição anual, as fotografias e os outros campos de todos os MCs já cadastrados são preservados.
- A identificação de uma edição é um vínculo a uma conquista que já existe, **não** um incremento de +1.
- Um MC sem cadastro é criado com a quantidade de **edições efetivamente identificadas** em que foi declarado vencedor; adversários sem título informado são cadastrados com zero.
- Campeões em **dupla** ficam associados à mesma edição, com um título por integrante, sem multiplicar a edição.
- O resultado de dupla/trio fica documentado, mas **não** se converte em vitórias individuais fictícias no confronto direto.
- O confronto direto só recebe resultado individual quando o adversário e o vencedor foram indicados explicitamente. Placar desconhecido é registrado como "Outro".
- A importação é idempotente: reaplicar não gera novos títulos, MCs, edições nem vitórias.

## Perfis adicionais em relação ao catálogo anterior de 49 nomes (29 base + 20 do registro antigo)
| MC | Títulos recuperados na lista | Situação |
|---|---:|---|
| Danillo | 1 | Novo |
| MC Mensageiro | 1 | Novo |
| Jacaré | 1 | Novo |
| Lozz | 1 | Novo, campeão em dupla (#92) |
| Lorenzo | 1 | Novo, campeão em dupla (#92) |
| Ajayo | 1 | Novo |
| Bruno | 1 | Novo; **não** confundido automaticamente com Bruno Rodrigues |
| Mutuca | 1 | Novo |
| Mont | 1 | Novo; confrontos #135 registrados |
| TH | 1 | Novo, campeão em dupla (#166) |
| Jotinha | 1 | Novo; distinto de Jotapê |
| Goiaba | 1 | Novo, também finalista em #193 |
| Jamal | 1 | Novo, campeão em dupla (#193) |
| Magnata | 0 | Novo adversário, final #97 |
| MAX | 0 | Novo adversário, final em dupla #166 |
| Debochado | 0 | Novo adversário, edição Cave #173 |

Perfis já recuperados no catálogo antigo, como Japa, BOB, Mad Dog, Jaime, JR, Son, Pelé e Vitin, continuam reconhecidos por nome/alias. Assim, os 16 acima são **adicionais** ao catálogo antigo, não 16 MCs além de outros nomes duplicados.

## Edições que precisam de revisão humana
- **#146**: aparece Vieira e Street como campeões separados, com a mesma hashtag. **Não** foi tratado como dupla nem como dois eventos distintos. Ambos ficam marcados como "a conferir".
- **#189–#194**: nenhuma marcação explícita de ano após a última divisão "(2026)"; as edições permanecem com ano "a confirmar".
- **Seletiva Regional de Vieira Zr**: o organizador confirmou o campeão dessa categoria, mas **não vinculou um número** à vitória. Ele aparece no Hall da categoria como "Edição a confirmar", sem novo título.
- **Bruno (#128)** e **Bruno Rodrigues (#1)**: mantidos separados. Falta confirmação de serem a mesma pessoa.
- **JV** e **JVV**: tratados como grafias alternativas do mesmo cadastro. **J²** e Jotapê são perfis diferentes.
- **Lozz**, **Lo'zz**, **MC Lo'zz** são normalizados; **Duback** é normalizado como **Dubeck**, **Schuller** como **Schuler**, **Nobruxo** como **Nobruxxo**, **Pretinho** como **MC Pretinho** e **Destro** como **DestroAk**.

### Se o banco publicado ainda tiver as quantidades da recuperação antiga
- **BOB**: 10 edições na nova lista, mas 7 títulos registrados no acervo antigo. Manter 7, sinalizar 3 vínculos finais.
- **JR**: 2 edições, mas 1 título antigo. Manter 1, sinalizar o segundo vínculo.
- **Maldonado**: 5 edições, mas 4 títulos antigos. Manter 4, sinalizar o quinto vínculo.
- **Jaime**: 7 edições (incluindo #93 em dupla), mas 3 títulos antigos. Manter 3, sinalizar 4 vínculos.
- **Mopa**: 3 edições, mas 1 título antigo. Manter 1, sinalizar 2 vínculos.
- **Quintanilha**: 4 edições (#112, #118, #142, #143), mas 2 títulos no cadastro-base. Manter 2, sinalizar #142 e #143.

**Essas divergências NÃO são corrigidas com acréscimos automáticos**, pois o organizador foi explícito em não duplicar conquistas.

## Destaques do Hall dos Campeões
- **Baile da Foice**: #103 Vieira Zr (1º Baile), #188 Noth.
- **Seletiva Regional**: #110 Jotapê, #167 W, #178 Antares, Vieira Zr (numeração não definida).
- **New vs Old School**: #127 Vieira Zr e #179 Zel.
- **Retorno às Ruas**: #146 Vieira Zr (numeração em conflito).
- **Edição Cave**: #173 J² e Zel (dupla).

## Exemplos de confrontos documentados
- #135 Mont vence Antares na semifinal e Frazão na final.
- #138 Jotapê vence Vieira Zr na final.
- #150 Zel vence Antares e JV individualmente; a final com Zel, R10 e Jotapê é preservada como trio e não entra no confronto direto 1×1.
- #165 Audaz vence Pretinho; J² vence Audaz; Indio vence Zel; J² vence Dubeck.
- #173 J² + Zel vencem Gaab + JV, Antares + Debochado e Dubeck + Lozz como duplas; **não** como confrontos individuais.
- #193 Gaab + Jamal vencem Son + Goiaba em dupla; **não** como dois 1×1.

## Implantação
A implementação permanece na branch de revisão `feat/arquivo-historico-1-a-194-2026-11-26` e PR #11. **Não foi mesclada à branch principal.** LAB02 não foi incorporada.
