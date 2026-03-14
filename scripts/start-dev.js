#!/usr/bin/env node
/**
 * Inicia o ambiente de desenvolvimento de forma dinâmica.
 * Verifica o que já está rodando e sobe apenas o que falta.
 *
 * Ordem: banco → backend → frontend → vulnerable-web (security lab)
 */
const { spawn } = require("child_process");
const net = require("net");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");

function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 500;
    socket.setTimeout(timeout);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function checkDockerContainer(name) {
  return new Promise((resolve) => {
    const proc = spawn("docker", ["ps", "-q", "-f", `name=${name}`], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    proc.stdout?.on("data", (d) => { out += d.toString(); });
    proc.on("close", (code) => resolve(code === 0 && out.trim().length > 0));
  });
}

async function main() {
  console.log("\n[QA Lab] Verificando ambiente...\n");

  // 1. Banco (PostgreSQL 5432 ou container qa-lab-db)
  const dbUp = await checkPort("localhost", 5432);
  const containerUp = await checkDockerContainer("qa-lab-db");
  const dbRunning = dbUp || containerUp;

  if (dbRunning) {
    console.log("  ✓ Banco (PostgreSQL) já está rodando");
  } else {
    console.log("  → Subindo banco (Docker)...");
    const dbDir = path.join(ROOT, "database");
    const composeCmd = process.platform === "win32" ? "docker-compose" : "docker";
    const composeArgs = process.platform === "win32" ? ["up", "-d"] : ["compose", "up", "-d"];
    await new Promise((resolve, reject) => {
      const proc = spawn(composeCmd, composeArgs, {
        cwd: dbDir,
        stdio: "inherit",
        shell: true,
      });
      proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`Docker exit ${code}. Certifique-se de que o Docker está rodando.`))));
    });
    console.log("  ✓ Banco iniciado. Aguardando 3s...");
    await new Promise((r) => setTimeout(r, 3000));
  }

  // 2. Backend (4000)
  const backendUp = await checkPort("localhost", 4000);
  if (backendUp) {
    console.log("  ✓ Backend já está rodando (porta 4000)");
  } else {
    console.log("  → Iniciando backend...");
    spawn("npm", ["run", "dev"], {
      cwd: path.join(ROOT, "backend"),
      stdio: "inherit",
      detached: true,
      shell: true,
    }).unref();
    console.log("  ✓ Backend iniciando (aguarde ~5s)");
    await new Promise((r) => setTimeout(r, 5000));
  }

  // 3. Frontend (3000)
  const frontendUp = await checkPort("localhost", 3000);
  if (frontendUp) {
    console.log("  ✓ Frontend já está rodando (porta 3000)");
  } else {
    console.log("  → Iniciando frontend...");
    spawn("npm", ["run", "dev"], {
      cwd: path.join(ROOT, "frontend"),
      stdio: "inherit",
      detached: true,
      shell: true,
    }).unref();
    console.log("  ✓ Frontend iniciando (aguarde ~8s)");
  }

  // 4. Vulnerable Web (3001) — Security Lab
  const vulnWebUp = await checkPort("localhost", 3001);
  if (vulnWebUp) {
    console.log("  ✓ Vulnerable Web (Security Lab) já está rodando (porta 3001)");
  } else {
    const vulnWebPath = path.join(ROOT, "security-lab", "apps", "vulnerable-web");
    if (fs.existsSync(path.join(vulnWebPath, "package.json"))) {
      console.log("  → Iniciando Vulnerable Web (Security Lab)...");
      spawn("npm", ["run", "dev"], {
        cwd: vulnWebPath,
        stdio: "inherit",
        detached: true,
        shell: true,
      }).unref();
      console.log("  ✓ Vulnerable Web iniciando em http://localhost:3001");
    }
  }

  console.log("\n[QA Lab] Ambiente pronto.");
  console.log("  Backend:       http://localhost:4000");
  console.log("  Frontend:      http://localhost:3000");
  console.log("  Vulnerable Web: http://localhost:3001");
  console.log("  Para rodar testes: npm run tests:run");
  console.log("  Para o agent:      npm run agent:test-writer \"sua requisição\"\n");
}

main().catch((err) => {
  console.error("[QA Lab] Erro:", err.message);
  process.exit(1);
});
