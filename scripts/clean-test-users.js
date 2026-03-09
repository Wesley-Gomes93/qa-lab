#!/usr/bin/env node
/**
 * Limpa usuários de teste (@teste.com) do banco via API.
 * Mantém o admin. Use antes de rodar testes para evitar acúmulo.
 *
 * Uso: node scripts/clean-test-users.js
 * Env: QA_LAB_API_URL (default http://localhost:4000), ADMIN_TOKEN (default admin-qa-lab)
 */
const apiUrl = process.env.QA_LAB_API_URL || "http://localhost:4000";
const token = process.env.ADMIN_TOKEN || "admin-qa-lab";

async function main() {
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/clean-test-users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Erro:", res.status, data.error || res.statusText);
      process.exit(1);
    }
    console.log(`Usuários de teste removidos: ${data.deleted ?? 0}`);
  } catch (err) {
    console.error("Falha ao conectar na API:", err.message);
    console.error("Certifique-se de que o backend está rodando (npm run backend:dev)");
    process.exit(1);
  }
}

main();
