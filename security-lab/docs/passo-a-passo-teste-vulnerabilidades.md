# Passo a passo — Testar vulnerabilidades em um site

Checklist prático. **Use apenas em sites que você tem autorização** (seu próprio, lab, bug bounty, etc.).

---

## 1. XSS Refletido (Reflected)

**Onde olhar:** campos de busca, filtros, qualquer parâmetro na URL.

**Passos:**
1. Encontre um campo que aparece na página (ex.: busca).
2. Digite: `<script>alert(1)</script>`
3. Se um popup `1` aparecer → **vulnerável**.

**Alternativas se `<script>` for bloqueado:**
- `<img src=x onerror=alert(1)>`
- `"><script>alert(1)</script>`
- `' onmouseover=alert(1) '`

---

## 2. XSS Armazenado (Stored)

**Onde olhar:** comentários, bio, nome de perfil, posts.

**Passos:**
1. Preencha o campo com: `<script>alert(1)</script>` ou `<img src=x onerror=alert(1)>`
2. Salve/publicar.
3. Atualize a página ou acesse de outra conta.
4. Se o popup aparecer → **vulnerável**.

---

## 3. Open Redirect

**Onde olhar:** links de login, logout, "voltar", parâmetros como `?url=`, `?redirect=`, `?next=`.

**Passos:**
1. Abra o link de logout/login e veja a URL. Exemplo: `https://site.com/logout?redirect=/dashboard`
2. Troque o valor: `?redirect=https://evil.com`
3. Acesse o link. Se for redirecionado para `evil.com` → **vulnerável**.

---

## 4. Path Traversal

**Onde olhar:** downloads, visualização de PDFs, parâmetros como `?file=`, `?document=`, `?path=`.

**Passos:**
1. Encontre uma URL como: `https://site.com/file?name=report.pdf`
2. Troque: `?name=../../../etc/passwd` ou `?name=..%2F..%2F..%2Fetc%2Fpasswd`
3. Se o conteúdo do arquivo interno aparecer → **vulnerável**.

---

## 5. Information Disclosure

**Onde olhar:** erros, rotas comuns de debug, código-fonte.

**Passos:**
1. **Código-fonte (Ctrl+U):** procure por comentários com senhas, chaves.
2. **Rotas comuns:** tente `/debug`, `/env`, `/status`, `/health`, `/config`
3. **Erro 404/500:** provoque erro e veja se aparece stack trace, caminhos de arquivo, versões.
4. Se dados sensíveis aparecerem → **vulnerável**.

---

## 6. Credenciais fracas / sem rate limit

**Onde olhar:** formulário de login.

**Passos:**
1. Tente `admin`/`admin`, `admin`/`123456`, `teste`/`teste`.
2. Use a mesma senha errada várias vezes (ex.: 10x). Se não bloquear → possível **falta de rate limit**.

---

## Resumo rápido

| Vulnerabilidade | O que testar | Onde |
|-----------------|--------------|------|
| XSS Refletido | `<script>alert(1)</script>` | Busca, filtros, params na URL |
| XSS Armazenado | Mesmo payload, salvar | Comentários, perfil, posts |
| Open Redirect | `?url=https://evil.com` | Links de redirect |
| Path Traversal | `?file=../../../etc/passwd` | Download, visualização de arquivos |
| Info Disclosure | Ver fonte, `/debug`, `/env` | Qualquer lugar |

---

## Importante

- Teste **somente** em ambientes autorizados.
- Em produção, use apenas programas de bug bounty ou com permissão por escrito.
- O vulnerable-web deste lab pode ser usado para treinar todos esses testes.
