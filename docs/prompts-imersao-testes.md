# Prompts para imersão nos testes – conversando com a IA

Use estes prompts quando estiver **conversando com uma IA** (Cursor, ChatGPT, Claude, etc.) para ter uma experiência imersiva: você escolhe se quer **digitar os dados** (nome, e-mail, senha, idade) ou **deixar a IA preencher** com valores aleatórios, e se a execução será **manual** (passo a passo no site) ou **automatizada** (Cypress aberto para ver o navegador rodando).

**Os testes usam os dados que você informar.** Você pode passá-los conversando com a IA, pelo agente (`node qa-agent.js run_tests`) ou pelo terminal com variáveis de ambiente.

---

## Melhor forma de executar o prompt

| Situação | O que fazer |
|----------|-------------|
| **Você está no Cursor (ou outra IA) com o projeto QA Lab aberto** | Basta **pedir em uma frase**. Ex.: *"Vamos rodar o teste de registro no modo imersivo"* ou *"Execute o docs/prompts-imersao-testes.md"*. A IA segue o fluxo: pergunta manual/automatizado, dados (digitar/aleatório), e te guia ou te passa o comando do Cypress. **Não precisa colar nada.** |
| **Chat novo ou IA que não conhece o QA Lab** | **1)** Cole o bloco da **Sessão 2** (prompt de contexto) no primeiro mensagem. **2)** Na próxima mensagem, diga qual teste quer: *"Quero rodar o de registro"*, *"Teste de edição de idade"*, etc. A IA assume o papel e pergunta manual/automatizado e dados. |

**Resumo:** No Cursor com o repo aberto → só pedir. Em qualquer outro chat → colar a Sessão 2 e em seguida dizer o teste que quer rodar.

---

## Por que colar o prompt de contexto? E quando não precisa?

O guia pede para **colar a Sessão 2** (prompt de contexto) no início da conversa porque ele foi feito para funcionar em **qualquer** chat com qualquer IA (Cursor, ChatGPT, Claude, etc.). Em uma conversa **nova** ou em uma IA que **não conhece** o QA Lab, essa IA não sabe que deve:

- perguntar se você quer manual ou automatizado,
- perguntar se os dados são digitados ou aleatórios,
- dar passo a passo no site ou abrir o Cypress para você ver.

Por isso o texto da Sessão 2 “configura” a IA: ao colar, você está dizendo o **papel** (assistente de QA do QA Lab) e as **regras** (reunir informações, manual = passo a passo, automatizado = Cypress aberto).

**Quando você NÃO precisa colar:**  
Se você já está numa conversa com uma IA que **já conhece** o projeto (por exemplo, no Cursor, com o repositório aberto e a documentação disponível), pode **só pedir** o modo imersivo. Por exemplo: *“Vamos rodar o teste de registro no modo imersivo”* ou *“Execute o docs/prompts-imersao-testes.md”*. A IA pode seguir as mesmas regras (perguntar manual/automatizado, dados digitados/aleatórios, etc.) sem você colar o bloco. O “cole” no guia existe para quando a IA ainda não tem esse contexto.

---

## Índice

| Sessão | Conteúdo |
|--------|----------|
| **1** | Visão geral: coleta de informações, como os dados entram nos testes, manual vs automatizado |
| **2** | Prompt de contexto (cole no início da conversa) |
| **3** | Prompts por cenário (registro, login, edição de idade, fluxo completo, qualquer teste) |
| **4** | Exemplo de conversa |
| **5** | Resumo rápido |

---

# Sessão 1 – Visão geral

## 1.1 Coleta de informações (a IA deve seguir sempre)

Antes de executar qualquer teste que use dados, a IA deve **reunir**:

