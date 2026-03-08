# Documentação da API – QA Lab

API REST do QA Lab: registro, login, gestão de usuários (admin) e healthcheck. Backend em **Node.js + Express**, dados em **PostgreSQL**.

---

## Base URL e ambiente

| Ambiente | URL |
|----------|-----|
| Local     | `http://localhost:4000` |
| Produção  | Definir via `PORT` e host (ex.: `https://api.qalab.example.com`) |

**Variáveis de ambiente:** o backend usa `dotenv` e lê um arquivo `.env` na pasta `backend/`. Esse arquivo **não vem versionado** (está no `.gitignore`). Para subir a API localmente, copie `backend/.env.example` para `backend/.env` e ajuste se precisar. O exemplo contém: `PORT`, `DATABASE_URL` e, opcionalmente, `ADMIN_TOKEN` (se não definido, o código usa `admin-qa-lab`).

---

## Autenticação

- **Rotas públicas:** não exigem token (`/health`, `POST /auth/register`, `POST /auth/login`).
- **Rotas de admin:** exigem header:
  ```http
  Authorization: Bearer <ADMIN_TOKEN>
  ```
  `ADMIN_TOKEN` vem de `process.env.ADMIN_TOKEN` ou padrão `admin-qa-lab`.  
  O login do admin devolve esse mesmo token em `token`.

---

## Endpoints

### 1. Healthcheck

Verifica se a API está no ar.

**`GET /health`**

- **Auth:** não.
- **Resposta:** `200 OK`
  ```json
  { "status": "ok" }
  ```

---

### 2. Registro de usuário

Cria um novo usuário no banco.

**`POST /auth/register`**

- **Auth:** não.
- **Body (JSON):**
  | Campo    | Tipo   | Obrigatório | Descrição        |
  |----------|--------|-------------|------------------|
  | `name`   | string | não         | Nome (default "") |
  | `email`  | string | sim         | E-mail único     |
  | `password` | string | sim       | Senha (texto)    |

- **Respostas:**
  - `201 Created` – usuário criado. Corpo contém: `id`, `name`, `email`, `idade`, `ativo`, `created_at`, `updated_at`.
  - `400 Bad Request` – `email` ou `password` ausentes. Ex.: `{ "error": "email e password são obrigatórios" }`.
  - `409 Conflict` – e-mail já existe. Ex.: `{ "error": "Usuário já existe" }`.

**Exemplo:**

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@teste.com","password":"senha123"}'
```

---

### 3. Login

Autentica por e-mail e senha e devolve token e dados do usuário.

**`POST /auth/login`**

- **Auth:** não.
- **Body (JSON):**
  | Campo      | Tipo   | Obrigatório | Descrição |
  |------------|--------|-------------|-----------|
  | `email`    | string | sim         | E-mail    |
  | `password` | string | sim         | Senha     |

- **Respostas:**
  - `200 OK` – login ok:
    ```json
    {
      "token": "admin-qa-lab",
      "user": { "id": 1, "name": "ADM", "email": "adm@..." },
      "isAdmin": true
    }
    ```
    Para admin, `token` é o `ADMIN_TOKEN`; para outros, `"fake-token"`. O frontend usa esse token no header para chamadas de admin.
  - `400 Bad Request` – campo obrigatório faltando. Ex.: `{ "error": "email e password são obrigatórios" }`.
  - `401 Unauthorized` – credenciais inválidas. Ex.: `{ "error": "Credenciais inválidas" }`.

**Exemplo:**

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@teste.com","password":"senha123"}'
```

---

### 4. Listar todos os usuários (admin)

Lista usuários cadastrados. Apenas admin.

**`GET /users`**

- **Auth:** sim. Header: `Authorization: Bearer <ADMIN_TOKEN>`.
- **Resposta:**
  - `200 OK` – array de usuários (sem senha):
    ```json
    [
      {
        "id": 1,
        "name": "ADM",
        "email": "adm@...",
        "idade": null,
        "ativo": true,
        "created_at": "...",
        "updated_at": "..."
      }
    ]
    ```
  - `403 Forbidden` – token ausente ou inválido. Ex.: `{ "error": "Acesso negado. Apenas admin." }`.

---

### 5. Buscar usuário por ID

Retorna um usuário pelo `id`. Rota pública (sem auth); em produção pode ser restrita.

**`GET /users/:id`**

