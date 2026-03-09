# Como postar o QA Lab no LinkedIn

Este guia ajuda a publicar o projeto de forma impactante: texto do post + página HTML interativa.

---

## 1. Texto do post

O conteúdo pronto está em **`linkedin-post.txt`**.

- **Duas versões no mesmo arquivo:** português (mais cativante, com gancho "Pare aqui 3 segundos") e inglês (copy-paste abaixo). Use a que fizer mais sentido pro seu público.
- **Idioma:** se postar em PT, pode colar a versão EN no primeiro comentário (e vice-versa) para alcançar os dois públicos.
- Copie e cole no LinkedIn.
- Ajuste o link do repositório e, se quiser, o link da página visual (veja abaixo).
- Você pode encurtar um pouco se passar do limite de caracteres; o núcleo (por que fiz, o que tem, manual vs agente, como rodar) está tudo lá.

---

## 2. Página HTML interativa

O arquivo **`qa-lab-linkedin-visual.html`** é uma página única que mostra:

- A **arquitetura** (Frontend, Backend, DB, Testes, MCP, Agente).
- **Duas abas:** "Modo manual" e "Pelo agente (menu)".
- No modo manual: os 4 passos (banco, backend, frontend, testes) com comandos para copiar.
- Pelo agente: os 3 passos e um preview do menu interativo.
- Um **resumo** e um espaço para link do repositório.

**Importante:** antes de hospedar, abra o HTML e troque `https://github.com/seu-usuario/qa-lab` pela URL real do seu repositório (no link e na linha em JavaScript no final do arquivo).

Para ficar “interativo” de verdade para quem clica:

### Opção A – GitHub Pages (recomendado)

1. Crie um repositório no GitHub (pode ser o próprio `qa-lab` ou um repo só para a página).
2. Ative **GitHub Pages** em Settings → Pages → Source: branch `main` (ou `gh-pages`), pasta `/ (root)` ou `/docs` se o HTML estiver em `docs/`.
3. Se o repo for `seu-usuario/qa-lab` e o HTML estiver em `docs/qa-lab-linkedin-visual.html`, a URL será:
   - `https://seu-usuario.github.io/qa-lab/qa-lab-linkedin-visual.html`  
   ou, se configurar Pages para a pasta `docs/`:  
   - `https://seu-usuario.github.io/qa-lab/docs/qa-lab-linkedin-visual.html`
4. No post (ou no primeiro comentário), escreva algo como:  
   **“Página mostrando como tudo funciona (manual x agente): [cole o link]”**

### Opção B – Abrir o arquivo local

- Mande o arquivo `qa-lab-linkedin-visual.html` por e-mail/Drive para você mesmo (ou para alguém) e abra no navegador.  
- No post você pode dizer: “Montei uma página visual que mostra o fluxo; quem quiser, peço por mensagem ou está no repositório em `docs/`.”

### Opção C – Link direto para o arquivo no GitHub

- Coloque o HTML no repositório (ex.: em `docs/qa-lab-linkedin-visual.html`).
- Use o link “raw” do GitHub para o arquivo e o serviço [htmlpreview.github.io](https://htmlpreview.github.io/):  
  `https://htmlpreview.github.io/?https://github.com/SEU-USUARIO/qa-lab/blob/main/docs/qa-lab-linkedin-visual.html`  
- Esse link abre a página renderizada; você cola no post ou no comentário.

---

## 3. Dica para o post ficar “foda”

- **Primeiro comentário:** use para colar o link da página visual e do repositório. Ex.:  
  “Aqui a página que mostra o fluxo (manual x agente): [link]. Repositório: [link].”
- **Imagem:** se quiser, abra a página no navegador, dê zoom na parte que mostra o menu ou as abas, tire um print e use como imagem do post.
- **Hashtags:** o texto já inclui sugestões; mantenha as que fazem mais sentido para o seu perfil.
- **Interação:** no final você já pede para as pessoas comentarem ou mandarem mensagem; responda quem comentar para aumentar alcance.

Assim você posta o conteúdo em **linkedin-post.txt**, deixa a experiência “minha nossa, que legal” por conta do **qa-lab-linkedin-visual.html** (link no post ou no primeiro comentário) e usa este **README** como checklist na hora de publicar.
