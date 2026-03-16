/**
 * Portal "normal" para prática de testes de segurança.
 * Parece um intranet comum — vulnerabilidades estão escondidas.
 * ⚠️ DO NOT deploy to production.
 */

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3002;

const feedbacks = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Layout base — visual inspirado em portais reais (SaaS/corporativo)
function layout(title, body) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — TeamHub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, sans-serif; color: #1a1a2e; line-height: 1.6; background: #f8fafc; min-height: 100vh; }
    .header { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.08); padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; }
    .logo { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.25rem; color: #0ea5e9; }
    .logo-dot { width: 10px; height: 10px; background: #0ea5e9; border-radius: 50%; }
    nav { display: flex; gap: 1.5rem; }
    nav a { color: #64748b; text-decoration: none; font-weight: 500; font-size: 0.9rem; }
    nav a:hover { color: #0ea5e9; }
    .main { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .hero { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0891b2 100%); color: #fff; padding: 3rem 2rem; border-radius: 12px; margin-bottom: 2rem; }
    .hero h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
    .hero p { opacity: 0.95; font-size: 1rem; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; }
    .card { background: #fff; padding: 1.5rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,.06); transition: box-shadow .2s; }
    .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); }
    .card a { color: #0ea5e9; text-decoration: none; font-weight: 600; display: block; margin-bottom: 0.25rem; }
    .card a:hover { text-decoration: underline; }
    .card p { color: #64748b; font-size: 0.9rem; }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; color: #1e293b; }
    .search-box { display: flex; gap: 0.5rem; margin: 1rem 0; }
    .search-box input { flex: 1; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; }
    .search-box input:focus { outline: none; border-color: #0ea5e9; }
    .btn { padding: 0.75rem 1.5rem; background: #0ea5e9; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn:hover { background: #0284c7; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-weight: 500; margin-bottom: 0.35rem; color: #334155; }
    .form-group input, .form-group textarea { width: 100%; padding: 0.6rem; border: 1px solid #e2e8f0; border-radius: 6px; }
    .link-list { list-style: none; }
    .link-list li { padding: 0.75rem; background: #fff; margin-bottom: 0.5rem; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
    .link-list a { color: #0ea5e9; text-decoration: none; font-weight: 500; }
    .footer { margin-top: 3rem; padding: 1.5rem 2rem; background: #f1f5f9; color: #64748b; font-size: 0.85rem; text-align: center; }
  </style>
</head>
<body>
  <header class="header">
    <div class="logo"><span class="logo-dot"></span> TeamHub</div>
    <nav>
      <a href="/">Início</a>
      <a href="/buscar">Buscar</a>
      <a href="/contato">Contato</a>
      <a href="/links">Links úteis</a>
      <a href="/documentos">Documentos</a>
      <a href="/contato" class="btn" style="padding:0.5rem 1rem;font-size:0.875rem">Entrar</a>
    </nav>
  </header>
  <div class="main">${body}</div>
  <footer class="footer">TeamHub v1.0 — Plataforma interna</footer>
</body>
</html>`;
}

// 1. Home
app.get("/", (req, res) => {
  res.send(layout("Início", `
    <section class="hero">
      <h1>Experiências digitais começam com você</h1>
      <p style="margin-bottom: 1.5rem;">Conecte sua equipe, centralize o conhecimento e acesse ferramentas em um só lugar.</p>
      <a href="/buscar" class="btn" style="background:#fff;color:#0891b2;text-decoration:none;display:inline-block;">Começar →</a>
    </section>
    <p style="margin-bottom: 1.5rem; color: #64748b;">Use o portal para encontrar informações, enviar feedback e acessar recursos compartilhados.</p>
    <div class="cards">
      <div class="card">
        <a href="/buscar">Buscar</a>
        <p>Encontre informações no sistema e em documentos internos.</p>
      </div>
      <div class="card">
        <a href="/contato">Contato</a>
        <p>Envie sugestões, dúvidas ou feedback para a equipe.</p>
      </div>
      <div class="card">
        <a href="/links">Links úteis</a>
        <p>Acesso rápido a sistemas externos e ferramentas.</p>
      </div>
      <div class="card">
        <a href="/documentos">Documentos</a>
        <p>Visualize arquivos compartilhados e políticas internas.</p>
      </div>
    </div>
  `));
});

// 2. Busca — Reflected XSS (parece busca normal)
app.get("/buscar", (req, res) => {
  const q = req.query.q || "";
  const resultsHtml = q
    ? `<div class="card" style="margin-top: 1rem;"><p><strong>Resultados para:</strong> ${q}</p><p style="color:#64748b;margin-top:0.5rem">Nenhum resultado encontrado.</p></div>`
    : "<p style='color:#64748b'>Digite algo na busca para encontrar informações.</p>";
  res.send(layout("Busca", `
    <h1>Busca interna</h1>
    <form action="/buscar" method="GET">
      <div class="search-box">
        <input type="text" name="q" placeholder="O que você procura?" value="${q.replace(/"/g, "&quot;")}" />
        <button type="submit" class="btn">Buscar</button>
      </div>
    </form>
    ${resultsHtml}
  `));
});

// 3. Contato — Stored XSS (parece formulário normal)
app.post("/contato", (req, res) => {
  feedbacks.push({
    nome: req.body.nome || "Anônimo",
    mensagem: req.body.mensagem || "",
    data: new Date().toISOString(),
  });
  res.redirect("/contato");
});

app.get("/contato", (req, res) => {
  const lista = feedbacks.length
    ? feedbacks.map((f) => `<li class="card" style="margin-bottom:0.5rem"><strong>${f.nome}</strong>: ${f.mensagem} <small style="color:#94a3b8">${f.data}</small></li>`).join("")
    : "<li class='card' style='margin-bottom:0.5rem;color:#94a3b8'>Nenhum feedback ainda.</li>";
  res.send(layout("Contato", `
    <h1>Fale conosco</h1>
    <p style="margin-bottom:1.5rem;color:#64748b">Envie sugestões ou dúvidas. Sua mensagem será revisada pela equipe.</p>
    <form action="/contato" method="POST" style="max-width:480px;margin-bottom:2rem">
      <div class="form-group">
        <label>Nome</label>
        <input name="nome" placeholder="Seu nome" />
      </div>
      <div class="form-group">
        <label>Mensagem</label>
        <textarea name="mensagem" rows="4" placeholder="Sua mensagem"></textarea>
      </div>
      <button type="submit" class="btn">Enviar</button>
    </form>
    <h2 style="font-size:1.1rem;margin-bottom:0.75rem">Últimas mensagens</h2>
    <ul style="list-style:none">${lista}</ul>
  `));
});

// 4. Links úteis — Open Redirect (parece link externo normal)
app.get("/links", (req, res) => {
  const dest = req.query.ir || "";
  const linkList = dest
    ? `<div class="card"><p>Redirecionando para o recurso solicitado...</p><p style="margin-top:1rem"><a href="/links" class="btn" style="display:inline-block;text-decoration:none">Voltar aos links</a></p></div>`
    : `
    <h1>Links úteis</h1>
    <p style="margin-bottom:1.5rem;color:#64748b">Acesso rápido a ferramentas e sistemas externos.</p>
    <ul class="link-list">
      <li><a href="/links?ir=https://google.com">Google</a></li>
      <li><a href="/links?ir=https://docs.google.com">Documentos</a></li>
      <li><a href="/links?ir=https://drive.google.com">Drive</a></li>
    </ul>
  `;
  if (dest) {
    return res.redirect(dest);
  }
  res.send(layout("Links", linkList));
});

// 5. Documentos — Path Traversal (parece visualizador de arquivos normal)
app.get("/documentos", (req, res) => {
  const arquivo = req.query.arquivo || "";
  if (!arquivo) {
    return res.send(layout("Documentos", `
      <h1>Documentos compartilhados</h1>
      <p style="margin-bottom:1.5rem;color:#64748b">Selecione um arquivo para visualizar.</p>
      <ul class="link-list">
        <li><a href="/documentos?arquivo=README.txt">README.txt</a></li>
        <li><a href="/documentos?arquivo=politica.txt">politica.txt</a></li>
      </ul>
    `));
  }
  const filepath = path.join(__dirname, "public", "docs", arquivo);
  res.sendFile(filepath, (err) => {
    if (err) {
      res.status(404).send(layout("Documentos", `
        <h1>Documentos</h1>
        <p>Arquivo não encontrado: ${arquivo}</p>
        <p><a href="/documentos">Voltar à lista</a></p>
      `));
    }
  });
});

app.listen(PORT, () => {
  console.log(`[practice-web] Portal em http://localhost:${PORT}`);
  console.log("[practice-web] Navegue como em um site normal e explore.");
});
