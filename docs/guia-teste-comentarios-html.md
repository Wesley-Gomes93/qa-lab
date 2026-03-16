# Teste: Comentários HTML — GitLab Bug Bounty

**Objetivo:** Encontrar credenciais, tokens e dados sensíveis em comentários HTML no GitLab. Guia direto para o programa GitLab no HackerOne.

---

## Escopo GitLab — O que vale e o que não vale

| Em escopo | Fora do escopo |
|-----------|----------------|
| **Credenciais** em comentário (senha, token, API key) | Versão de software, metadata sozinho |
| **Secrets** de outro projeto/usuário | Enumeração (existência de projeto, IDs) |
| **Dados confidenciais** (email privado, env vars) | Comentário só estruturador (`<!-- nav -->`) |

**Regra do GitLab:** Só conta como vulnerabilidade se houver **breach de privacidade** (credenciais ou dados confidenciais). Comentário com "versão 1.2" ou "TODO genérico" sozinho não é elegível.

---

## Setup obrigatório

| Onde testar | Requisito |
|-------------|-----------|
| **GitLab.com** | Conta com email `seuhandle@wearehackerone.com` |
| **GDK (local)** | `git clone` + `gdk install` + `gdk start` → http://localhost:3000 |

Use GDK para praticar sem limites. No GitLab.com, sempre associe sua conta HackerOne.

---

## O que procurar

| Padrão | Exemplo | Elegível GitLab? |
|--------|---------|------------------|
| Senha, token, API key | `<!-- API_KEY=glpat-xxx -->` | ✅ Sim |
| Variável CI/CD vazada | `<!-- CI_VAR: secret_value -->` | ✅ Sim |
| TODO com credencial | `<!-- TODO: remove - pass: admin123 -->` | ✅ Sim |
| Email privado | `<!-- user@privado.com -->` | ✅ Sim |
| Só metadata | `<!-- version 16.1 -->` | ❌ Provavelmente não |
| Formatação | `<!-- Section -->` | ❌ Não |

---

## Passo 1: Onde fazer o teste (páginas GitLab)

GitLab é SPA (Vue.js). A maior parte do conteúdo vem de APIs. Foque em:

| Página / recurso | URL exemplo | Por quê |
|------------------|-------------|---------|
| **Login** | `https://gitlab.com/users/sign_in` | HTML server-side, possível comentário em form |
| **Erro 404** | `https://gitlab.com/xyz-inexistente-123` | Página de erro pode ter stack trace ou comentário |
| **Erro 500** | Provocar com payload inválido | Idem |
| **Projeto público** | `https://gitlab.com/gitlab-org/gitlab` | Página inicial do projeto |
| **Raw file (HTML)** | `.../-/raw/main/arquivo.html` | Se o arquivo for HTML, comentários são visíveis |
| **Snippets** | Snippet público com HTML | Possível comentário no snippet |
| **Wiki** | `.../-/wikis/home` | Conteúdo pode ter comentários em HTML |
| **Pages** | `*.gitlab.io` | Sites estáticos — Ctrl+U direto |

---

## Passo 2: Abrir o código-fonte

1. Acesse a URL (login, 404, projeto, etc.).
2. **Ctrl+U** (Windows/Linux) ou **Cmd+Option+U** (Mac).
3. Ou: clique direito → "View Page Source".

**O que esperar:** HTML bruto. No GitLab, o HTML inicial costuma ser mínimo (shell do app), mas **login** e **erro** podem ter mais conteúdo server-side.

---

## Passo 3: Buscar comentários

1. Na janela do código-fonte: **Ctrl+F** (ou Cmd+F).
2. Busque: `<!--`

**O que esperar:**
- Poucos ou nenhum: GitLab é SPA, o HTML principal é enxuto.
- Se achar: leia até `-->` e veja se tem credencial/secret.

---

## Passo 4: Buscar palavras-chave

No View Source, use Ctrl+F e busque:

```
password
secret
token
key
TODO
FIXME
api_key
private
```

**O que esperar:** Qualquer match próximo de `<!-- ... -->` é suspeito. Documente.

---

## Passo 5: Requisições dinâmicas (importante no GitLab)

O GitLab carrega muita coisa via API/Fetch. O comentário sensível pode vir em uma **resposta** de requisição, não no HTML inicial.

