# Configuração de Secrets e Variables no GitHub Actions

Este documento descreve como configurar **Secrets** (dados sensíveis) e **Variables** (configurações não sensíveis) para que a pipeline do QA Lab funcione corretamente.

## Onde configurar

1. Repositório → **Settings** → **Secrets and variables** → **Actions**
2. Use a aba **Secrets** para dados sensíveis
3. Use a aba **Variables** para URLs e configs não sensíveis

---

## Secrets (dados sensíveis – criptografados)

Adicione em **Repository secrets** → **New repository secret**:

| Secret          | Obrigatório | Descrição                    | Valor padrão (se não definir) |
|-----------------|------------|------------------------------|--------------------------------|
| `ADMIN_EMAIL`   | Opcional   | E-mail do usuário admin de teste | admWesley@test.com.br      |
| `ADMIN_PASSWORD`| Opcional   | Senha do usuário admin de teste  | senha12356                 |

**Nota:** Se não criar esses secrets, a pipeline usa os valores padrão (recomendado apenas para ambiente de testes/CI).

---

## Variables (não sensíveis – texto legível)

Adicione em **Variables** → **New repository variable**:

| Variable           | Obrigatório | Descrição                    | Valor padrão        |
|--------------------|------------|------------------------------|---------------------|
| `API_BASE_URL`     | Opcional   | URL da API                   | http://localhost:4000 |
| `CYPRESS_BASE_URL`  | Opcional   | URL do frontend (Cypress)    | http://localhost:3000 |
| `FRONTEND_URL`     | Opcional   | URL do frontend (Playwright)  | http://localhost:3000 |

---

## Resumo

- **Secrets:** credenciais (ADMIN_EMAIL, ADMIN_PASSWORD)
- **Variables:** URLs (API_BASE_URL, CYPRESS_BASE_URL, FRONTEND_URL)
- Tudo é **opcional**: se não definir, os valores padrão são usados (ideal para CI de testes).

---

## Desenvolvimento local

Localmente, use o `.env` do backend:

```bash
# backend/.env
ADMIN_EMAIL=seu-email@test.com
ADMIN_PASSWORD=sua-senha-teste
```

Ou deixe em branco para usar os padrões em `backend/db.js` e `tests/shared/constants.js`.
