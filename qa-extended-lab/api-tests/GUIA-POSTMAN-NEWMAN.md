# Guia: API Tests com Postman + Newman

Tudo o que você precisa saber sobre collections, variáveis e scripts para testes de API.

---

## 1. Estrutura atual do projeto

```
api-tests/
├── collection/
│   ├── reqres-api.json           ← Collection básica (Users, 6 requests)
│   ├── jsonplaceholder-completo.json  ← Collection COMPLETA (48 requests)
│   └── env.json                  ← Environment (variáveis)
├── reports/                      ← Saída do Newman
└── run-newman.js                 ← Script que roda via Newman
```

### Comandos

| Comando | Collection | Requests |
|---------|------------|----------|
| `npm run test:api` | reqres-api.json (básica) | 6 |
| `npm run test:api:full` | jsonplaceholder-completo.json | 48 |

- **Collection** = conjunto de requests + scripts de teste
- **Environment** = variáveis (baseUrl, etc.) que mudam por ambiente
- **Newman** = roda a collection via linha de comando (CI, automação)

---

## 2. O que pode ter em uma Collection (Postman)

### 2.1 Estrutura de uma Collection

| Elemento | Onde fica | O que faz |
|----------|-----------|-----------|
| **Requests** | `item[]` | Cada requisição (GET, POST, etc.) |
| **Folders** | `item[]` com `item` dentro | Agrupa requests (ex.: Users, Posts) |
| **Variáveis** | `variable[]` | Variáveis da collection (baseUrl, token) |
| **Scripts de Collection** | `event[]` no root | Roda antes/depois de cada request da collection |
| **Scripts de Request** | `event[]` em cada item | Test scripts, pre-request scripts |

### 2.2 Cada Request pode ter

| Parte | Uso |
|-------|-----|
| **URL** | `{{baseUrl}}/users` — variáveis com `{{nome}}` |
| **Method** | GET, POST, PUT, PATCH, DELETE |
| **Headers** | Content-Type, Authorization, etc. |
| **Body** | JSON, form-data, urlencoded |
| **Params** | Query strings (?page=1&limit=10) |
| **Pre-request Script** | Roda ANTES de enviar a request |
| **Tests** | Roda DEPOIS de receber a response |

---

## 3. Scripts: o que pode usar

### 3.1 Test Script (event "test")

Roda **depois** da resposta. Use para validar:

```javascript
// Status code
pm.test('Status é 200', () => pm.response.to.have.status(200));

// JSON
const json = pm.response.json();
pm.test('Tem campo id', () => pm.expect(json).to.have.property('id'));
pm.test('Email é string', () => pm.expect(json.email).to.be.a('string'));

// Schema (estrutura)
pm.test('Array de usuários', () => {
  const data = pm.response.json();
  pm.expect(data).to.be.an('array');
  if (data.length > 0) {
    pm.expect(data[0]).to.have.keys(['id', 'name', 'username', 'email']);
  }
});

// Response time
pm.test('Resposta em menos de 500ms', () => {
  pm.expect(pm.response.responseTime).to.be.below(500);
});

// Headers
pm.test('Content-Type é JSON', () => {
  pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
});
```

### 3.2 Pre-request Script (event "prerequest")

Roda **antes** de enviar. Use para:

```javascript
// Gerar dados dinâmicos
pm.collectionVariables.set('timestamp', Date.now());
pm.collectionVariables.set('randomId', _.random(1000, 9999));

// Usar variável de um request anterior (se em ordem)
const userId = pm.collectionVariables.get('lastUserId');
if (userId) {
  pm.variables.set('userId', userId);
}
```

### 3.3 Variáveis (pm.*)

| Escopo | Como acessar |
|--------|--------------|
| Environment | `pm.environment.get('baseUrl')` / `pm.environment.set('token', 'xyz')` |
| Collection | `pm.collectionVariables.get('baseUrl')` |
| Globals | `pm.globals.get('apiKey')` |
| Response (salvar) | `pm.environment.set('lastUserId', json.id)` |

---

## 4. JSONPlaceholder — endpoints disponíveis

| Recurso | Endpoints | Total |
|---------|-----------|-------|
| **Users** | /users, /users/1 | 10 |
| **Posts** | /posts, /posts/1, /posts/1/comments | 100 |
| **Comments** | /comments, /comments?postId=1 | 500 |
| **Albums** | /albums, /albums/1 | 100 |
| **Photos** | /photos, /photos/1 | 5000 |
| **Todos** | /todos, /todos/1 | 200 |

**Relações:**
- `GET /posts/1/comments` = comentários do post 1
- `GET /comments?postId=1` = mesmo resultado
- `GET /albums?userId=1` = álbuns do usuário 1

**Métodos:** GET, POST, PUT, PATCH, DELETE em todos.

---

## 5. O que você pode adicionar no Postman

### 5.1 Novos requests na mesma collection

Exemplo para **Posts**:

