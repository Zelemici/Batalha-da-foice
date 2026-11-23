# PROMPT MESTRE — Batalha da Foice V9 (candidata à versão definitiva)

## Papel e escopo
Você é uma equipe de desenvolvimento front-end, back-end, design, QA, segurança e acessibilidade. Receba como **fonte de verdade** o pacote `Batalha-da-Foice-V8-Street-Restaurado.zip` e sua base histórica. Primeiro faça um inventário do código e dos dados, identifique os fluxos existentes e implemente uma V9 candidata à publicação, com testes e documentação. A V8 é uma prévia **local**, não uma versão pronta para produção. **Não publique automaticamente** em GitHub, Pages, domínio ou serviço externo; somente com autorização explícita do proprietário.

Objetivo: transformar a Batalha da Foice em um site público completo, rápido, confiável e fácil de administrar, **preservando o aspecto visual dos cards do ranking e sobretudo o layout STREET RESTAURADO**. Modernizar principalmente a estrutura geral da página (cabeçalho, navegação, seções, filtros, rodapé, painéis e responsividade) sem descaracterizar a identidade escura, urbana e laranja. Não recriar imagens da foice, Vieira, mãos ou outros enfeites rejeitados. Não alterar regras históricas sem confirmação.

## Dados e invariantes obrigatórias
- Os dados do pacote atual contêm **29 MCs e 287 títulos**. Tratar esses números como regressões mínimas da base entregue, não como totais eternos; jamais alterar inadvertidamente os valores da versão de entrada.
- Preservar IDs, nomes, fotos, cidades, redes sociais, anos e totais de títulos, apelidos, reconhecimento, representatividade, histórico, 154 registros de log existentes e os IDs da lista de campeões de 2026. Não inventar campeões, confrontos, edições, datas, fotografias ou resultados.
- No `data.json` da base examinada: `events`, `gallery` e `brackets` estão vazios. Exibir estados vazios claros; procurar backups reais somente se forem fornecidos. Não transformar dados de demonstração em registros oficiais.
- Diferenciar título histórico já contabilizado, edição, participante, confronto, placar e vínculo entre edição/título. Um vínculo **nunca soma um novo título** por conta própria.
- Toda migração deverá ter exportação anterior, verificação de contagem antes/depois, rollback e relatório de diferenças.

## 1. Arquitetura e manutenção
1. Desmembrar gradualmente o `index.html` monolítico em HTML semântico, estilos organizados e módulos JavaScript claros (dados, validação, classificação, UI, galeria, chaveamento, painel, autenticação, publicação). Preservar uma build final simples de hospedar.
2. Usar um esquema de dados versionado (`schemaVersion`) com migrações reversíveis e verificadas, IDs estáveis e validação estrita no cliente **e no servidor**. Não depender de estados globais ou de comparação por nomes quando houver IDs.
3. Manter separação entre dados públicos publicados, rascunhos privados e conteúdo de mídia. Preferir fontes de dados explícitas em vez de duplicar o mesmo conteúdo em JSON externo e JSON embutido sem regra de atualização.
4. Erros de leitura e gravação devem ser apresentados ao usuário; evitar `catch` silencioso que deixa a interface com dados incompletos ou demonstrativos.
5. Não deixar código de demo, bypass administrativo, tokens, segredos ou dados privados na build pública.
6. Adicionar versionamento, changelog, testes automáticos e roteiro de implantação em homologação, com preview de diferenças antes de publicar.

