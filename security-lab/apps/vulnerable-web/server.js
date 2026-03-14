/**
 * Intentionally vulnerable web server for security testing practice.
 * ⚠️ DO NOT deploy to production.
 */

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory store for Stored XSS demo
const comments = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// --- Vulnerable Routes ---

// 1. Reflected XSS: search echoes user input without sanitization
app.get("/search", (req, res) => {
  const q = req.query.q || "";
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Search Results</title></head>
    <body>
      <h1>Search</h1>
      <p>Results for: ${q}</p>
      <a href="/">Back</a>
    </body>
    </html>
  `);
});

// 2. Stored XSS: comments stored and rendered without sanitization
app.post("/comment", (req, res) => {
  comments.push({ text: req.body.comment || "", date: new Date().toISOString() });
  res.redirect("/comments");
});

app.get("/comments", (req, res) => {
  const list = comments
    .map((c) => `<li>${c.text} <small>${c.date}</small></li>`)
    .join("");
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Comments</title></head>
    <body>
      <h1>Comments</h1>
      <ul>${list || "<li>No comments yet</li>"}</ul>
      <form action="/comment" method="POST">
        <input name="comment" placeholder="Add comment" />
        <button type="submit">Submit</button>
      </form>
      <a href="/">Back</a>
    </body>
    </html>
  `);
});

// 3. Open Redirect: redirects to any URL from query param
app.get("/redirect", (req, res) => {
  const url = req.query.url || "/";
  res.redirect(url);
});

// 4. Information Disclosure: debug endpoint with sensitive data
app.get("/debug", (req, res) => {
  res.json({
    env: process.env,
    node: process.version,
    // Intentionally exposed "secret"
    admin_password: "admin123",
  });
});

// 5. Path Traversal: no validation - user can request ../../etc/passwd
app.get("/file", (req, res) => {
  const file = req.query.name || "index.html";
  const filepath = path.join(__dirname, "public", file);
  res.sendFile(filepath, (err) => {
    if (err) res.status(404).send("File not found");
  });
});

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`[vulnerable-web] ⚠️  Running at http://localhost:${PORT}`);
  console.log("[vulnerable-web] DO NOT deploy to production.");
});
