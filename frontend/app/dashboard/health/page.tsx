"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Health = {
  status: string;
  uptime?: number;
  db: string;
  metrics?: {
    apiResponseTimeMs: number | null;
    apiLastRequestMs: number | null;
    authSuccessRate: number | null;
    authTotalAttempts: number;
    testFailureRate: number | null;
    testRunsSampled: number;
  };
};

export default function HealthPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
        Falha ao consultar health: {error ?? "Resposta inválida"}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Health Check</h1>
      <p className="mb-6 text-zinc-400">
        Status da API, banco de dados e métricas agregadas (observabilidade).
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-500">API</h3>
          <p className="text-2xl font-bold text-emerald-400">{health.status}</p>
          {health.uptime != null && (
            <p className="mt-1 text-xs text-zinc-500">Uptime: {Math.floor(health.uptime)}s</p>
          )}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-500">Database</h3>
          <p className={`text-2xl font-bold ${health.db === "ok" ? "text-emerald-400" : "text-red-400"}`}>
            {health.db}
          </p>
        </div>
        {health.metrics && (
          <>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-500">
                API Response Time (média)
              </h3>
              <p className="text-2xl font-bold text-cyan-400">
                {health.metrics.apiResponseTimeMs != null ? `${health.metrics.apiResponseTimeMs} ms` : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-500">
                Auth Success Rate
              </h3>
              <p className="text-2xl font-bold text-amber-400">
                {health.metrics.authSuccessRate != null
                  ? `${(health.metrics.authSuccessRate * 100).toFixed(1)}%`
                  : "—"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {health.metrics.authTotalAttempts} tentativas
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-500">
                Test Failure Rate
              </h3>
              <p className="text-2xl font-bold text-violet-400">
                {health.metrics.testFailureRate != null
                  ? `${(health.metrics.testFailureRate * 100).toFixed(1)}%`
                  : "—"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Últimos {health.metrics.testRunsSampled} runs
              </p>
            </div>
          </>
        )}
      </div>
      <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="mb-2 text-sm font-medium text-zinc-500">JSON bruto</h3>
        <pre className="overflow-x-auto text-xs text-zinc-400">
          {JSON.stringify(health, null, 2)}
        </pre>
      </div>
    </div>
  );
}
