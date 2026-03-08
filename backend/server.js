const express = require("express");

const app = express();

app.use(express.json());

// Simples storage em memória para usuários de teste
let nextUserId = 1;
const users = [];

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Criar usuário (registro)
app.post("/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email e password são obrigatórios" });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ error: "Usuário já existe" });
  }

  const user = {
    id: nextUserId++,
    name: name ?? "",
    email,
    password, // apenas para ambiente de laboratório; não use assim em produção
  };

  users.push(user);

  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

// Login de usuário
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email e password são obrigatórios" });
  }

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  // Para laboratório, devolvemos um token estático e dados básicos
  res.json({
    token: "fake-token",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

// Buscar usuário por ID
app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
});

app.listen(4000, () => {
  console.log("API rodando na porta 4000");
});