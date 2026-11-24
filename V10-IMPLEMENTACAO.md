# Batalha da Foice — V10 (branch de revisão)

**Branch:** feature/v10-reformulacao
**Base:** main (V9). **Não fazer merge nem publicar em produção sem revisão do proprietário.**

## Implementação presente no código

- Página inicial: chaveamento mais recente, Hall dos 3 MCs com mais títulos, prévia do ranking histórico, Confronto Direto, link do Ranking Anual e Destaques da Semana.
- Ranking Geral: inclui apenas MCs com pelo menos um título. MCs com zero títulos permanecem no cadastro e podem integrar torneios e o Ranking Anual.
- Ranking Anual: TOP 16, temporadas isoladas, seleção administrativa de MCs, pontos editáveis (segunda fase 2; semifinal 4; vice 7; campeão 10), bônus +1 por vitória 2 × 0 e ajustes manuais justificados.
- Pontuação das fases: usa somente a fase mais avançada em cada edição, sem somar os pontos de fases anteriores. Bônus 2 × 0 é acumulativo, mas não vale para Double Three.
- Confronto Direto: fotos de dois MCs, comparação de vitórias registradas, histórico por edição, sem inventar resultados nem contar Double Three como duelo entre dois MCs.
- Edições: a mais recente em destaque; as anteriores continuam no histórico. O editor aceita confrontos de 2 ou 3 MCs, com 3 placares individuais e somente um vencedor.
- MCs: listagem administrativa renovada, inclusive sem títulos, com abas próprias para tags, estados, vídeos, ranking anual e destaques. Formulário original mantido com navegação melhorada.
- Perfis: fotos vinculadas à galeria e vários vídeos por MC. YouTube roda por incorporação após clique, sem autoplay; vídeos enviados usam a rota /api/video.
- Salvamento: rascunho local, além do botão geral **Salvar e Publicar**, com autenticação Firebase, validação no servidor e confirmação da revisão publicada.
- Login: botão "Entrar" removido do menu; atalho Ctrl + Shift + A abre o login no computador. O painel e a proteção de servidor da V9 são preservados; acesso pelo logo no celular foi retirado.

## Configuração para upload de vídeos (obrigatória)

1. Criar um bucket R2 na conta Cloudflare.
2. Na configuração do projeto Cloudflare Pages > Settings > Functions > R2 bucket bindings, criar a vinculação de variável **BDF_R2** apontando para esse bucket, para o ambiente de testes e, depois da aprovação, produção.
3. Preservar as configurações existentes BDF_KV, FIREBASE_PROJECT_ID e BDF_ADMIN_UID.
4. Fazer login administrativo no navegador e testar upload de MP4 ou WebM (até 25 MB por arquivo), reprodução, exclusão da referência e publicação.
5. Confirmar os custos e o uso do armazenamento R2 antes de subir vídeos reais.

**Importante:** retirar um vídeo do perfil não apaga imediatamente o arquivo físico do R2. A limpeza de arquivos órfãos ainda não está implementada. O vídeo enviado existe no R2 antes de sua referência ser publicada; o nome é aleatório e não listado.

## Segurança, compatibilidade e dados

- Os arquivos originais data.json e os títulos antigos não foram alterados na branch. Nenhum resultado antigo foi inventado.
- Campos novos ficam em m.tags, m.videos, bracket.triples e cfg.v10.seasons, para evitar uma migração destrutiva.
- functions/api/_lib.js valida esses campos no servidor, e v10-core.js concentra regras compartilhadas pelo navegador e servidor.
- Login oculto não é mecanismo de segurança; Firebase e a autorização pela UID no servidor continuam obrigatórios.
- O upload foi limitado a 25 MB e os arquivos são verificados por tipo e assinatura.
- A versão para celular não recebe painel de administração. Layout e performance mobile ainda precisam de teste manual antes do merge.

## Verificações e pendências

Os testes de regressão em tests/smoke.mjs e tests/v10.mjs foram adicionados a npm test. Há uma workflow de CI para Node e checagem de sintaxe.

**Antes da aprovação final:** testar em navegador real a navegação, edição de chaves, evolução de vencedores, atualização de rankings, login, persistência do Cloudflare KV, upload R2, reprodução dos vídeos e responsividade. Também verificar se dados administrativos antigos carregam corretamente após a atualização. Nenhum teste com credenciais reais foi feito por esta alteração.

**Limites atuais:** ainda não há transações fortes em KV, exclusão física automatizada de mídia, edição avançada das fotos por MC, nem testes completos de acessibilidade e visualização mobile. O trabalho está pronto para revisão técnica, mas não deve ser tratado como release final.

## Como revisar sem publicar

Use o Pull Request em rascunho (quando criado) para conferir o código e os testes. Uma prévia do Cloudflare Pages só deve ser usada com dados de testes, sem modificar o ambiente de produção. Não fazer merge para main antes de verificar todos os itens acima.
