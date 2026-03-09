# QA Lab – Guia de Manutenção da Pipeline

## Onde ver a pipeline

- **GitHub Actions:** https://github.com/Wesley-Gomes93/qa-lab/actions
- Cada push/PR na `main` dispara os workflows **CI** e **Pipeline**

## Estrutura da Pipeline

| Job | O que faz | Se falhar |
|-----|-----------|-----------|
| **build** | Build do frontend (Next.js) | Verificar erros de compilação |
| **lint** | ESLint no frontend | Corrigir erros/warnings no código |
| **tests** | PostgreSQL + API + Frontend → **Cypress** | Ver logs do Cypress |
| **e2e** | PostgreSQL + API + Frontend → **Playwright** | Ver logs do Playwright |
| **report** | Gera relatório unificado (Cypress + Playwright) | Baixe o artifact `qa-lab-report` |

### Agent Analysis (workflow separado)

O workflow **Agent Analysis** (`agent.yml`) roda o **Failure Analyzer Agent** e pode ser disparado manualmente:

1. Vá em **Actions** → **Agent Analysis**
2. Clique em **Run workflow**
3. Opcional: informe a suíte (`all`, `admin`, `auth`, `api`, `ui`, `performance`) ou path do spec

O agente executa os testes Cypress e, em caso de falha, gera análise estruturada com sugestões de correção.

## Como entender os erros

### 1. Acesse o run que falhou

1. Abra [Actions](https://github.com/Wesley-Gomes93/qa-lab/actions)
2. Clique no run com status **Failure** (vermelho)
3. Clique no **job** que falhou (ex: `tests`, `e2e`, `lint`)

### 2. Leia o log

- Role até o fim do log do step que falhou
- Procure por:
  - `Error:` – mensagem de erro
  - `Process completed with exit code 1` – indica qual step quebrou
  - Stack traces – mostram arquivo e linha

### 3. Erros comuns e soluções

| Erro | Causa provável | Solução |
|------|----------------|---------|
| `npm ci` / `package-lock not found` | Lock file ausente ou em outro path | Usar `npm install` ou ajustar cache/paths |
| `Permission denied (publickey)` | Chave SSH não configurada | Usar HTTPS ou configurar SSH |
| `getByText resolved to 2 elements` | Locator ambíguo no Playwright | Usar `getByRole`, `getByTestId` ou locator mais específico |
| `ECONNREFUSED localhost:3000` | Frontend não subiu a tempo | Aumentar `sleep` antes dos testes |
| `Repository not found` | Repo privado sem token | Configurar `GITHUB_TOKEN` ou PAT |
| Lint errors | Variáveis não usadas, regras de React | Ajustar código ou regras no ESLint |

### 4. Baixar artifacts

Quando um job falha, você pode baixar:

- **cypress-report** – relatório HTML do Cypress (job `tests`)
- **playwright-report** – relatório HTML do Playwright (job `e2e`)

No final do run, clique em **Artifacts** e baixe o ZIP.

## Como dar manutenção

### Alterar a pipeline

- Arquivos: `.github/workflows/ci.yml` e `.github/workflows/pipeline.yml`
- Edite o YAML, faça commit e push
- Novos runs serão executados automaticamente

### Adicionar um novo job

```yaml
novo-job:
  name: novo-job
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Executar algo
      run: echo "Hello"
```

### Rodar a pipeline manualmente

- **workflow_dispatch:** adicione `workflow_dispatch:` em `on:` para permitir execução manual pela interface do GitHub

### Debugar localmente

Para simular o ambiente da pipeline:

```bash
# Subir banco
npm run db:up

# Subir API (outro terminal)
npm run backend:dev

# Subir frontend (outro terminal)
npm run frontend:dev

# Rodar testes
npm run tests:run      # Cypress
npm run tests:pw       # Playwright
```

## Lint antes do commit

Para verificar erros e warnings antes de fazer commit:

```bash
npm run lint:check
```

O script exibe a contagem de **erros** e **warnings** e falha se houver erros (bloqueando o commit).

## Relatórios personalizados

Para gerar o relatório unificado (Cypress + Playwright) localmente:

```bash
# Após rodar os testes
npm run tests:run      # ou tests:pw para Playwright
npm run tests:report:unified
```

O relatório HTML é salvo em `tests/qa-lab-reports/index.html`.

## Links úteis

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Cypress CI](https://docs.cypress.io/guides/continuous-integration/introduction)