```json
{
  "name": "List posts",
  "request": {
    "method": "GET",
    "url": "{{baseUrl}}/posts"
  },
  "event": [{
    "listen": "test",
    "script": {
      "exec": [
        "pm.test('Status 200', () => pm.response.to.have.status(200));",
        "pm.test('É array', () => pm.expect(pm.response.json()).to.be.an('array');"
      ],
      "type": "text/javascript"
    }
  }]
}
```

### 5.2 Pastas (folders)

Agrupe por recurso:

```
Collection
├── Users
│   ├── List users
│   ├── Single user
│   ├── Create user
│   └── ...
├── Posts
│   ├── List posts
│   ├── Single post
│   └── ...
└── Comments
    └── ...
```

No JSON, um folder é um `item` com `item` dentro (array de requests).

### 5.3 Novas collections

Você pode ter múltiplas collections:

```
collection/
├── jsonplaceholder-users.json
├── jsonplaceholder-posts.json
└── reqres-api.json      (ou outra API)
```

E rodar cada uma no Newman (ajustar run-newman.js ou ter scripts separados).

### 5.4 Variáveis dinâmicas

No env.json ou na collection:

```json
{
  "key": "baseUrl",
  "value": "https://jsonplaceholder.typicode.com"
},
{
  "key": "userId",
  "value": "1"
}
```

No script: `{{baseUrl}}/users/{{userId}}`

### 5.5 Pre-request para gerar body

```javascript
// Pre-request do "Create user"
const body = {
  name: 'User ' + Date.now(),
  username: 'user' + _.random(100),
  email: 'test' + _.random(100) + '@test.com'
};
pm.variables.set('requestBody', JSON.stringify(body));
```

No body: `{{requestBody}}`

### 5.6 Salvar ID para próxima request

```javascript
// Test script do "Create user"
const json = pm.response.json();
if (json.id) {
  pm.collectionVariables.set('lastUserId', json.id);
}
```

Próxima request: `{{baseUrl}}/users/{{lastUserId}}`

### 5.7 Validação de schema

```javascript
pm.test('Schema válido', () => {
  const schema = {
    type: 'object',
    required: ['id', 'name', 'email'],
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' }
    }
  };
  pm.response.to.have.jsonSchema(schema);
});
```

*(Requer json-schema no Postman — checar se Newman suporta)*

---

## 6. Como exportar do Postman para o projeto

1. No Postman: **Collection** → **...** → **Export**
2. Escolha **Collection v2.1**
3. Salve em `api-tests/collection/nome-da-collection.json`
4. Environment: **Environments** → **...** → **Export** → salve em `env.json`

---

## 7. Rodar no Newman

```bash
# Usando a collection atual
npm run test:api

# Ou manualmente com outra collection
npx newman run api-tests/collection/minha-collection.json -e api-tests/collection/env.json
```

---

## 8. Lista completa de testes (jsonplaceholder-completo)

**48 requests** cobrindo todos os recursos e operações:

| Recurso | Testes |
|---------|--------|
| **Users** (7) | GET list, GET single, GET 404, POST, PUT, PATCH, DELETE |
| **Posts** (9) | GET list, GET single, GET 404, GET ?userId=1, GET /posts/1/comments, POST, PUT, PATCH, DELETE |
| **Comments** (7) | GET list, GET single, GET ?postId=1, GET 404, POST, PUT, DELETE |
| **Albums** (7) | GET list, GET single, GET ?userId=1, GET 404, POST, PUT, DELETE |
| **Photos** (7) | GET list, GET single, GET ?albumId=1, GET 404, POST, PUT, DELETE |
| **Todos** (9) | GET list, GET single, GET ?userId=1, GET ?completed=true, GET 404, POST, PUT, PATCH, DELETE |
| **Headers/Perf** (2) | Content-Type JSON, Response time < 5s |

**Tipos de teste em cada request:**
- Status code (200, 201, 404)
- Estrutura do JSON (array, objeto, campos obrigatórios)
- Filtros por query (?userId=1, ?postId=1, ?completed=true)
- Relações (posts/1/comments)
- CRUD completo (Create, Read, Update, Delete)
- PATCH (update parcial)
- Headers (Content-Type)
- Performance (response time)

---

## 9. Checklist: extensões opcionais

| Item | Status (collection completo) |
|------|------------------------------|
| ☑ Posts | Incluído |
| ☑ Comments | Incluído |
| ☑ Albums | Incluído |
| ☑ Photos | Incluído |
| ☑ Todos | Incluído |
| ☑ Pastas | Organizado por recurso |
| ☑ Response time | Incluído |
| ☑ Headers | Content-Type |
| ☐ Variáveis dinâmicas | Pre-request com timestamp/random |
| ☐ Nova API | Ex.: ReqRes, sua própria API |

---

## 10. Demonstrações e posts

Para ideias de GIFs, posts e todos os comandos: **[docs/COMANDOS-E-DEMOS.md](../docs/COMANDOS-E-DEMOS.md)**

---

## 11. Referências

- [Postman Learning Center](https://learning.postman.com/)
- [Newman CLI](https://github.com/postmanlabs/newman)
- [JSONPlaceholder Guide](https://jsonplaceholder.typicode.com/guide)
- [Chai BDD Assertions](https://www.chaijs.com/api/bdd/) (usado no pm.test)
