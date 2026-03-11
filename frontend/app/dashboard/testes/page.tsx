"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SESSION_KEY = "qa-lab-session";

type TestRun = {
  id: number;
  suite: string | null;
  spec: string | null;
  status: string;
  duration_ms: number | null;
  total_tests: number | null;
  passed: number | null;
  failed: number | null;
  source: string;
  reported_at: string;
};

function formatDate(s: string) {
  return new Date(s).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TestesPage() {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [total, setTotal] = useState(0);
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
    fetch(`${API_URL}/api/test-runs?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.items) {
          setRuns(data.items);
          setTotal(data.total ?? data.items.length);
        } else setRuns([]);
      })
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div data-testid="page-testes">
      <h1 className="mb-2 text-2xl font-bold text-white">Histórico de testes</h1>
      <p className="mb-6 text-zinc-400">
        Últimas execuções registradas (Cypress / CI / agente). Total: {total} runs.
      </p>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : runs.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center text-zinc-500" data-testid="test-runs-empty">
          Nenhum run de teste registrado ainda. Rode os testes com o reporter (npm run test:report) ou pelo agente e envie o resultado para a API.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]" data-testid="table-test-runs">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-500">
                <th className="p-3 font-medium">Data</th>
                <th className="p-3 font-medium">Suíte</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Passed / Failed</th>
                <th className="p-3 font-medium">Duração</th>
                <th className="p-3 font-medium">Origem</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-b border-white/5">
                  <td className="p-3 text-zinc-400">{formatDate(run.reported_at)}</td>
                  <td className="p-3 text-zinc-300">{run.suite ?? run.spec ?? "—"}</td>
                  <td className="p-3">
                    <span className={run.status === "passed" ? "text-emerald-400" : "text-red-400"}>
                      {run.status}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-300">
                    {run.passed ?? "—"} / {run.failed ?? "—"}
                  </td>
                  <td className="p-3 text-zinc-400">
                    {run.duration_ms != null ? `${run.duration_ms} ms` : "—"}
                  </td>
                  <td className="p-3 text-zinc-500">{run.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
