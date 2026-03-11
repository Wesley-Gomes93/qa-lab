"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SESSION_KEY = "qa-lab-session";

type Metrics = {
  api: { avgMs: number | null; lastMs: number | null; sampleCount: number };
  auth: { rate: number; success: number; failure: number; total: number } | null;
};

export default function MetricasPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      if (s?.token) setToken(s.token);
    } catch {}
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_URL}/api/metrics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setMetrics)
      .catch(() => setMetrics(null))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div data-testid="page-metricas">
      <h1 className="mb-2 text-2xl font-bold text-white">Métricas</h1>
      <p className="mb-6 text-zinc-400">
        API Response Time, Auth Success Rate e amostras em memória (últimas requisições).
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6" data-testid="metricas-card-api">
          <h3 className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-500">
            API Response Time
          </h3>
          <p className="text-2xl font-bold text-emerald-400">
            {metrics?.api?.avgMs != null ? `${metrics.api.avgMs} ms` : "—"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Média (últimas {metrics?.api?.sampleCount ?? 0} requisições)
            {metrics?.api?.lastMs != null && ` · Última: ${metrics.api.lastMs} ms`}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-500">
            Auth Success Rate
          </h3>
          <p className="text-2xl font-bold text-cyan-400">
            {metrics?.auth != null ? `${(metrics.auth.rate * 100).toFixed(1)}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {metrics?.auth != null
              ? `${metrics.auth.success} sucesso(s) / ${metrics.auth.failure} falha(s) (${metrics.auth.total} tentativas)`
              : "Nenhuma tentativa de login ainda"}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-500">
            Test Failure Rate
          </h3>
          <p className="text-sm text-zinc-400">
            Disponível no endpoint <strong>Health</strong> (calculado sobre os últimos 100 test runs no banco).
          </p>
        </div>
      </div>
    </div>
  );
}
