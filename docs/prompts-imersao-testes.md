# Prompts for immersive test runs – talking to AI

Use these prompts when **talking to an AI** (Cursor, ChatGPT, Claude, etc.) for an immersive experience: you choose whether to **type the data** (name, email, password, age) or **let the AI fill** with random values, and whether execution is **manual** (step by step on the site) or **automated** (Cypress open to watch the browser run).

**Tests use the data you provide.** You can pass it through the AI conversation, the agent (`node qa-agent.js run_tests`), or the terminal with environment variables.

---

## Best way to run the prompt

| Situation | What to do |
|------------|------------|
| **You're in Cursor (or another AI) with the QA Lab project open** | Just **ask in one sentence**. E.g. *"Let's run the registration test in immersive mode"* or *"Execute docs/prompts-imersao-testes.md"*. The AI follows the flow: asks manual/automated, data (type/random), and guides you or gives you the Cypress command. **No need to paste anything.** |
| **New chat or AI that doesn't know QA Lab** | **1)** Paste the **Session 2** block (context prompt) in the first message. **2)** In the next message, say which test you want: *"I want to run the registration one"*, *"Age editing test"*, etc. The AI takes the role and asks manual/automated and data. |

**Summary:** In Cursor with the repo open → just ask. In any other chat → paste Session 2 and then say which test you want to run.

---

## Why paste the context prompt? When don't you need to?

The guide asks you to **paste Session 2** (context prompt) at the start because it was made to work in **any** chat with any AI (Cursor, ChatGPT, Claude, etc.). In a **new** conversation or with an AI that **doesn't know** QA Lab, that AI doesn't know it should:

- ask if you want manual or automated,
- ask if data is typed or random,
- give step-by-step on the site or open Cypress for you to watch.

So Session 2 text "configures" the AI: when you paste it, you're setting the **role** (QA assistant for QA Lab) and the **rules** (gather info, manual = step by step, automated = Cypress open).

**When you DON'T need to paste:**  
If you're already in a conversation with an AI that **knows** the project (e.g. in Cursor with the repo open and docs available), you can **just ask** for immersive mode. E.g.: *"Let's run the registration test in immersive mode"* or *"Execute docs/prompts-imersao-testes.md"*. The AI can follow the same rules without you pasting. The "paste" in the guide exists for when the AI doesn't have that context yet.

---

## Index

| Session | Content |
|---------|---------|
| **1** | Overview: info gathering, how data gets into tests, manual vs automated |
| **2** | Context prompt (paste at the start of the conversation) |
| **3** | Prompts per scenario (registration, login, age editing, full flow, any test) |
| **4** | Example conversation |
| **5** | Quick summary |

---

# Session 1 – Overview

## 1.1 Info gathering (AI should always follow)

Before running any test that uses data, the AI must **gather**:

