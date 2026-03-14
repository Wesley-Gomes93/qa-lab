#!/usr/bin/env node
/**
 * Prepare Audit Context — gera contexto otimizado para o Agente Auditor.
 *
 * REDUZ REQUISIÇÕES: em vez do agente ler README, package.json, docs inteiros,
 * este script produz um único arquivo compacto + detecta o que mudou (diff).
 *
 * Uso:
 *   node scripts/prepare-audit-context.js           → full (primeira vez)
 *   node scripts/prepare-audit-context.js --full     → force full
 *   node scripts/prepare-audit-context.js --incremental  → só delta desde última auditoria
 *   node scripts/prepare-audit-context.js --since=HEAD~1  → diff desde commit (git)
 *
 * Output: .audit/audit-context.txt (e opcionalmente .audit/audit-state.json)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const AUDIT_DIR = path.join(ROOT, ".audit");
const STATE_FILE = path.join(AUDIT_DIR, "audit-state.json");
const CONTEXT_FILE = path.join(AUDIT_DIR, "audit-context.txt");

function fileSignature(filePath) {
  try {
    const stat = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, "utf8");
    const hash = crypto.createHash("sha256").update(content).digest("hex");
    return { hash, mtime: stat.mtimeMs, size: stat.size };
  } catch {
    return null;
  }
}

function getFilesToTrack() {
  const files = [];
  const add = (p) => {
    if (!fs.existsSync(p)) return;
    const rel = path.relative(ROOT, p);
    if (!files.includes(rel)) files.push(rel);
  };

  add(path.join(ROOT, "package.json"));
  add(path.join(ROOT, "README.md"));

  const dirs = ["scripts", "tests/contract", "agents", ".github/workflows"];
  for (const dir of dirs) {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) continue;
    for (const f of fs.readdirSync(full)) {
      if (f.endsWith(".js") || f.endsWith(".yml")) add(path.join(ROOT, dir, f));
    }
  }

  return files;
}

function loadState() {
  try {
    const data = fs.readFileSync(STATE_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function saveState(fingerprints) {
  if (!fs.existsSync(AUDIT_DIR)) fs.mkdirSync(AUDIT_DIR, { recursive: true });
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        fingerprints,
      },
      null,
      2
    )
  );
}

function getChangedFiles(state) {
  const tracked = getFilesToTrack();
  const changed = [];

  for (const rel of tracked) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const sig = fileSignature(full);
    if (!sig) continue;
    const prev = state?.fingerprints?.[rel];
    if (!prev || prev.hash !== sig.hash) {
      changed.push(rel);
    }
  }

  return changed;
}

function getGitChangedFiles(since) {
  try {
    const out = execSync(`git diff --name-only ${since}`, {
      cwd: ROOT,
      encoding: "utf8",
    });
    return out.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function extractScriptTargets(pkg) {
  const scripts = pkg.scripts || {};
  const targets = [];

  for (const [name, cmd] of Object.entries(scripts)) {
    let target = null;
    const nodeMatch = cmd.match(/node\s+([^\s;]+)/);
    const cdMatch = cmd.match(/cd\s+([^\s&]+)\s+&&/);
    if (nodeMatch) target = nodeMatch[1];
    const cdDir = cdMatch ? cdMatch[1].trim() : ".";

    const fullPath = path.join(ROOT, cdDir, target || "").replace(/\/$/, "");
    const exists = target && fs.existsSync(fullPath);
    targets.push({ name, cmd: cmd.substring(0, 60), target: target || "(embutido)", exists });
  }

  return targets;
}

function buildContext(opts) {
  const pkgPath = path.join(ROOT, "package.json");
  const readmeCandidates = ["README-PT.md", "README.pt.md", "README.md"];
  let readmePath = null;
  for (const name of readmeCandidates) {
    const p = path.join(ROOT, name);
    if (fs.existsSync(p)) {
      readmePath = p;
      break;
    }
  }

  if (!fs.existsSync(pkgPath)) {
    console.error("package.json não encontrado");
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const isReadmePt = readmePath && (readmePath.endsWith("README-PT.md") || readmePath.endsWith("README.pt.md"));
  const resumoLabel = isReadmePt ? "Resumo do projeto" : "README (primeiras linhas)";
  const readme = readmePath
    ? fs.readFileSync(readmePath, "utf8").split("\n").slice(0, 80).join("\n") + "\n[...]"
    : "(README não encontrado)";

  const targets = extractScriptTargets(pkg);
  const state = opts.incremental || opts.since ? loadState() : null;
  let changed = [];

  if (opts.since) {
    changed = getGitChangedFiles(opts.since);
  } else if (opts.incremental && state) {
    changed = getChangedFiles(state);
  }

  let modeNote = "";
  if (changed.length > 0) {
    modeNote = `
---
## MODO INCREMENTAL — foco no delta
Arquivos alterados desde última auditoria (ou --since):
${changed.map((f) => `  - ${f}`).join("\n")}

Leia APENAS esses arquivos e dependências diretas. Não releia o resto.
---
`;
  } else if (opts.incremental && state) {
    modeNote = `
---
## MODO INCREMENTAL — nada mudou
Nenhum arquivo rastreado foi alterado. Reutilize o mapa da Fase 1 desta conversa.
Se for início de conversa, faça a descoberta mínima (package.json + scripts).
---
`;
  }

  const modoLabel = opts.full ? "COMPLETO" : opts.incremental ? "INCREMENTAL" : opts.since ? `DESDE ${opts.since}` : "COMPLETO";

  const lines = [
    "# CONTEXTO PARA AGENTE AUDITOR",
    "# Gerado em: " + new Date().toISOString(),
    "# Modo: " + modoLabel,
    "",
    "## package.json (resumo)",
    "nome: " + (pkg.name || "?"),
    "descrição: " + (pkg.description || "?"),
    "",
    "## Scripts declarados e alvos",
    ...targets.map((t) => `  ${t.name}: ${t.cmd} → ${t.target} ${t.exists ? "✓" : "✗"}`),
    "",
    "## Resumo do projeto (primeiras linhas)",
    "```",
    readme,
    "```",
    modeNote,
    "",
    "## Estrutura relevante",
    "scripts/, tests/contract/, agents/, .github/workflows/",
  ];

  return lines.join("\n");
}

function updateFingerprints() {
  const tracked = getFilesToTrack();
  const fingerprints = {};

  for (const rel of tracked) {
    const full = path.join(ROOT, rel);
    if (fs.existsSync(full)) {
      const sig = fileSignature(full);
      if (sig) fingerprints[rel] = sig;
    }
  }

  return fingerprints;
}

function main() {
  const args = process.argv.slice(2);
  const opts = {
    full: args.includes("--full") || (!args.includes("--incremental") && !args.find((a) => a.startsWith("--since="))),
    incremental: args.includes("--incremental"),
    since: args.find((a) => a.startsWith("--since="))?.split("=")[1],
  };

  const context = buildContext(opts);

  if (!fs.existsSync(AUDIT_DIR)) fs.mkdirSync(AUDIT_DIR, { recursive: true });
  fs.writeFileSync(CONTEXT_FILE, context);

  if (opts.full || opts.incremental) {
    const fingerprints = updateFingerprints();
    saveState(fingerprints);
  }

  console.log("✓ Contexto gerado:", CONTEXT_FILE);
  if (opts.incremental || opts.since) {
    const state = loadState();
    const changed = opts.since ? getGitChangedFiles(opts.since) : getChangedFiles(state);
    console.log("  Arquivos alterados:", changed.length || "nenhum");
    if (changed.length > 0) changed.slice(0, 10).forEach((f) => console.log("   -", f));
  }
}

main();