## 2. Login, sessões e segurança de produção (obrigatórios antes da publicação)
1. **Manter sem senha apenas uma build local de desenvolvimento isolada, explicitamente marcada e que jamais envie gravação remota.** Criar build pública separada com `LOCAL_PREVIEW=false`, sem atalho que conceda acesso administrativo.
2. Implantar login real (por exemplo Firebase Authentication integrado a um Worker/API autorizador) e validação de autenticação e papel **no servidor em cada operação**. Não confiar em esconder botões no front-end.
3. Funções: visitante somente leitura de registros publicados; editor autorizado gerencia rascunhos; administrador gerencia usuários, conteúdo, publicação, exclusão e backups. Aplicar menor privilégio.
4. Verificar ID token/assinatura, validade, emissor, audiência, claims/permissões e revogação de acesso no servidor; controlar sessão, logout, expiração, reautenticação em ações sensíveis e restrição de taxa.
5. Disponibilizar recuperação de acesso pelo provedor, MFA para administradores, lista de sessões e revogação. Evitar senha própria armazenada no site, no JSON ou no GitHub.
6. Restringir CORS aos domínios corretos, usar HTTPS, cabeçalhos de segurança e política CSP compatível com a implementação; rever a necessidade de JavaScript/CSS embutidos. Não incluir token do GitHub no navegador.
7. Validar tamanhos e tipos de arquivos, URLs externas, conteúdo textual, parâmetros, upload de mídia e JSON importado no servidor; prevenir conteúdo injetado, renderização insegura, abuso de upload e links perigosos.
8. Isolar rascunhos, registros ocultos, logs internos e possíveis dados pessoais da API pública. **Ocultar na tela não é controlar acesso**: não incluir dados privados em `data.json` público.
9. Definir backups protegidos, controle de acesso e trilha de auditoria (ator, horário, ação e diferença), sem registrar senhas/tokens.
10. Exibir estado da autenticação e da publicação com mensagens claras; nunca dizer “publicado” só porque o botão foi clicado.

## 3. Integridade dos MCs, histórico e ranks
1. MC: cadastro, edição, inativação/arquivamento, foto, recorte, cidade, Instagram, apelidos, recordes, histórico por ano, títulos de ano desconhecido, representatividade e biografia opcional; impedir duplicação de IDs.
2. Separar registros históricos confirmados, aproximados e não verificados; permitir fonte/documento e anotações internas, sem mudar dados de forma automática.
3. Criação, exclusão, renomeação, reordenação, cor, limiar e descrição dos ranks; mostrar simulação de impactos antes de salvar. Regras válidas para zero, empates, limites e ranks sem ocupantes.
4. Não ajustar silenciosamente limiares informados pelo administrador: alertar para conflito, mostrar correção proposta e exigir confirmação. Incluir desfazer e restaurar padrões.
5. Ordenação do ranking por total de títulos, evolução, ano, nome e filtros; definir explicitamente critério de desempate e exibir legenda de cálculo.
6. Preservar exatamente o Street restaurado — faixas, molduras, fotos, posição de nomes, numeração e identidade dos ranks; nenhuma atualização global de CSS deve transformar novamente essas linhas em cards.

