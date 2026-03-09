"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const SESSION_KEY = "qa-lab-session";

export default function Home() {
  const router = useRouter();
  const [health, setHealth] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [registerResult, setRegisterResult] = useState<string | null>(null);
  const [loginResult, setLoginResult] = useState<string | null>(null);

  async function checkHealth() {
    try {
      setHealthError(null);
      const res = await fetch(`${API_URL}/health`);
      const data = await res.json();
      setHealth(JSON.stringify(data, null, 2));
    } catch (err) {
      setHealthError("Não foi possível conectar na API.");
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setRegisterResult(
        `Status: ${res.status}\nResposta: ${JSON.stringify(data, null, 2)}`
      );
    } catch (err) {
      setRegisterResult("Erro ao chamar /auth/register");
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const body = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.token && data.user) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({
              token: data.token,
              user: data.user,
              isAdmin: !!data.isAdmin,
            })
          );
        }
        router.push("/dashboard");
        return;
      }
      setLoginResult(
        `Status: ${res.status}\nResposta: ${JSON.stringify(data, null, 2)}`
      );
    } catch (err) {
      setLoginResult("Erro ao chamar /auth/login");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">QA Lab – Playground de Testes</h1>
          <p className="text-zinc-600">
            Aqui você consegue brincar com a API (registro, login) e depois
            automatizar tudo com Cypress e com o MCP.
          </p>
          <p className="text-sm text-zinc-500">
            URL da API usada pelo site:{" "}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">
              {API_URL}
            </code>
          </p>
        </header>

        <section className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-2 text-lg font-semibold">
            1. Healthcheck da API
          </h2>
          <button
            type="button"
            onClick={checkHealth}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            data-testid="btn-healthcheck"
          >
            Testar /health
          </button>
          <div className="mt-3">
            {healthError && (
              <p className="text-sm text-red-600">{healthError}</p>
            )}
            {health && (
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">
                {health}
              </pre>
            )}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="mb-3 text-lg font-semibold">
              2. Registrar usuário (/auth/register)
            </h2>
            <form
              onSubmit={handleRegister}
              className="space-y-3"
              data-testid="form-register"
              noValidate
            >
              <div className="space-y-1">
                <label className="block text-sm font-medium" htmlFor="name">
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                  placeholder="Seu nome"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                  placeholder="voce@exemplo.com"
                  data-testid="register-email"
                />
              </div>

              <div className="space-y-1">
                <label
                  className="block text-sm font-medium"
                  htmlFor="password"
                >
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                  data-testid="register-password"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                data-testid="btn-register"
              >
                Registrar
              </button>
            </form>

            {registerResult && (
              <pre className="mt-3 max-h-40 overflow-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">
                {registerResult}
              </pre>
            )}
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="mb-3 text-lg font-semibold">
              3. Login (/auth/login)
            </h2>
            <form
              onSubmit={handleLogin}
              className="space-y-3"
              data-testid="form-login"
            >
              <div className="space-y-1">
                <label className="block text-sm font-medium" htmlFor="loginEmail">
                  E-mail
                </label>
                <input
                  id="loginEmail"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                  placeholder="voce@exemplo.com"
                  data-testid="login-email"
                />
              </div>

              <div className="space-y-1">
                <label
                  className="block text-sm font-medium"
                  htmlFor="loginPassword"
                >
                  Senha
                </label>
                <input
                  id="loginPassword"
                  name="password"
                  type="password"
                  required
                  className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                  data-testid="login-password"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                data-testid="btn-login"
              >
                Login
              </button>
            </form>

            {loginResult && (
              <pre className="mt-3 max-h-40 overflow-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">
                {loginResult}
              </pre>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

