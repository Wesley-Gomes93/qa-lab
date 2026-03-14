# Guia Completo: Vulnerabilidades Web

Este documento explica **o que é** cada vulnerabilidade, **como identificar**, **como testar** e **como praticar sem o lab**.

---

## Índice

1. [Cross-Site Scripting (XSS)](#1-cross-site-scripting-xss)
2. [Open Redirect](#2-open-redirect)
3. [Information Disclosure](#3-information-disclosure)
4. [Path Traversal](#4-path-traversal)
5. [SQL Injection](#5-sql-injection)
6. [Cross-Site Request Forgery (CSRF)](#6-cross-site-request-forgery-csrf)
7. [Broken Authentication](#7-broken-authentication)
8. [Como praticar sem o lab](#como-praticar-sem-o-lab)

---

## 1. Cross-Site Scripting (XSS)

### O que é?

XSS permite que um atacante injete código JavaScript em uma página que outras pessoas veem. O script roda no contexto do site legítimo, podendo:
- Roubar cookies/sessão
- Alterar o conteúdo da página
- Redirecionar para sites maliciosos
- Fazer ações em nome do usuário

### Tipos

| Tipo | Quando o script entra no servidor | Onde roda |
|------|-----------------------------------|-----------|
| **Reflected** | Via URL/input → servidor responde com o mesmo texto | Na resposta da requisição |
| **Stored** | Salvo no banco → servidor exibe para todos | Em páginas que listam dados armazenados |
| **DOM-based** | Só no cliente (JavaScript lê da URL e coloca na página) | Nunca passa pelo servidor |

### Como identificar?

- **Pergunte:** Onde a aplicação exibe algo que veio do usuário?
  - Campo de busca
  - Comentários, posts
  - URL (query string, hash)
  - Perfil, nome de usuário
- **Sinais:** O input é refletido na página sem codificação (sem `htmlspecialchars`, `encodeURI`, etc.).

### Como testar?

**Payloads comuns:**

```html
<script>alert(1)</script>
<img src=x onerror=alert(1)>
"><script>alert(1)</script>
'"><img src=x onerror=alert(1)>
```

**Passo a passo (Reflected):**

1. Encontre um parâmetro refletido: `/search?q=teste` → página mostra "teste"
2. Substitua por: `/search?q=<script>alert(1)</script>`
3. Se um popup aparecer → vulnerável

**Passo a passo (Stored):**

1. Encontre um formulário (comentário, nome, bio)
2. Envie: `<img src=x onerror=alert(1)>`
3. Abra a página que lista os dados
4. Se o script executar → vulnerável

**Passo a passo (DOM-based):**

1. Abra DevTools → Sources
2. Procure por `innerHTML`, `document.write`, `eval()` usando dados da URL
3. Teste no hash: `#<img src=x onerror=alert(1)>`

### Sem o lab — como praticar?

- **PortSwigger Web Security Academy** (gratuito): https://portswigger.net/web-security/cross-site-scripting
- **OWASP Juice Shop** (Docker): vulnerabilidades reais em uma loja
- **DVWA** (Damn Vulnerable Web App): módulo XSS com níveis de dificuldade
- **HackTheBox / TryHackMe**: máquinas com XSS como parte do challenge

---

## 2. Open Redirect

### O que é?

A aplicação redireciona o usuário para uma URL que vem de parâmetro, sem validar. Ex.: `?url=https://evil.com` → usuário vai para site malicioso.

**Risco:** Phishing — link parece legítimo (`site.com/redirect?url=evil.com`) mas leva ao atacante.

### Como identificar?

- Procure parâmetros como: `url`, `redirect`, `next`, `return`, `destination`, `redir`
- Teste: `/redirect?url=https://google.com` — se redirecionar, está vulnerável

### Como testar?

```
/redirect?url=https://evil.com
/redirect?url=//evil.com          (protocol-relative)
/redirect?url=javascript:alert(1) (XSS via redirect)
```

### Sem o lab — como praticar?

- PortSwigger: https://portswigger.net/web-security/url-redirection
- Bug bounty em sites reais (com autorização): procure endpoints de login/redirect

---

## 3. Information Disclosure

### O que é?

Exposição de dados sensíveis que não deveriam estar acessíveis:
- Senhas em comentários HTML
- Chaves de API em código JS
- Endpoints `/debug`, `/status`, `/env`
- Stack traces com caminhos de arquivos
- Versões de frameworks em headers

### Como identificar?

- **View Source (Ctrl+U):** Comentários HTML com senhas, tokens
- **DevTools → Network:** Headers `X-Powered-By`, `Server`, respostas de API
- **Diretórios comuns:** `/debug`, `/trace`, `/env`, `/.env`, `/config`
- **Erros:** 500 com stack trace exposto

### Como testar?

```
GET /debug
GET /.env
GET /config.json
GET /phpinfo.php
```

No lab: `/debug` expõe `admin_password` e variáveis de ambiente.

### Sem o lab — como praticar?

- PortSwigger: https://portswigger.net/web-security/information-disclosure
- Google Dorks: `"admin_password"`, `"API_KEY"` em repositórios
- Shodan/Censys: busque serviços expostos com banners

---

## 4. Path Traversal

### O que é?

Também chamado *Directory Traversal*. A aplicação lê arquivos do servidor usando um parâmetro de usuário, sem validar. Ex.: `?file=../../../etc/passwd` → lê arquivo fora do diretório permitido.

### Como identificar?

- Endpoints que sugerem leitura de arquivo: `?file=`, `?path=`, `?document=`, `?name=`
- Funcionalidade de "download" ou "view file"

### Como testar?

```
/file?name=../../../etc/passwd
/file?name=....//....//....//etc/passwd
/file?name=..%2f..%2f..%2fetc%2fpasswd   (URL encoded)
/file?name=....\/....\/....\/etc/passwd   (backslash em Windows)
```

No lab: `/file?name=index.html` funciona; tente `../server.js` para ler o código.

### Sem o lab — como praticar?

- PortSwigger: https://portswigger.net/web-security/file-path-traversal
- DVWA: módulo File Inclusion
- TryHackMe: room "Learn Path Traversal"

---

## 5. SQL Injection

### O que é?

O atacante injeta SQL na query do banco. O backend concatena input do usuário diretamente na query em vez de usar parâmetros preparados.

**Exemplo vulnerável:**
```javascript
// ERRADO
const query = `SELECT * FROM users WHERE id = ${req.query.id}`;
```

**Exemplo seguro:**
```javascript
// CORRETO
const query = 'SELECT * FROM users WHERE id = $1';
pool.query(query, [req.query.id]);
```

### Como identificar?

- Qualquer input que parece ir para banco: login, busca, filtros, ID em URL
- Erros SQL no retorno: "syntax error", "unknown column", "mysql_fetch"

### Como testar?

**Probe inicial:**
```
?id=1'
?id=1"
?id=1 AND 1=1
?id=1 AND 1=2
```

**Se houver erro ou diferença de resposta:**

```
# Bypass de login
' OR '1'='1
' OR 1=1--
admin'--

# Extrair dados (ajuste para o banco)
' UNION SELECT username, password FROM users--
```

### Sem o lab — como praticar?

- **SQLi Labs** (Docker): https://github.com/Audi-1/sqli-labs
- **PortSwigger SQL Injection**: https://portswigger.net/web-security/sql-injection
- **DVWA**: módulo SQL Injection
- **HackTheBox**: máquinas com SQLi

---

## 6. Cross-Site Request Forgery (CSRF)

### O que é?

O atacante faz o navegador do usuário (logado) enviar uma requisição indesejada para o site legítimo. Como o cookie de sessão vai junto, o servidor aceita como se fosse o usuário.

**Exemplo:** Página maliciosa com:
```html
<img src="https://banco.com/transfer?to=atacante&valor=10000">
```
Se o usuário estiver logado e o banco não verificar origem, a transferência ocorre.

### Como identificar?

- Ações sensíveis (transferir, deletar, alterar senha) usam GET em vez de POST
- Formulários sem token CSRF (`csrf_token`, `_token`, etc.)
- `SameSite` dos cookies não é `Strict` ou `Lax`

### Como testar?

1. Faça login no site
2. Crie uma página HTML que submeta um form para a ação sensível
3. Abra essa página em outra aba (mesmo navegador)
4. Se a ação acontecer sem pedir confirmação → vulnerável

### Sem o lab — como praticar?

- PortSwigger: https://portswigger.net/web-security/csrf
- DVWA: módulo CSRF

---

## 7. Broken Authentication

### O que é?

Problemas em autenticação/autorização:
- Senhas fracas ou padrão
- Sessão que não expira
- ID de sessão previsível
- Falta de rate limit no login (força bruta)
- Acesso a recursos de outros usuários (IDOR)

### Como identificar?

- Login sem limite de tentativas
- Trocar `?user_id=123` por `?user_id=124` e ver dados de outro usuário (IDOR)
- Cookies de sessão em HTTP (não HTTPS)
- Logout que não invalida o token

### Como testar?

- **IDOR:** `/api/user/1` → tente `/api/user/2`, `/api/user/0`
- **Força bruta:** ferramentas como `hydra`, `burp intruder`
- **Default creds:** `admin:admin`, `admin:password`

### Sem o lab — como praticar?

- PortSwigger: https://portswigger.net/web-security/authentication
- Juice Shop: vários desafios de auth
- OWASP WebGoat: módulos de autenticação

---

## Como praticar sem o lab

### Apps vulneráveis (Docker/local)

| App | O que tem | Como rodar |
|-----|-----------|------------|
| **DVWA** | XSS, SQLi, CSRF, Command Injection | `docker run -p 80:80 vulnerables/web-dvwa` |
| **OWASP Juice Shop** | Muitas vulnerabilidades (OWASP Top 10) | `docker run -p 3000:3000 bkimminich/juice-shop` |
| **WebGoat** | Lições guiadas por vulnerabilidade | `docker run -p 8080:8080 webgoat/webgoat` |
| **SQLi-Labs** | Foco em SQL Injection | `docker run -p 80:80 acgpiano/sqli-labs` |

### Plataformas gratuitas

| Plataforma | O que é |
|------------|---------|
| **PortSwigger Web Security Academy** | Labs interativos, teoria + prática, gratuito |
| **TryHackMe** | Rooms temáticas (XSS, SQLi, etc.) |
| **HackTheBox** | Máquinas para pentest (nível intermediário) |
| **PentesterLab** | Exercícios guiados |

### No trabalho (ético)

- Use **apenas** em ambientes autorizados (staging, homologação)
- Documente o escopo e obtenha aprovação
- Reporte vulnerabilidades com responsabilidade

---

## Resumo rápido

| Vulnerabilidade | Como achar | Payload/Teste simples |
|-----------------|------------|----------------------|
| XSS Reflected | Input na URL refletido na página | `?q=<script>alert(1)</script>` |
| XSS Stored | Formulário que salva e exibe | Comentário com `<img src=x onerror=alert(1)>` |
| XSS DOM | JS lê da URL e coloca em innerHTML | `#<img src=x onerror=alert(1)>` |
| Open Redirect | `?url=`, `?redirect=` | `?url=https://evil.com` |
| Info Disclosure | `/debug`, comentários, `.env` | `GET /debug` |
| Path Traversal | `?file=`, `?name=` | `?name=../../../etc/passwd` |
| SQL Injection | Input em login, busca, filtros | `' OR '1'='1` |
| CSRF | Ação sensível sem token | Form em outra origem enviando POST |
| Broken Auth | ID na URL, login sem rate limit | Trocar `user_id=1` por `2` |

---

## Referências

- [OWASP Top 10](https://owasp.org/Top10/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