- **Auth:** não (na implementação atual).
- **Parâmetros:** `id` – número (ID do usuário).
- **Respostas:**
  - `200 OK` – objeto do usuário (sem senha): `id`, `name`, `email`, `idade`, `ativo`, `created_at`, `updated_at`.
  - `400 Bad Request` – ID inválido. Ex.: `{ "error": "ID inválido" }`.
  - `404 Not Found` – usuário não encontrado. Ex.: `{ "error": "Usuário não encontrado" }`.

---

### 6. Atualizar usuário (admin)

Atualiza nome, e-mail, idade e status ativo. Apenas admin.

**`PUT /users/:id`**

- **Auth:** sim. Header: `Authorization: Bearer <ADMIN_TOKEN>`.
- **Parâmetros:** `id` – número (ID do usuário).
- **Body (JSON):** todos opcionais; só os enviados são alterados.
  | Campo   | Tipo    | Descrição                          |
  |---------|---------|------------------------------------|
  | `name`  | string  | Nome                               |
  | `email` | string  | E-mail (único)                     |
  | `idade` | number  | Idade; **deve ser entre 18 e 80**  |
  | `ativo` | boolean | Usuário ativo ou inativo           |

- **Validação:** se `idade` for informada e estiver fora do intervalo 18–80, a API responde `400` com: `{ "error": "Idade deve ser entre 18 e 80" }`.

- **Respostas:**
  - `200 OK` – usuário atualizado (objeto completo sem senha).
  - `400 Bad Request` – ID inválido ou idade fora de 18–80.
  - `403 Forbidden` – não admin.
  - `404 Not Found` – usuário não encontrado.
  - `409 Conflict` – e-mail já em uso. Ex.: `{ "error": "E-mail já em uso" }`.

**Exemplo:**

```bash
curl -X PUT http://localhost:4000/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-qa-lab" \
  -d '{"idade":25,"ativo":false}'
```

---

### 7. Excluir usuário (admin)

Remove um usuário. Apenas admin. **O usuário admin (e-mail fixo do seed) não pode ser excluído.**

**`DELETE /users/:id`**

- **Auth:** sim. Header: `Authorization: Bearer <ADMIN_TOKEN>`.
- **Parâmetros:** `id` – número (ID do usuário).
- **Respostas:**
  - `204 No Content` – usuário excluído (corpo vazio).
  - `400 Bad Request` – ID inválido.
  - `403 Forbidden` – não admin ou tentativa de excluir o admin. Ex.: `{ "error": "Admin não pode ser excluído" }`.
  - `404 Not Found` – usuário não encontrado.

---

## Modelo de dados (usuário)

| Campo       | Tipo     | Descrição                          |
|------------|----------|------------------------------------|
| `id`       | number   | ID único (serial)                  |
| `name`     | string   | Nome                               |
| `email`    | string   | E-mail único                       |
| `password` | string   | Senha (nunca retornada nas respostas) |
| `idade`    | number \| null | Idade (18–80 na edição)     |
| `ativo`    | boolean  | Usuário ativo/inativo              |
| `created_at` | string | Data/hora de criação (ISO)        |
| `updated_at` | string | Data/hora da última atualização   |

---

## Códigos de status usados

| Código | Significado     |
|--------|-----------------|
| 200    | OK              |
| 201    | Created         |
| 204    | No Content      |
| 400    | Bad Request     |
| 401    | Unauthorized    |
| 403    | Forbidden       |
| 404    | Not Found       |
| 409    | Conflict        |

---

## Funcionamento básico

1. **Inicialização:** o backend sobe a tabela `users` (se não existir), cria/atualiza o usuário admin (seed) e sobe o servidor na porta `PORT` (ex.: 4000).
2. **Registro/Login:** o frontend (ou qualquer cliente) usa `POST /auth/register` e `POST /auth/login`; o login devolve `token` e `isAdmin` para controle de acesso.
3. **Admin:** o frontend envia `Authorization: Bearer <token>` nas chamadas a `GET /users`, `PUT /users/:id` e `DELETE /users/:id`. O backend compara o token com `ADMIN_TOKEN` para autorizar.
4. **Persistência:** todos os usuários (incluindo admin) ficam no PostgreSQL; registros de registro são ainda gravados em `registros.txt` no servidor (uso interno).

Para subir a API localmente: PostgreSQL rodando (ex.: `docker-compose up -d` em `database/`), copiar `backend/.env.example` para `backend/.env`, depois `cd backend && npm install && npm run dev`.
