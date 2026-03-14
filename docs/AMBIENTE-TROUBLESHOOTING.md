# Guia: Subir todos os ambientes (troubleshooting)

## Comando principal

```bash
make dev
# ou
npm run dev
```

Isso sobe na ordem: **PostgreSQL → Backend → Frontend → Vulnerable Web (Security Lab)**.

---

## Pré-requisitos

| Item | Como verificar |
|------|----------------|
| **Node.js** | `node -v` (recomendado: v18+) |
| **Docker** | `docker --version` e Docker Desktop **ligado** |
| **npm** | `npm -v` |

---

## Problemas comuns

### 1. "docker-compose exit 1" ou "Docker exit 1"

**Causa:** Docker não está rodando ou não tem permissão.

**Solução:**
- Abra o **Docker Desktop** e espere inicializar
- No Mac/Linux: verifique se você está no grupo `docker` ou use `sudo` (evite se possível)
- Suba o banco manualmente:
  ```bash
  cd database
  docker compose up -d
  # ou: docker-compose up -d
  cd ..
  npm run dev
  ```

### 2. "Port already in use" (3000, 3001, 4000, 5432)

**Causa:** Porta ocupada por outro processo ou instância anterior.

**Solução:**
```bash
# Ver o que está na porta (ex: 3001)
lsof -i :3001

# Matar processo na porta
lsof -ti :3001 | xargs kill -9

# Depois rodar novamente
npm run dev
```

### 3. Backend falha ao conectar no banco

**Causa:** Banco não subiu ou `.env` não existe/configurado.

**Solução:**
1. Verifique se o PostgreSQL está rodando: `docker ps | grep qa-lab`
2. Crie o `.env` do backend:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. O `.env` deve ter: `DATABASE_URL=postgresql://qa:qa123@localhost:5432/qalab`

### 4. "Missing script: dev" em algum subprojeto

**Causa:** Comando rodado no diretório errado.

**Solução:** Sempre rode `make dev` ou `npm run dev` **na raiz do projeto** (`/Users/wesleyluiz/Desktop/qa-lab`), não dentro de `tests/`, `frontend/`, etc.

### 5. Vulnerable Web não sobe (porta 3001)

**Causa:** Porta ocupada ou dependências não instaladas.

**Solução:**
```bash
# Liberar porta
lsof -ti :3001 | xargs kill -9

# Instalar deps e rodar manualmente
cd security-lab/apps/vulnerable-web
npm install
npm run dev

# Ou usar outra porta
PORT=3002 npm run dev
```

---

## Subir manualmente (passo a passo)

Se `make dev` falhar, faça na ordem:

```bash
# 1. Banco
cd database && docker compose up -d && cd ..
# Aguarde ~5 segundos

# 2. Backend (em outro terminal)
cd backend && npm run dev

# 3. Frontend (em outro terminal)
cd frontend && npm run dev

# 4. Vulnerable Web - Security Lab (em outro terminal)
cd security-lab/apps/vulnerable-web && npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Vulnerable Web: http://localhost:3001
- PostgreSQL: localhost:5432

---

## Makefile: outros targets úteis

```bash
make install      # Instala todas as dependências
make db-up        # Só sobe o banco
make db-down      # Para o banco
make help         # Lista todos os comandos
```
