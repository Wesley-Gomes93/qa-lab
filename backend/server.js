const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { pool, initDb, ADMIN_EMAIL } = require("./db");
const logger = require("./logger");
const metrics = require("./metrics");
const testRunsRouter = require("./routes/test-runs");

const app = express();

const REGISTROS_FILE = path.join(__dirname, "registros.txt");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-qa-lab";

function appendRegistro(user) {
  const line = `${new Date().toISOString()} | ${user.id} | ${user.name} | ${user.email}\n`;
  if (!fs.existsSync(REGISTROS_FILE)) {
    fs.writeFileSync(REGISTROS_FILE, "data | id | nome | email\n", "utf8");
  }
  fs.appendFileSync(REGISTROS_FILE, line, "utf8");
}

function isAdminAuth(req) {
  const auth = req.headers.authorization;
  return auth === `Bearer ${ADMIN_TOKEN}`;
}

app.use(cors());
app.use(express.json());

const requestId = () => Math.random().toString(36).slice(2, 10);
app.use((req, res, next) => {
  const start = Date.now();
  req.requestId = requestId();
  res.on("finish", () => {
    const duration = Date.now() - start;
    metrics.recordResponseTime(duration);
    logger.info("request", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: duration,
    });
  });
  next();
});

app.get("/health", async (req, res) => {
  let dbStatus = "unknown";
  let testFailureRate = null;
  try {
    await pool.query("SELECT 1");
    dbStatus = "ok";
    const r = await pool.query(
      "SELECT status FROM test_runs ORDER BY reported_at DESC LIMIT 100"
    );
    if (r.rows.length > 0) {
      const failed = r.rows.filter((x) => x.status === "failed").length;
      testFailureRate = {
        rate: Math.round((failed / r.rows.length) * 100) / 100,
        totalRuns: r.rows.length,
        failed,
      };
    }
  } catch (e) {
    dbStatus = "error";
    logger.warn("Health check DB failed", { error: e.message });
  }

  const apiStats = metrics.getApiResponseTimeStats();
  const authRate = metrics.getAuthSuccessRate();

  res.json({
    status: "ok",
    uptime: process.uptime(),
    db: dbStatus,
    metrics: {
      apiResponseTimeMs: apiStats.avgMs,
      apiLastRequestMs: apiStats.lastMs,
      authSuccessRate: authRate ? authRate.rate : null,
      authTotalAttempts: authRate ? authRate.total : 0,
      testFailureRate: testFailureRate ? testFailureRate.rate : null,
      testRunsSampled: testFailureRate ? testFailureRate.totalRuns : 0,
    },
  });
});

// Criar usuário (registro) — persiste no PostgreSQL
app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email e password são obrigatórios" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, idade, ativo, created_at, updated_at",
      [name ?? "", email, password]
    );
    const user = result.rows[0];
    appendRegistro(user);
    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      idade: user.idade,
      ativo: user.ativo,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Usuário já existe" });
    }
    throw err;
  }
});

// Login de usuário
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email e password são obrigatórios" });
  }

  const result = await pool.query(
    "SELECT id, name, email, password FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];

  if (!user || user.password !== password) {
    metrics.recordAuthFailure();
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  metrics.recordAuthSuccess();
  const isAdmin = user.email === ADMIN_EMAIL;

  res.json({
    token: isAdmin ? ADMIN_TOKEN : "fake-token",
    user: { id: user.id, name: user.name, email: user.email },
    isAdmin: !!isAdmin,
  });
});

// Listar todos os usuários (apenas admin)
app.get("/users", async (req, res) => {
  if (!isAdminAuth(req)) {
    return res.status(403).json({ error: "Acesso negado. Apenas admin." });
  }

  const result = await pool.query(
    `SELECT id, name, email, idade, ativo, created_at, updated_at
     FROM users ORDER BY id`
  );
  res.json(result.rows);
});

// Buscar usuário por ID
app.get("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const result = await pool.query(
    "SELECT id, name, email, idade, ativo, created_at, updated_at FROM users WHERE id = $1",
    [id]
  );
  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  res.json(user);
});

// Atualizar usuário (apenas admin)
app.put("/users/:id", async (req, res) => {
  if (!isAdminAuth(req)) {
    return res.status(403).json({ error: "Acesso negado. Apenas admin." });
  }

  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const { name, email, idade, ativo } = req.body;

  if (idade != null) {
    const num = Number(idade);
    if (Number.isNaN(num) || num < 18 || num > 80) {
      return res.status(400).json({
        error: "Idade deve ser entre 18 e 80",
      });
    }
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           idade = $3,
           ativo = COALESCE($4, ativo),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, idade, ativo, created_at, updated_at`,
      [name ?? null, email ?? null, idade != null ? idade : null, ativo != null ? !!ativo : null, id]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json(user);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "E-mail já em uso" });
    }
    throw err;
  }
});

// Excluir usuário (apenas admin) — admin não pode ser excluído
app.delete("/users/:id", async (req, res) => {
  if (!isAdminAuth(req)) {
    return res.status(403).json({ error: "Acesso negado. Apenas admin." });
  }

  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const userResult = await pool.query(
    "SELECT id, email FROM users WHERE id = $1",
    [id]
  );
  const user = userResult.rows[0];
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  if (user.email === ADMIN_EMAIL) {
    return res.status(403).json({ error: "Admin não pode ser excluído" });
  }

  await pool.query("DELETE FROM users WHERE id = $1", [id]);
  res.status(204).send();
});

app.use("/api", testRunsRouter);

const PORT = process.env.PORT || 4000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      logger.info("API rodando", { port: PORT });
    });
  })
  .catch((err) => {
    logger.error("Erro ao conectar no banco", { error: err.message });
    process.exit(1);
  });