## 4. Edições e chaveamentos (modelo consistente e profissional)
1. Criar página de Edições com busca, filtro por ano/status/campeão, detalhes e histórico de revisões. Cada edição tem ID estável, número exibido, data, local, organizador opcional, descrição, status (`draft`, `ready`, `published`, `archived`) e anexos.
2. Suportar torneios de **4, 8 e 16 MCs**, com confrontos, fases, progressão automática, placares de melhor de N, critérios de W.O., desempate, ausência e cancelamento; permitir confirmação manual do administrador.
3. Armazenar participantes por `mcId` e confrontos por ID; apenas exibir o vulgo como texto. Se um MC for renomeado, preservar a história e as ligações.
4. Validar participantes únicos, chaves completas, progressão coerente, vencedores pertencentes ao confronto, placar compatível com formato, campeão da final e status de publicação. Rascunhos podem estar incompletos, publicados não.
5. Registrar se uma vitória da edição corresponde a um **título já incluído na contagem do MC**, sem duplicação. Migrar vínculos antigos `{mcId, year, ordinal}` para `titleRecordId` estável, preservando o ordinal como etiqueta legada quando necessário.
6. Aceitar título sem ano confirmado usando campo explícito. Antes de confirmar vínculo, mostrar MC, ano, posição na contagem, edição e campeão, verificar integridade e prevenir dois chaveamentos usando a mesma conquista.
7. Ao excluir MC, alterar ano/contagem, remover título ou alterar campeão, sinalizar vínculos afetados, bloquear publicação inconsistente e exigir resolução explícita. Não destruir vínculos silenciosamente.
8. O vínculo pode ser opcional em **rascunho**, mas para edições definidas como conquistadoras de título deve ser obrigatório no estado publicado. Se o evento não premiar título, marcar claramente `awardsTitle=false` e não exigir vínculo.
9. Ao editar chaveamento, não mutar o registro original antes de validar tudo; salvar uma cópia validada de uma vez. Oferecer desfazer, modo rascunho, comparação antes/depois e log.
10. Mostrar chaveamento completo na página de edição, no perfil e no card do MC vencedor (botão acessível), e carrossel quando houver edição real. Exibir também vice, semifinalistas, data e status quando comprovados.
11. Ter modo de demonstração com marca d’água “EXEMPLO — NÃO OFICIAL” e dados isolados, nunca incluídos no ranking oficial, arquivo JSON público ou relatório de conquistas.
12. Oferecer visualizações de chaveamento legíveis no celular (rolagem horizontal com aviso, zoom e alternativa textual por fases), 4/8/16 participantes, com navegação por teclado.
13. Permitir importação/ exportação das edições e geração de um histórico individual de confrontos por MC, mantendo conformidade com dados históricos registrados.

### Esquema indicativo (adapte ao código sem perder informações)
```json
{
  "schemaVersion": 2,
  "mc": {"id":"mc-estavel", "name":"Vulgo", "titles":{"2026":3}},
  "titleRecord": {"id":"titulo-estavel", "mcId":"mc-estavel", "year":"2026", "legacyOrdinal":2, "verified":false},
  "edition": {"id":"edicao-estavel", "editionNumber":42, "status":"draft", "awardsTitle":true, "bracketId":"chave-estavel", "titleRecordId":"titulo-estavel"},
  "bracket": {"id":"chave-estavel", "size":8, "participantMcIds":[], "matches":[], "championMcId":null}
}
```
*O exemplo demonstra estrutura, não inventa um resultado real. Mantenha um mecanismo de reconciliação entre contagem agregada e registros individuais.*

## 5. Galeria e memória cultural
1. Fotos grandes, sem cortes desnecessários, descrição **somente ao abrir**, suporte a fotografia, flyer, vídeo e premiação; separar coleções e criar álbum com capa.
2. Exibir data confirmada/aproximada, créditos/autoria, autorização de uso, MCs marcados, tags, alt text e legenda; respeitar privacidade e direitos sobre imagens.
3. Upload com compressão sem perder original quando necessário, tamanho máximo, extensão/MIME validada, orientação, foco de recorte, indicação de progresso e recuperação de erros.
4. Importar backups da galeria sem substituir silenciosamente, com prévia, detecção de duplicatas e relatório de itens aceitos/rejeitados.
5. Não criar fotografias ou registros inexistentes. Quando o acervo estiver vazio, apresentar estado vazio com chamada para cadastro do admin.