1. **Qual teste** (ex.: registro, registro+login, login admin, edição de idade, suite admin, etc.).
2. **Modo de execução:**
   - **Manual** – a IA mostra o teste **abrindo o site** e te guia passo a passo com os dados fornecidos (você abre http://localhost:3000 e segue as instruções).
   - **Automatizado** – a IA roda o **Cypress em modo aberto** (`cypress open`) com o spec e as variáveis de ambiente, para você **ver o navegador** e o Cypress executando o teste na tela.
3. **Dados:** conforme o teste: nome, e-mail, senha e/ou idade. A IA pergunta se você quer **digitar** ou usar **aleatório**; se digitar, pede campo a campo e confirma.

Depois:
- **Se manual:** a IA te passa um **passo a passo** para abrir o site e fazer o teste com exatamente esses dados (como se estivesse "mostrando" o teste na sua frente).
- **Se automatizado:** a IA executa o Cypress em **modo aberto** (não headless), com o spec correto e as env vars, para você assistir à execução no navegador.

---

## 1.2 Como os dados entram nos testes

Os specs de **registro/login** usam `Playground.getRegisterName()`, `getRegisterEmail()` e `getRegisterPassword()`: se existir `CYPRESS_REGISTER_NAME` (e equivalentes), esse valor é usado; senão, é gerado aleatório. Os testes de **edição de idade** no admin usam `getEditIdade()`: se existir `CYPRESS_EDIT_IDADE` (entre 18 e 80), usam esse valor; senão, aleatório.

- **Pelo agente:** ao rodar `cd agents && node qa-agent.js run_tests`, responda **s** na pergunta "Quer informar dados para imersão?" e preencha nome, e-mail, senha e/ou idade (Enter em qualquer campo = aleatório). O agente envia esses valores para o MCP, que repassa ao Cypress como variáveis de ambiente.
- **Pelo terminal (sem agente):**  
  `CYPRESS_REGISTER_NAME="Maria" CYPRESS_REGISTER_EMAIL="maria@teste.com" CYPRESS_REGISTER_PASSWORD="minhasenha" CYPRESS_EDIT_IDADE=25 npx cypress run --spec "cypress/e2e/auth/register-full-flow.cy.js"`  
  (rode de dentro da pasta `tests`).
- **Na conversa com a IA:** peça que ela rode o comando acima (ou o agente) com os valores que você escolheu; ela pode usar o agente com dados imersivos ou montar o comando com as env vars.

---

## 1.3 Manual vs automatizado – o que a IA deve fazer

### Se a pessoa escolher MANUAL
A IA deve reunir os dados (nome, e-mail, senha, idade conforme o teste) e depois **escrever um passo a passo** para a pessoa executar no navegador, como se estivesse mostrando o teste na frente dela: abrir http://localhost:3000, ir na seção correta (Registrar, Login ou Dashboard admin), preencher cada campo com os valores combinados, clicar nos botões e descrever o que deve aparecer para validar (ex.: Status 201, Bem-vindo de volta).

**Exemplo (registro):** "1) Abra http://localhost:3000. 2) Seção Registrar usuário: Nome = Carla Teste, E-mail = carla.teste@qa.com, Senha = senha456. 3) Clique em Registrar. 4) Deve aparecer Status 201 e resumo do usuário."

### Se a pessoa escolher AUTOMATIZADO
A IA deve rodar o **Cypress em modo aberto** para a pessoa **ver o navegador** executando o teste. Comando (pasta `tests`):  
`CYPRESS_REGISTER_NAME="..." CYPRESS_REGISTER_EMAIL="..." CYPRESS_REGISTER_PASSWORD="..." npx cypress open --e2e`
  
  Depois que o Cypress abrir, **selecione o spec** na lista (ex.: `auth/register-full-flow.cy.js`) e clique em Run.  
(para idade: `CYPRESS_EDIT_IDADE=25` em specs de admin). Specs: registro = register-full-flow.cy.js; registro+login = register-and-login.cy.js; login = login-admin.cy.js; edição idade = admin-dashboard-editar-idade-id1.cy.js. Depois de abrir o Cypress, dizer: "Clique em Run para ver o teste rodando no navegador."

---

# Sessão 2 – Prompt de contexto (cole quando a IA ainda não conhece o fluxo)

Use este bloco para a IA entender o cenário e o tom da conversa **em chats novos ou em IAs que ainda não sabem que devem perguntar manual/automatizado e dados**. Se você já está no Cursor (ou em outro ambiente onde a IA já conhece o projeto), pode apenas pedir o modo imersivo sem colar.

```
Você é meu assistente de QA no projeto QA Lab. O projeto tem:
- Frontend (Next.js) com registro, login e dashboard admin
- Backend (Express + PostgreSQL)
- Testes Cypress organizados em: auth (registro, login, logout), api (health, criação de usuários), admin (dashboard: editar idade, validação 18–80, inativo, filtro, exclusão), ui (elementos da tela)
- Um agente (node qa-agent.js run_tests) que abre um menu para eu escolher qual teste rodar

Quero uma experiência imersiva: para cada teste que envolva dados (registro, login, edição de idade), você:

1) **Reúne as informações:** qual teste vamos rodar; se a execução será **manual** (eu abro o site e você me guia passo a passo com os dados) ou **automatizada** (você abre o Cypress e eu vejo o navegador executando o teste); e os dados (nome, e-mail, senha, idade) – perguntando se eu digito ou se você usa aleatório (campo a campo se eu digitar).

2) **Se eu escolher MANUAL:** me dê um passo a passo claro para abrir o site (http://localhost:3000), ir até o formulário certo e preencher com os dados que combinamos, como se você estivesse mostrando o teste na minha frente. Ex.: "Abra http://localhost:3000. Na seção 'Registrar usuário', preencha Nome com X, E-mail com Y, Senha com Z. Clique em Registrar. Você deve ver o resumo com Status 201..."

3) **Se eu escolher AUTOMATIZADO:** rode o Cypress em **modo aberto** (não headless), para eu ver o navegador e o teste acontecendo. Use o comando que abre a interface do Cypress com o spec correto e as variáveis de ambiente, por exemplo (a partir da pasta `tests`):  
CYPRESS_REGISTER_NAME="..." CYPRESS_REGISTER_EMAIL="..." CYPRESS_REGISTER_PASSWORD="..." npx cypress open --e2e
  
  Depois selecione o spec na lista (ex.: auth/register-full-flow.cy.js) e clique em Run.

Seja direto, amigável e um pouco teatral para a imersão ficar divertida.
```

---

# Sessão 3 – Prompts por cenário

Use cada bloco abaixo quando for rodar aquele tipo de teste. Cole no chat junto com (ou depois de) o prompt de contexto.

---

## 3.1 Registro de usuário (nome, e-mail, senha)

Cole quando for rodar testes de **registro** (ex.: register-full-flow, register-and-login):

```
Vamos rodar o teste de REGISTRO de usuário. Preciso que você:

1) Me pergunte se quero MANUAL (você me guia abrindo o site e preenchendo com os dados) ou AUTOMATIZADO (você abre o Cypress e eu vejo o navegador rodando o teste).
2) Me pergunte se quero digitar nome, e-mail e senha ou se você usa dados aleatórios (se digitar, peça um por um e confirme).
3) Se MANUAL: me passe um passo a passo para abrir http://localhost:3000, ir na seção "Registrar usuário", preencher Nome, E-mail e Senha com os valores combinados, clicar em Registrar e verificar o resumo (Status 201).
4) Se AUTOMATIZADO: rode o Cypress em modo aberto com as variáveis para eu ver o teste na tela. Na pasta tests: `CYPRESS_REGISTER_NAME="..." CYPRESS_REGISTER_EMAIL="..." CYPRESS_REGISTER_PASSWORD="..." npx cypress open --e2e`. Depois selecione o spec (ex.: auth/register-full-flow.cy.js) na lista e clique em Run.
```

---

## 3.2 Login (e-mail e senha)

Cole quando for rodar testes de **login** (login-admin, register-and-login após registro):

```
Agora é o teste de LOGIN. Me pergunte:

1) MANUAL ou AUTOMATIZADO?
2) Os dados de login eu digito (e-mail e senha) ou você usa aleatório/do registro anterior? Se for do registro anterior, lembre os dados que usamos; se eu quiser digitar, peça e-mail e senha e confirme.
3) Se MANUAL: passo a passo para abrir o site, ir na seção Login, preencher E-mail e Senha, clicar em Login e verificar /dashboard e "Bem-vindo de volta".
4) Se AUTOMATIZADO: Cypress aberto com o spec de login e env vars para eu ver o navegador executando.
```

---

## 3.3 Edição de idade (admin, 18–80)

Cole quando for rodar testes de **edição de idade** (admin-dashboard-editar-idade-id1/2/3):

```
Vamos rodar o teste de EDIÇÃO DE IDADE no painel admin. Me pergunte:

1) MANUAL ou AUTOMATIZADO?
2) A idade (entre 18 e 80) eu digito ou você escolhe uma aleatória?
3) Se MANUAL: passo a passo para abrir o site, fazer login como admin, ir ao dashboard, clicar em Editar no usuário id 1 (ou 2/3), preencher a idade no modal com o valor combinado, salvar e verificar na tabela.
4) Se AUTOMATIZADO: Cypress aberto com o spec de edição de idade (ex.: admin-dashboard-editar-idade-id1.cy.js) e CYPRESS_EDIT_IDADE=... para eu ver o teste rodando no navegador.
```

---

## 3.4 Fluxo completo: registro + login + dashboard

Cole quando quiser uma **imersão contínua** (registro → login → validar dashboard):

```
Quero rodar um fluxo completo: REGISTRO → LOGIN → validar dashboard. Você deve:

1) Perguntar MANUAL ou AUTOMATIZADO.
2) Perguntar se digito nome, e-mail e senha ou se você usa aleatório; para o login, usar os mesmos dados do registro (ou perguntar se quero outros).
3) Se MANUAL: passo a passo para abrir o site, registrar com os dados, depois fazer login com os mesmos dados e verificar que estou no dashboard (Bem-vindo de volta, Sair, etc.).
4) Se AUTOMATIZADO: Cypress aberto com o spec register-and-login.cy.js e as env vars (CYPRESS_REGISTER_NAME, etc.), para eu ver todo o fluxo rodando no navegador.
```

---

## 3.5 Escolher qualquer teste e decidir dados na hora

Cole quando quiser que a IA **sempre pergunte** antes de rodar qualquer teste:

```
Sempre que for rodar um teste que use dados (registro, login, edição de idade):

1) Diga qual teste vamos rodar e o que ele faz.
2) Pergunte: MANUAL (você me guia no site com os dados) ou AUTOMATIZADO (Cypress aberto para eu ver o navegador rodando)?
3) Pergunte: "Você quer digitar os dados (nome/e-mail/senha/idade) ou prefere que eu use aleatório?"
4) Se digitar, peça cada campo e repita em resumo antes de executar.
5) Se MANUAL: passe um passo a passo claro para abrir http://localhost:3000 e fazer o teste com os dados fornecidos.
6) Se AUTOMATIZADO: rode `npx cypress open --e2e` com as variáveis CYPRESS_* na pasta tests; depois selecione o spec na lista e clique em Run para assistir.
```

---

# Sessão 4 – Exemplo de conversa (imersão “surreal”)

**Você:** [cola o Prompt de contexto da Sessão 2]

**IA:** Entendido. Sou seu assistente de QA no QA Lab. Para cada teste com dados, vou perguntar: você quer **manual** (te guio abrindo o site e preenchendo com os dados) ou **automatizado** (abro o Cypress e você vê o navegador rodando)? E se os dados você digita ou eu uso aleatório. Qual teste quer rodar primeiro?

**Você:** Quero rodar o de registro.

**IA:** Beleza! No teste de registro a gente preenche nome, e-mail e senha. Primeiro: você quer **manual** (te passo um passo a passo para abrir o site e preencher) ou **automatizado** (abro o Cypress e você vê o teste rodando no navegador)? E os dados: você **digita** ou uso **aleatórios**?

**Você:** Pode ser aleatório. E quero ver rodando – automatizado.

**IA:** Então vou usar: **Nome:** Carla Teste, **E-mail:** carla.teste@qa.com, **Senha:** senha456. Para você **ver o Cypress executando**, rode na pasta `tests`:  
`CYPRESS_REGISTER_NAME="Carla Teste" CYPRESS_REGISTER_EMAIL="carla.teste@qa.com" CYPRESS_REGISTER_PASSWORD="senha456" npx cypress open --e2e`  
Quando o Cypress abrir, selecione o spec **auth/register-full-flow.cy.js** na lista e clique em **Run**. – aí você vê o navegador abrindo e o teste preenchendo o formulário com esses dados. Se preferir **manual**, te passo o passo a passo para abrir o site e preencher você mesmo.

**Você:** Beleza. E se eu quisesse digitar a idade no teste de admin?

**IA:** No teste de edição de idade do admin a gente só precisa de **uma idade entre 18 e 80**. Você quer **digitar** o número ou que eu **escolha uma aleatória**? Se digitar, me manda o número; se for aleatório, eu te falo tipo "Vou usar 33 anos" e você confirma.

---

# Sessão 5 – Resumo rápido (para colar no “Notas” ou no início do chat)

- **Registro:** Perguntar MANUAL ou AUTOMATIZADO; digitar dados ou aleatório. Manual = passo a passo no site. Automatizado = cypress open com CYPRESS_* na pasta tests; clicar em Run.
- **Login:** Idem (manual = passo a passo no site; automatizado = Cypress aberto com spec de login).
- **Idade (admin):** MANUAL ou AUTOMATIZADO; digitar idade ou aleatória; manual = passo a passo até o modal; automatizado = Cypress aberto com CYPRESS_EDIT_IDADE.
- **Qualquer teste:** Reunir: qual teste, manual/automatizado, dados. Manual = passo a passo em localhost:3000. Automatizado = cypress open com spec e env vars; clicar em Run.

Assim você consegue **conversar com a IA** e ter imersão surreal em cada teste: ou você digita os dados, ou a IA preenche; e você escolhe **manual** (passo a passo no site) ou **automatizado** (Cypress aberto para ver o navegador rodando). Ver a Sessão 1.3 para o que a IA deve fazer em cada caso.
