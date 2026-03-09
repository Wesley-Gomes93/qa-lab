/**
 * Reads the latest mochawesome JSON report (from cypress/reports) and POSTs a summary
 * to the QA Lab API (POST /api/test-runs). Use after `cypress run` with reporter saveJson: true.
 *
 * Usage: node scripts/report-to-api.js [--api-url URL] [--token TOKEN]
 * Env: QA_LAB_API_URL, ADMIN_TOKEN or QA_LAB_API_KEY
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const reportsDir = path.join(__dirname, "../cypress/reports");
const apiUrl = process.env.QA_LAB_API_URL || process.argv.find((a) => a.startsWith("--api-url="))?.slice("--api-url=".length) || "http://localhost:4000";
const token = process.env.ADMIN_TOKEN || process.argv.find((a) => a.startsWith("--token="))?.slice("--token=".length) || "admin-qa-lab";
const apiKey = process.env.QA_LAB_API_KEY;
const source = process.env.QA_LAB_TEST_SOURCE || "cypress";

function findLatestJsonReport() {
  if (!fs.existsSync(reportsDir)) return null;
  const files = fs.readdirSync(reportsDir).filter((f) => f.endsWith(".json"));
  if (files.length === 0) return null;
  const withTime = files.map((f) => ({
    f,
    mtime: fs.statSync(path.join(reportsDir, f)).mtime.getTime(),
  }));
  withTime.sort((a, b) => b.mtime - a.mtime);
  return path.join(reportsDir, withTime[0].f);
}

function parseMochawesome(jsonPath) {
  const raw = fs.readFileSync(jsonPath, "utf8");
  const data = JSON.parse(raw);
  const stats = data.stats || {};
  const passed = stats.passes ?? 0;
  const failed = stats.failures ?? 0;
  const total = passed + failed;
  const duration = stats.duration != null ? Math.round(stats.duration) : null;
  return {
    status: failed > 0 ? "failed" : "passed",
    total_tests: total,
    passed,
    failed,
    duration_ms: duration,
    suite: "all",
    spec: null,
    source,
    metadata: { reportFile: path.basename(jsonPath) },
  };
}

function postToApi(payload) {
  const url = new URL(`${apiUrl.replace(/\/$/, "")}/api/test-runs`);
  const isHttps = url.protocol === "https:";
  const body = JSON.stringify(payload);
  const headers = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  };
  if (apiKey) {
    headers["X-Api-Key"] = apiKey;
  } else {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    const req = (isHttps ? https : http).request(
      {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: "POST",
        headers,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ ok: true, status: res.statusCode, body: data });
          } else {
            reject(new Error(`API ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

const jsonPath = findLatestJsonReport();
if (!jsonPath) {
  console.warn("No mochawesome JSON report found in cypress/reports. Run cypress run with reporter saveJson: true first.");
  process.exit(0);
}

const payload = parseMochawesome(jsonPath);
postToApi(payload)
  .then((r) => {
    console.log("Test run reported to API:", payload.status, "id:", JSON.parse(r.body)?.id ?? "ok");
  })
  .catch((err) => {
    console.error("Failed to report to API:", err.message);
    process.exit(1);
  });