## 6. Site público: padrões de um site completo
1. Cabeçalho e navegação claros: Início, Ranking, Edições, Galeria, Calendário, Sobre, Contato; busca e indicador de página ativa. Menu móvel com foco correto.
2. Home com resumo cultural, indicadores históricos reais, CTA para ranking e edições, próximas datas confirmadas e destaques configuráveis. Nenhum número fictício.
3. Páginas separadas de MC, edição, galeria e evento com URLs estáveis/compartilháveis, links internos e botão voltar consistente.
4. Rodapé com identidade, contatos configurados, política de privacidade, termos, créditos, redes oficiais e aviso de dados históricos em atualização.
5. Estados completos: vazio, carregando, erro de conexão, indisponível, registro arquivado, 404 e ação de tentar novamente.
6. Metadados SEO por página, títulos únicos, descrição, canonical, Open Graph real, sitemap/robots quando compatíveis com hospedagem. Não apontar para links/OG que não existem.
7. Suporte mobile-first, zoom, leitores de tela, teclado, contraste, labels, aria-live para avisos, gerenciamento de foco dos modais, nomes acessíveis de botões e animações opcionais. Alvo: práticas WCAG 2.2 AA.
8. Otimizar imagens, lazy-loading, fontes locais ou estratégia adequada de fallback, CSS/JS em cache, carregamento progressivo, menos duplicação de fotos em base64 e métricas de desempenho. Não tocar na aparência dos cards Street.
9. Preferências de redução de movimento; carrossel pausável e sem disparar música automaticamente sem gesto e permissão. Botão de pausar música e volume persistente.
10. Responsividade em telas 320, 375, 390, 768, 1024 e 1440 px; evitar barras e modais que escapem do viewport, preservar leitura do ranking.
11. Compatibilidade nos navegadores atuais: Chrome, Firefox, Safari e Edge; com testes em Android/iOS quando possível.
12. Informações de privacidade adequadas ao que o site realmente coleta; minimização dos dados, aviso sobre serviços externos e canal para correção de dados pessoais quando pertinente. Revisar conforme legislação aplicável, sem afirmar conformidade jurídica só por exibir uma página.

## 7. Painel de administração totalmente configurável
Criar navegação administrativa consistente com busca interna, atalhos, breadcrumbs, ajuda de cada opção e **pré-visualização antes de salvar/publicar**.

Configurações editáveis, sempre com valores padrão e opção de restaurar/desfazer:
- Geral: nome BDF, slogan, logo, descrição, ano do evento, contatos, redes, domínio, URLs e SEO, ordem das seções, mostrar/ocultar blocos.
- Design: modo escuro/claro opcional, paleta, contraste, fontes, tamanhos, espaçamento, largura da página, header, menu, footer, estilos de botão, sombras, transições e animações.
- Ranking: layouts Clássico/Street, preservação de perfis, campos visíveis, ordens, desempates, ranks, cores, limiares, filtros, badges, zoom, importação e exportação.
- MCs: cadastro, edição, arquivo, histórico anual, atribuições, fotos, tags e destaques com auditoria.
- Edições/chaves: participantes, formato, data, placares, resultados, título histórico, status, prévia e publicação.
- Carrossel: habilitar, velocidade, pausa, direção, fotos circulares, posições de recorte, conteúdo de resumo, navegação e acessibilidade.
- Galeria: álbuns, mídia, capa, enquadramento, ordem, filtros, descrições por clique, tags, backup e permissões.
- Calendário: eventos, horários, local, detalhes, status, confirmação e links seguros.
- Música: habilitar por padrão desligado, playlists próprias/licenciadas, volume, ordem, autoplay somente permitido, controles do visitante.
- Páginas e conteúdo: Sobre, Contato, Política, Termos, FAQs e páginas vazias, com preview.
- Usuários e permissões: convites, papéis, MFA, histórico de login, revogação e alertas.
- Dados: exportação **completa** (MCs, cfg, tiers, events, log, gallery, champions2026, brackets, titleRecords, links e metadados); importação validada, migração de versão e restauração seletiva.
- Publicação: prévia em homologação, comparação de mudanças, confirmação, confirmação do retorno da API e rollback.
- Auditoria: filtros por autor, data, tipo de registro, diferenças e exportação; logs privados.
- Acessibilidade: idioma, contraste, reduzir movimento, foco visível e opção de pausar carrossel.

