const express = require("express");
const { pool, ADMIN_EMAIL } = require("../db");
const logger = require("../logger");
const metrics = require("../metrics");

const router = express.Router();
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-qa-lab";

function isAdminAuth(req) {
  const auth = req.headers.authorization;
  return auth === `Bearer ${ADMIN_TOKEN}`;
}

function isApiKeyAuth(req) {
  const key = req.headers["x-api-key"];
  return key && key === process.env.QA_LAB_API_KEY;
}

function canWriteTestRuns(req) {
  return isAdminAuth(req) || isApiKeyAuth(req);
}

// POST /api/test-runs — receive test run result (from Cypress/CI/agent)
router.post("/test-runs", async (req, res) => {
  if (!canWriteTestRuns(req)) {
    return res.status(403).json({ error: "Acesso negado. Use Bearer admin ou X-Api-Key." });
  }

  const {
    suite,
    spec,
    status,
    duration_ms,
    total_tests,
    passed,
    failed,
    source = "manual",
    metadata,
    report_url,
  } = req.body;

  if (!status || !["passed", "failed"].includes(status)) {
    return res.status(400).json({ error: "Campo 'status' é obrigatório e deve ser 'passed' ou 'failed'." });
  }

  const meta = metadata || {};
  if (report_url) meta.report_url = report_url;

  try {
    const result = await pool.query(
      `INSERT INTO test_runs (suite, spec, status, duration_ms, total_tests, passed, failed, source, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, suite, spec, status, duration_ms, total_tests, passed, failed, source, reported_at`,
      [
        suite ?? null,
        spec ?? null,
        status,
        duration_ms ?? null,
        total_tests ?? null,
        passed ?? null,
        failed ?? null,
        source,
        Object.keys(meta).length ? JSON.stringify(meta) : null,
      ]
    );
    const row = result.rows[0];
    logger.info("Test run recorded", { id: row.id, status: row.status, source: row.source });
    return res.status(201).json(row);
  } catch (err) {
    logger.error("Failed to insert test run", { error: err.message });
    throw err;
  }
});

// GET /api/test-runs — list history (paginated)
router.get("/test-runs", async (req, res) => {
  if (!isAdminAuth(req)) {
    return res.status(403).json({ error: "Acesso negado. Apenas admin." });
  }

  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  const statusFilter = req.query.status; // passed | failed

  let query = `
    SELECT id, suite, spec, status, duration_ms, total_tests, passed, failed, source, metadata, reported_at
    FROM test_runs
  `;
  const params = [];
  if (statusFilter === "passed" || statusFilter === "failed") {
    params.push(statusFilter);
    query += ` WHERE status = $1`;
  }
  query += ` ORDER BY reported_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  try {
    const result = await pool.query(query, params);
    const countResult = await pool.query(
      statusFilter === "passed" || statusFilter === "failed"
        ? "SELECT COUNT(*) FROM test_runs WHERE status = $1"
        : "SELECT COUNT(*) FROM test_runs",
      statusFilter ? [statusFilter] : []
    );
    const total = parseInt(countResult.rows[0].count, 10);
    return res.json({
      items: result.rows,
      total,
      limit,
      offset,
    });
  } catch (err) {
    logger.error("Failed to list test runs", { error: err.message });
    throw err;
  }
});

// GET /api/metrics — current metrics for dashboard
router.get("/metrics", (req, res) => {
  if (!isAdminAuth(req)) {
    return res.status(403).json({ error: "Acesso negado. Apenas admin." });
  }
  res.json(metrics.getMetrics());
});

// POST /api/clean-test-users — remove users with @teste.com email (keeps admin)
router.post("/clean-test-users", async (req, res) => {
  if (!isAdminAuth(req)) {
    return res.status(403).json({ error: "Acesso negado. Apenas admin." });
  }
  try {
    const r = await pool.query(
      `DELETE FROM users WHERE email LIKE '%@teste.com' AND email != $1`,
      [ADMIN_EMAIL]
    );
    const deleted = r.rowCount ?? 0;
    logger.info("Clean test users", { deleted });
    return res.json({ ok: true, deleted });
  } catch (err) {
    logger.error("Clean test users failed", { error: err.message });
    throw err;
  }
});

module.exports = router;