1. **Which test** (e.g. registration, registration+login, admin login, age editing, admin suite, etc.).
2. **Execution mode:**
   - **Manual** – the AI shows the test **opening the site** and guides you step by step with the provided data (you open http://localhost:3000 and follow instructions).
   - **Automated** – the AI runs **Cypress in open mode** (`cypress open`) with the spec and env vars, so you **watch the browser** and Cypress running the test on screen.
3. **Data:** depending on the test: name, email, password and/or age. The AI asks if you want to **type** or use **random**; if typing, asks field by field and confirms.

Then:
- **If manual:** the AI gives you a **step-by-step** to open the site and run the test with exactly that data (as if "showing" the test in front of you).
- **If automated:** the AI runs Cypress in **open mode** (not headless), with the correct spec and env vars, so you can watch execution in the browser.

---

## 1.2 How data gets into tests

**Registration/login** specs use `Playground.getRegisterName()`, `getRegisterEmail()` and `getRegisterPassword()`: if `CYPRESS_REGISTER_NAME` (and equivalents) exists, that value is used; otherwise, random. **Age editing** tests in admin use `getEditIdade()`: if `CYPRESS_EDIT_IDADE` (between 18 and 80) exists, that's used; otherwise, random.

- **Via agent:** when running `cd agents && node qa-agent.js run_tests`, answer **y** to "Do you want to provide immersion data?" and fill name, email, password and/or age (Enter on any field = random). The agent sends these values to MCP, which forwards them to Cypress as env vars.
- **Via terminal (no agent):**  
  `CYPRESS_REGISTER_NAME="Maria" CYPRESS_REGISTER_EMAIL="maria@test.com" CYPRESS_REGISTER_PASSWORD="mypassword" CYPRESS_EDIT_IDADE=25 npx cypress run --spec "cypress/e2e/auth/register-full-flow.cy.js"`  
  (run from inside the `tests` folder).
- **In conversation with AI:** ask it to run the command above (or the agent) with the values you chose; it can use the agent with immersion data or build the command with env vars.

---

## 1.3 Manual vs automated – what the AI should do

### If the person chooses MANUAL
The AI must gather the data (name, email, password, age as needed) and then **write a step-by-step** for the person to run in the browser, as if showing the test in front of them: open http://localhost:3000, go to the right section (Register, Login, or Admin dashboard), fill each field with the agreed values, click the buttons, and describe what should appear to validate (e.g. Status 201, Welcome back).

**Example (registration):** "1) Open http://localhost:3000. 2) Register section: Name = Carla Test, Email = carla.test@qa.com, Password = pass456. 3) Click Register. 4) You should see Status 201 and user summary."

### If the person chooses AUTOMATED
The AI must run **Cypress in open mode** so the person **sees the browser** running the test. Command (from `tests` folder):  
`CYPRESS_REGISTER_NAME="..." CYPRESS_REGISTER_EMAIL="..." CYPRESS_REGISTER_PASSWORD="..." npx cypress open --e2e`
  
  After Cypress opens, **select the spec** in the list (e.g. `auth/register-full-flow.cy.js`) and click Run.  
(For age: `CYPRESS_EDIT_IDADE=25` in admin specs.) Specs: registration = register-full-flow.cy.js; registration+login = register-and-login.cy.js; login = login-admin.cy.js; age editing = admin-dashboard-editar-idade-id1.cy.js. After opening Cypress, say: "Click Run to see the test running in the browser."

---

# Session 2 – Context prompt (paste when the AI doesn't know the flow yet)

Use this block so the AI understands the scenario and tone **in new chats or with AIs that don't yet know they should ask manual/automated and data**. If you're already in Cursor (or another environment where the AI knows the project), you can just ask for immersive mode without pasting.

```
You are my QA assistant for the QA Lab project. The project has:
- Frontend (Next.js) with registration, login, and admin dashboard
- Backend (Express + PostgreSQL)
- Cypress tests organized in: auth (registration, login, logout), api (health, user creation), admin (dashboard: edit age, 18–80 validation, inactive, filter, delete), ui (screen elements)
- An agent (node qa-agent.js run_tests) that opens a menu for me to choose which test to run

I want an immersive experience: for each test that involves data (registration, login, age editing), you:

1) **Gather information:** which test we're running; whether execution will be **manual** (I open the site and you guide me step by step with the data) or **automated** (you open Cypress and I see the browser running the test); and the data (name, email, password, age) – asking if I type or you use random (field by field if I type).

2) **If I choose MANUAL:** give me a clear step-by-step to open the site (http://localhost:3000), go to the right form and fill with the data we agreed, as if you're showing me the test. E.g.: "Open http://localhost:3000. In the 'Register user' section, fill Name with X, Email with Y, Password with Z. Click Register. You should see the summary with Status 201..."

3) **If I choose AUTOMATED:** run Cypress in **open mode** (not headless), so I can see the browser and test running. Use the command that opens the Cypress UI with the correct spec and env vars, e.g. (from the `tests` folder):  
CYPRESS_REGISTER_NAME="..." CYPRESS_REGISTER_EMAIL="..." CYPRESS_REGISTER_PASSWORD="..." npx cypress open --e2e
  
  Then select the spec in the list (e.g. auth/register-full-flow.cy.js) and click Run.

Be direct, friendly, and a bit theatrical so the immersion is fun.
```

---

# Session 3 – Prompts per scenario

Use each block below when running that type of test. Paste in the chat along with (or after) the context prompt.

---

## 3.1 User registration (name, email, password)

Paste when running **registration** tests (e.g. register-full-flow, register-and-login):

```
Let's run the user REGISTRATION test. I need you to:

1) Ask me if I want MANUAL (you guide me opening the site and filling with the data) or AUTOMATED (you open Cypress and I see the browser running the test).
2) Ask me if I want to type name, email and password or if you use random data (if typing, ask one by one and confirm).
3) If MANUAL: give me a step-by-step to open http://localhost:3000, go to the "Register user" section, fill Name, Email and Password with the agreed values, click Register and verify the summary (Status 201).
4) If AUTOMATED: run Cypress in open mode with the vars so I see the test on screen. From the tests folder: `CYPRESS_REGISTER_NAME="..." CYPRESS_REGISTER_EMAIL="..." CYPRESS_REGISTER_PASSWORD="..." npx cypress open --e2e`. Then select the spec (e.g. auth/register-full-flow.cy.js) in the list and click Run.
```

---

## 3.2 Login (email and password)

Paste when running **login** tests (login-admin, register-and-login after registration):

```
Now it's the LOGIN test. Ask me:

1) MANUAL or AUTOMATED?
2) Do I type the login data (email and password) or do you use random/from the previous registration? If from previous registration, remind me of the data we used; if I want to type, ask for email and password and confirm.
3) If MANUAL: step-by-step to open the site, go to the Login section, fill Email and Password, click Login and verify /dashboard and "Welcome back".
4) If AUTOMATED: Cypress open with the login spec and env vars so I see the browser running.
```

---

## 3.3 Age editing (admin, 18–80)

Paste when running **age editing** tests (admin-dashboard-editar-idade-id1/2/3):

```
Let's run the AGE EDITING test in the admin panel. Ask me:

1) MANUAL or AUTOMATED?
2) Do I type the age (between 18 and 80) or do you pick a random one?
3) If MANUAL: step-by-step to open the site, log in as admin, go to the dashboard, click Edit on user id 1 (or 2/3), fill the age in the modal with the agreed value, save and verify in the table.
4) If AUTOMATED: Cypress open with the age editing spec (e.g. admin-dashboard-editar-idade-id1.cy.js) and CYPRESS_EDIT_IDADE=... so I see the test running in the browser.
```

---

## 3.4 Full flow: registration + login + dashboard

Paste when you want a **continuous immersion** (registration → login → validate dashboard):

```
I want to run a full flow: REGISTRATION → LOGIN → validate dashboard. You should:

1) Ask MANUAL or AUTOMATED.
2) Ask if I type name, email and password or you use random; for login, use the same data from registration (or ask if I want different ones).
3) If MANUAL: step-by-step to open the site, register with the data, then log in with the same data and verify I'm on the dashboard (Welcome back, Logout, etc.).
4) If AUTOMATED: Cypress open with the register-and-login.cy.js spec and env vars (CYPRESS_REGISTER_NAME, etc.), so I see the whole flow running in the browser.
```

---

## 3.5 Choose any test and decide data on the spot

Paste when you want the AI to **always ask** before running any test:

```
Whenever you're about to run a test that uses data (registration, login, age editing):

1) Say which test we're running and what it does.
2) Ask: MANUAL (you guide me on the site with the data) or AUTOMATED (Cypress open so I see the browser running)?
3) Ask: "Do you want to type the data (name/email/password/age) or do you prefer I use random?"
4) If typing, ask each field and repeat in summary before executing.
5) If MANUAL: give a clear step-by-step to open http://localhost:3000 and run the test with the provided data.
6) If AUTOMATED: run `npx cypress open --e2e` with CYPRESS_* vars in the tests folder; then select the spec in the list and click Run to watch.
```

---

# Session 4 – Example conversation (immersive flow)

**You:** [paste the Context prompt from Session 2]

**AI:** Understood. I'm your QA assistant for QA Lab. For each test with data, I'll ask: do you want **manual** (I guide you opening the site and filling with the data) or **automated** (I open Cypress and you see the browser running)? And whether you type the data or I use random. Which test do you want to run first?

**You:** I want to run the registration one.

**AI:** Got it! In the registration test we fill name, email and password. First: do you want **manual** (I give you a step-by-step to open the site and fill) or **automated** (I open Cypress and you see the test running in the browser)? And the data: do you **type** or do I use **random**?

**You:** Random is fine. And I want to see it running – automated.

**AI:** So I'll use: **Name:** Carla Test, **Email:** carla.test@qa.com, **Password:** pass456. To **see Cypress running**, run from the `tests` folder:  
`CYPRESS_REGISTER_NAME="Carla Test" CYPRESS_REGISTER_EMAIL="carla.test@qa.com" CYPRESS_REGISTER_PASSWORD="pass456" npx cypress open --e2e`  
When Cypress opens, select the spec **auth/register-full-flow.cy.js** in the list and click **Run** – then you'll see the browser open and the test filling the form with that data. If you prefer **manual**, I'll give you the step-by-step to open the site and fill it yourself.

**You:** OK. And if I wanted to type the age in the admin test?

**AI:** In the admin age editing test we only need **one age between 18 and 80**. Do you want to **type** the number or have me **pick a random one**? If typing, send me the number; if random, I'll say something like "I'll use 33 years" and you confirm.

---

# Session 5 – Quick summary (to paste in Notes or at the start of the chat)

- **Registration:** Ask MANUAL or AUTOMATED; type data or random. Manual = step-by-step on the site. Automated = cypress open with CYPRESS_* in the tests folder; click Run.
- **Login:** Same (manual = step-by-step on the site; automated = Cypress open with login spec).
- **Age (admin):** MANUAL or AUTOMATED; type age or random; manual = step-by-step to the modal; automated = Cypress open with CYPRESS_EDIT_IDADE.
- **Any test:** Gather: which test, manual/automated, data. Manual = step-by-step on localhost:3000. Automated = cypress open with spec and env vars; click Run.

This way you can **talk to the AI** and have an immersive experience in each test: either you type the data or the AI fills it; and you choose **manual** (step-by-step on the site) or **automated** (Cypress open to see the browser running). See Session 1.3 for what the AI should do in each case.