## 8. Visual moderno sem mexer nos cards
1. Preservar o preto profundo, gradientes discretos e laranja como destaque, com contrastes legíveis.
2. Melhorar o cabeçalho, alinhamento da navegação e menu responsivo; usar indicadores de aba ativa e espaçamento consistente.
3. Dar respiro às seções, melhorar hierarquia visual de títulos/subtítulos, filtros e botões, ajustar área útil e rodapé.
4. Usar transições leves somente quando permitido; evitar parallax/poluição visual e ornamentação nova nos cards.
5. **Não alterar HTML/CSS das classes `.card`, `.sr` e elementos descendentes usados pelos cards Street; se ajustes globais as afetarem, rever o seletor.** Validar por comparação visual lado a lado antes de aceitar.
6. Produzir previews desktop e mobile e lista exata de diferenças CSS.

## 9. Backups, publicação e infraestrutura
1. Unificar as rotinas de exportação: remover o backup parcial legado ou rotulá-lo como legado e jamais oferecê-lo como backup completo.
2. Exportação integral JSON versionada com timestamp e checksums; importação com validação de schema, preview de impactos, proteção contra duplicatas, restore e relatório.
3. Repositório com branches de desenvolvimento/homologação/produção, revisão, CI com testes, builds de produção sem admin local e rollback de release.
4. Não enviar fotos ao GitHub antes de validar todo o restante sem um plano de compensação; usar publicação consistente ou estratégia transacional/recuperável.
5. Mídia em armazenamento apropriado, com URLs seguras, limites, cache, backups e respeito a quotas.
6. Monitoramento de erros sem vazamento de dados privados; relatórios técnicos para admin e mensagens legíveis para visitante.
7. Segurança de domínio: HTTPS, cabeçalhos corretos, gerenciamento de segredos somente no servidor/provedor, sem hardcode no front-end.

## 10. Testes e critérios de aceite (obrigatórios)
- Abrir as páginas e navegar por mouse, toque e teclado em desktop/mobile; sem erros de JavaScript bloqueantes.
- Confirmar **29 MCs e 287 títulos da base original** antes e após migração sem vínculos adicionais gerando título extra.
- Validar os estilos Street restaurados com comparação de screenshot por regressão visual: faixas independentes, molduras e cores intactas.
- Criar e remover rank, alterar limiar e restaurar; contagem de títulos idêntica.
- Criar chave de 4/8/16, avançar resultados, testar W.O., salvar e reabrir, rejeitar vencedor não participante.
- Vincular título existente uma vez; impedir duplicação e vínculo de campeão errado; testá-lo em perfil, card e página da edição.
- Testar alteração de nome, exclusão/arquivamento de MC, mudança de ano de título e validações de integridade.
- Rascunhos não aparecem na consulta pública nem no JSON distribuído ao visitante.
- Exportar backup completo, restaurar em navegador novo, comparar checksums e totalizações, rejeitar JSON malformado sem perder a base.
- Confirmar que visitante não consegue gravar por API; editor não administra usuários; administrador publica apenas após autenticação validada no servidor.
- Testar erros de rede, conflito de versão, quota local, upload inválido e interrupção de publicação.
- Verificar acessibilidade, performance, SEO, OG, responsividade, estados vazios e privacidade antes de liberar.
- Manter changelog com cada alteração e entregar ZIP/source, README, relatório de testes e lista de pendências.

## Formato da entrega
1. Resumo das falhas reais da V8 (com arquivo/função/causa/gravidade) e o que é apenas sugestão de melhoria.
2. Código V9 candidato com build de prévia local, build pública segura separada e instruções específicas de ambiente/credenciais **sem incluir segredos**.
3. Prompt/relatório detalhado de todos os painéis e configurações, esquema de migração e validação de dados.
4. Prints comparativos de home/menu/seções em 390px e 1440px, e Street intocado.
5. Relatório de testes automatizados e manuais, resultados, itens não testados, riscos e decisões pendentes.
6. Somente depois de testes e autorização explícita: plano de publicação e rollback.

**Condições de bloqueio:** não declarar a V9 “definitiva” se houver credenciais de teste no front-end, permissões administrativas apenas no cliente, rascunhos dentro de JSON público, dados históricos perdidos, backup incompleto apresentado como completo, resultados inventados ou mudanças não aprovadas no Street.