1. Abra DevTools (**F12**).
2. Aba **Network**.
3. Recarregue a página ou navegue (projeto, MR, issue).
4. Filtre por **All** ou **Fetch/XHR**.
5. Clique em cada requisição.
6. Aba **Response** (ou **Preview**).
7. **Ctrl+F** na resposta por: `<!--`, `password`, `secret`, `token`, `TODO`.

**O que pode mudar:**
- Algumas rotas `/api/v4/` ou internas podem devolver HTML com comentários.
- Respostas de erro (500) podem ter stack trace ou HTML com comentário.
- GraphQL (`/api/graphql`) — respostas JSON, mas pode ter HTML embutido em algum campo.

---

## Passo 6: Variações para tentar

| Variação | Como fazer | O que pode mudar |
|----------|------------|------------------|
| **Parâmetros** | `?format=html`, `?raw=1`, `?debug=1` | Algumas rotas mostram mais em modo debug. |
| **Outras páginas** | Login, 404, 500, projeto, grupo, settings | Comentários podem estar em páginas específicas. |
| **JavaScript inline** | No View Source, busque `//` em tags `<script>` | Tokens ou endpoints em comentários JS. |
| **GitLab Pages** | Sites em `*.gitlab.io` | HTML estático — Ctrl+U em cada página. |
| **Snippets públicos** | Criar snippet com HTML e ver View Source | Testar se comentários persistem. |

---

## Passo 7: O que guardar como prova

| Evidência | Como fazer |
|-----------|------------|
| **Screenshot** | Comentário em destaque + URL na barra de endereço. |
| **Texto exato** | Copiar o comentário completo. |
| **URL** | URL da página ou da requisição (Network) onde encontrou. |
| **Request/Response** | Se veio de API: copiar do DevTools ou Burp. |

---

## Passo 8: Validar antes de reportar

| Verificação | Ação |
|-------------|------|
| **Credencial real?** | Tem senha, token, key, secret? Se não, pode ser Informativo. |
| **Outro usuário/projeto?** | Dado sensível de recurso que não é seu? ↑ impacto. |
| **Reproduzível?** | Aba anônima, limpar cache, repetir. |
| **No escopo?** | Conferir [política GitLab](https://hackerone.com/gitlab) — metadata sozinha é fora. |

---

## Modelo de relatório (GitLab HackerOne)

```
Título: Information Disclosure — [credencial/token] em comentário HTML

Alvo: https://gitlab.com (ou GDK)

URL afetada: [URL da página ou endpoint]

Descrição: Ao analisar o código-fonte da página [X] (Ctrl+U) [ou a resposta da requisição Y no DevTools → Network], identifiquei um comentário HTML contendo [tipo de dado sensível].

Comentário encontrado:
[colar o comentário exato]

Impacto: Um atacante pode usar essa credencial para [acesso à API / projeto / etc.]. Isso constitui vazamento de dados confidenciais.

Passos para reproduzir:
1. Acessar [URL] [autenticado como X se necessário]
2. Pressionar Ctrl+U (View Page Source) [ou abrir DevTools → Network → requisição Y → Response]
3. Buscar por <!-- [ou a palavra-chave]
4. Localizar o comentário

Prova: [anexar screenshot e/ou request/response]

Conhecimento público: [Sim/Não — pesquise antes]
```

---

## Checklist GitLab — Comentários HTML

```
[ ] Conta @wearehackerone.com (GitLab.com) ou GDK rodando
[ ] Ctrl+U em: login, 404, projeto, grupo
[ ] Ctrl+F por <!-- em cada página
[ ] Ctrl+F por: password, secret, token, key, TODO
[ ] DevTools → Network → Response de cada requisição HTML
[ ] Verificar <script> para comentários //
[ ] GitLab Pages (*.gitlab.io) — Ctrl+U em páginas estáticas
[ ] Screenshot + URL + texto exato se encontrar credencial
[ ] Validar: credencial real + no escopo + reproduzível
```

---

## O que NÃO reportar (GitLab)

- Comentários só de estrutura: `<!-- Vue component -->`, `<!-- Navbar -->`
- Versão de software em header ou comentário
- Enumeração (existência de projeto, IDs)
- Dados que você já tem acesso legítimo

---

## Recursos

- **Política GitLab:** https://hackerone.com/gitlab
- **GDK:** https://gitlab.com/gitlab-org/gitlab-development-kit
- **Código-fonte:** https://gitlab.com/gitlab-org/gitlab (para auditar onde comentários podem aparecer)
