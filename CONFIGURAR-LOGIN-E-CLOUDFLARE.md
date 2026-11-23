# Configurar a V9 no Cloudflare Pages — guia em português

**Situação:** o código de login e os endpoints administrativos estão implementados, mas o acesso real só funcionará após você criar a conta Firebase, configurar as variáveis da Cloudflare e fazer a primeira implantação. Não me envie senhas, tokens ou códigos de verificação.

## Etapa 0 — mantenha o projeto antigo seguro

1. Faça download de um backup da V8. Guarde em local privado. Não inclua logs históricos internos ou backups integrais no site público.
2. **Não** arraste este ZIP para o botão “Arraste e solte seus arquivos” da Cloudflare: o envio direto pelo painel não instala as Pages Functions. Para esta V9, use **Conectar GitHub** ou a CLI Wrangler. [Documentação oficial](https://developers.cloudflare.com/pages/functions/get-started/).
3. Primeiro use um **repositório de teste**, diferente do site atual, ou uma branch de homologação. Não substitua o site público até verificar a configuração.

## Etapa 1 — criar a conta do administrador no Firebase

1. Acesse https://console.firebase.google.com/ e clique em **Adicionar projeto**.
2. Escolha um nome como `batalha-da-foice-admin`, conclua o assistente e abra o projeto.
3. No menu esquerdo, abra **Criação / Authentication (Autenticação)**. Clique em **Começar**.
4. Abra **Método de login** e habilite **E-mail/senha**. Não habilite cadastros públicos no seu site.
5. Na aba **Usuários**, clique em **Adicionar usuário**, digite seu e-mail e uma senha forte criada por você. Esse procedimento registra o **primeiro administrador**; o visitante não consegue se registrar por conta própria.
6. Copie o **UID** (identificador do usuário) exibido no Firebase. Você usará esse valor na Cloudflare. Não é sua senha.
7. Vá a **Configurações do projeto** (ícone de engrenagem) e procure o **ID do projeto** (ex.: `bdf-admin-123`) e a **Chave de API da Web**. Se necessário, adicione um aplicativo do tipo **Web** (ícone `</>`); não confunda a chave da Web com chaves privadas de contas de serviço.
8. No arquivo **`auth-config.js`**, substitua o texto `COLE_A_CHAVE_WEB_DO_FIREBASE_AQUI` pela sua **Chave de API da Web**. Essa chave é identificador público da aplicação; mantenha os controles de autenticação no servidor.
9. No Firebase, confira se o domínio `.pages.dev` usado pelo projeto é autorizado para os métodos de login configurados, quando exigido pelo provedor.

## Etapa 2 — criar o armazenamento Cloudflare KV

1. No painel https://dash.cloudflare.com/, abra **Workers e Pages** e procure **KV / Workers KV** (o nome pode aparecer na área de armazenamento).
2. Crie um namespace, por exemplo **`bdf-v9-dados`**.
3. Entre no seu projeto Pages, depois em **Configurações → Bindings (Vinculações) → Adicionar → KV namespace**.
4. Em **Nome da variável**, digite **`BDF_KV`** (exatamente). Escolha o namespace `bdf-v9-dados` e salve.
5. Configure também o namespace para o ambiente de **produção**. O ambiente de prévia deve usar um namespace de teste separado, caso você habilite publicações de testes.

## Etapa 3 — definir os identificadores privados de autorização

No mesmo projeto Pages, vá a **Configurações → Variáveis e segredos / Variables and Secrets** (a localização pode variar conforme a interface) e configure:

| Nome da variável | Valor |
|---|---|
| `FIREBASE_PROJECT_ID` | O ID do projeto Firebase criado na etapa 1 |
| `BDF_ADMIN_UID` | O UID do seu usuário administrador no Firebase |

A Cloudflare enviará esses valores às Pages Functions. **Não coloque `BDF_ADMIN_UID` no HTML nem no `auth-config.js`**, e nunca coloque senha ou token do GitHub no repositório. Se houver opções de variáveis por ambiente, configure produção e prévia separadamente.

## Etapa 4 — publicar com GitHub integrado ao Pages

1. Extraia o pacote `Batalha-da-Foice-V9-candidata.zip` e abra a pasta `Batalha-da-Foice-V9-candidata`.
2. Faça upload **apenas dos arquivos do conteúdo da pasta** para um novo repositório privado no GitHub. O `index.html`, `data.json`, `auth-config.js`, `_routes.json` e a pasta `functions/` devem ficar na raiz. **Não envie o arquivo de backup privado que entrego separadamente.**
3. No Cloudflare Pages escolha **Importar repositório Git existente**, conecte seu GitHub, autorize o repositório de teste e selecione-o.
4. Selecione Pages como tipo de projeto e use **nenhum framework** / site estático. Normalmente, deixe o comando de build vazio e use `.` como diretório de saída (raiz), ajustando se o painel solicitar um caminho diferente.
5. Confirme a implantação. A Cloudflare vai criar o endereço `.pages.dev`. Aguarde a conclusão.
6. No painel do projeto, confira as vinculações **BDF_KV**, as duas variáveis de ambiente e reimplante, se tiver acrescentado variáveis após o primeiro deploy.
7. Abra `https://SEU-ENDERECO.pages.dev/api/public`. A resposta deve ser JSON com os dados do ranking, sem a lista de logs privados. Se aparecer 404 ou uma página de erro, as Functions não foram implantadas.
8. Verifique `https://SEU-ENDERECO.pages.dev/api/admin/session` **sem login**: deve responder `401` (ou `503` caso a infraestrutura ainda não esteja configurada), nunca dar acesso sem credenciais.
9. Abra o site e use **Área administrativa**, informe o e-mail e a senha que você criou no Firebase. O servidor verificará a assinatura do token Firebase e comparará o UID com `BDF_ADMIN_UID`.
10. No painel, faça uma mudança pequena, clique em **Salvar rascunho na nuvem**, revise e só então clique em **Publicar no site**. Confirme pelo ranking público em outra aba anônima.

## Como entrar depois e recuperar a senha

- Abra o site, clique em **Área administrativa** e faça login com o e-mail/senha do Firebase.
- A senha **não fica armazenada no `index.html` ou no `data.json`**; o Firebase a verifica.
- Se esquecer, digite seu e-mail na tela de login e selecione **Esqueci minha senha**. Consulte também os modelos de e-mail do Firebase.
- O acesso é restrito ao **UID autorizado**. Criar outro usuário no Firebase **não dá automaticamente acesso administrativo**.
- Esta V9 pede login novamente após atualizar a página; o token é mantido somente na memória da aba. Ao vencer a sessão, entre novamente.

## O que foi de fato implementado

- Página com o ranking, Street restaurado e a identidade visual original; ajustes discretos no entorno da página.
- Login e recuperação de senha pelo Firebase (dependem de configuração externa).
- Autorização de servidor por assinatura, emissor, projeto, validade e UID do Firebase.
- Rascunho protegido em KV, publicação protegida e revisão para impedir algumas atualizações conflitantes.
- API pública separada sem o log administrativo. Backup da versão anterior mantido fora do diretório público.
- Validação básica de MCs, títulos, ranks, chaveamentos e estados de publicação.

## Pendências / limites antes de declarar a versão definitiva

1. **O login real e as gravações não foram testados em uma conta Cloudflare/Firebase conectada.** São necessários testes depois de configurar as contas.
2. O KV tem consistência eventual, e o esquema atual foi desenvolvido para um único administrador; para múltiplos editores simultâneos, migrar para D1 e transações.
3. A interface ainda preserva bastante JavaScript legado monolítico; não foram concluídos todos os itens da especificação V9 (papéis de editor, MFA obrigatório, calendário avançado, upload R2, auditoria completa, testes de acessibilidade e testes ponta a ponta em celulares reais).
4. O upload de arquivos grandes e fotos em base64 deve ser substituído por armazenamento de mídia em R2 para uso intenso.
5. Precisamos revisar e endurecer CSP, sanitização de conteúdo e autenticação com tokens revogados antes de um lançamento com dados sensíveis; a assinatura é verificada, mas não há consulta de revogação por usuário a cada requisição.
6. Faça backup antes de qualquer publicação importante e confirme os totais de MCs e títulos.

## Fontes oficiais
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/get-started/)
- [Bindings de Pages (KV)](https://developers.cloudflare.com/pages/functions/bindings/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Gerenciamento de usuários do Firebase](https://firebase.google.com/docs/auth/web/manage-users)