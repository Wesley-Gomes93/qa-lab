"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SESSION_KEY = "qa-lab-session";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const ADMIN_EMAIL = "admWesley@test.com.br";

type User = { id: number; name: string; email: string };
type UserFull = User & {
  idade: number | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

type Session = {
  token: string;
  user: User;
  isAdmin?: boolean;
};

function formatDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<UserFull[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFull | null>(null);
  const [form, setForm] = useState({ name: "", email: "", idade: "" as string | number, ativo: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw) {
        router.replace("/");
        return;
      }
      const s = JSON.parse(raw);
      if (s?.user && s?.token) setSession(s);
      else router.replace("/");
    } catch {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    if (!session?.isAdmin || !session?.token) return;
    setLoadingUsers(true);
    fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        else setUsers([]);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  }, [session?.isAdmin, session?.token]);

  const user = session?.user ?? null;

  const filteredUsers = filter.trim()
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(filter.toLowerCase()) ||
          u.email?.toLowerCase().includes(filter.toLowerCase())
      )
    : users;

  useEffect(() => {
    if (user) document.title = session?.isAdmin ? "Admin | QA Lab" : "Dashboard | QA Lab";
  }, [session?.isAdmin, user]);

  function openEdit(u: UserFull) {
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      idade: u.idade ?? "",
      ativo: u.ativo,
    });
    setError(null);
  }

  function closeEdit() {
    setEditingUser(null);
    setError(null);
  }

  function handleSaveEdit() {
    if (!editingUser || !session?.isAdmin || !session?.token) return;
    const idadeNum = form.idade === "" ? null : Number(form.idade);
    if (idadeNum != null && (idadeNum < 18 || idadeNum > 80)) {
      setError("A idade só pode ser entre 18 e 80");
      return;
    }
    setSaving(true);
    setError(null);
    const body = {
      name: form.name || undefined,
      email: form.email || undefined,
      idade: form.idade === "" ? null : Number(form.idade),
      ativo: form.ativo,
    };
    fetch(`${API_URL}/users/${editingUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify(body),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((e) => { throw new Error(e.error || "Erro ao salvar"); });
        return r.json();
      })
      .then((updated) => {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        closeEdit();
      })
      .catch((err) => setError(err.message || "Erro ao salvar"))
      .finally(() => setSaving(false));
  }

  function handleDelete(u: UserFull) {
    if (!session?.isAdmin || !session?.token) return;
    if (u.email === ADMIN_EMAIL) return;
    if (!confirm(`Excluir o usuário "${u.name}" (${u.email})?`)) return;
    fetch(`${API_URL}/users/${u.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((r) => {
        if (!r.ok) return r.json().then((body) => { throw new Error(body.error || "Erro ao excluir"); });
        setUsers((prev) => prev.filter((x) => x.id !== u.id));
      })
      .catch((err) => alert(err.message || "Erro ao excluir usuário."));
  }

  if (!mounted || !user) {
    return null;
  }

  return (
    <>
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 shadow-xl backdrop-blur-sm sm:p-10">
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium uppercase tracking-wider text-emerald-400/90">
              Bem-vindo de volta
            </p>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Olá, {user.name || "usuário"}!
            </h1>
            <p className="max-w-md text-zinc-400">
              {session?.isAdmin
                ? "Você tem acesso total. Abaixo você pode ver, editar e excluir todos os usuários."
                : "Seu espaço de testes está pronto."}
            </p>
          </div>
        </section>

        {session?.isAdmin && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Todos os usuários
            </h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Pesquisar por nome ou e-mail"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
                data-testid="filter-users"
              />
            </div>
            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm" data-testid="table-users">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-500">
                        <th className="p-3 font-medium">ID</th>
                        <th className="p-3 font-medium">Nome</th>
                        <th className="p-3 font-medium">E-mail</th>
                        <th className="p-3 font-medium">Idade</th>
                        <th className="p-3 font-medium">Ativo</th>
                        <th className="p-3 font-medium">Criado em</th>
                        <th className="p-3 font-medium">Editado em</th>
                        <th className="p-3 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-white/5" data-testid={`row-user-${u.id}`}>
                          <td className="p-3 font-mono text-zinc-300">{u.id}</td>
                          <td className="p-3 text-zinc-200">{u.name || "—"}</td>
                          <td className="p-3 text-zinc-200">{u.email}</td>
                          <td className="p-3 text-zinc-300">{u.idade ?? "—"}</td>
                          <td className="p-3">
                            <span
                              className={
                                u.ativo
                                  ? "text-emerald-400"
                                  : "text-zinc-500"
                              }
                            >
                              {u.ativo ? "Sim" : "Não"}
                            </span>
                          </td>
                          <td className="p-3 text-zinc-400">{formatDate(u.created_at)}</td>
                          <td className="p-3 text-zinc-400">{formatDate(u.updated_at)}</td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => openEdit(u)}
                              className="mr-2 text-emerald-400 hover:underline"
                              data-testid={`btn-edit-${u.id}`}
                            >
                              Editar
                            </button>
                            {u.email !== ADMIN_EMAIL && (
                              <button
                                type="button"
                                onClick={() => handleDelete(u)}
                                className="text-red-400 hover:underline"
                                data-testid={`btn-delete-${u.id}`}
                              >
                                Excluir
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && !loadingUsers && (
                  <p className="p-6 text-center text-zinc-500">
                    {users.length === 0 ? "Nenhum usuário cadastrado." : "Nenhum resultado para a pesquisa."}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
            Ações rápidas
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#0c0f14]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar ao Playground
            </Link>
          </div>
        </section>

      {/* Modal Editar */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0f14] p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Editar usuário
            </h3>
            {error && (
              <p className="mb-3 text-sm text-red-400" data-testid="modal-edit-error">{error}</p>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500">Idade</label>
                <input
                  type="number"
                  min={0}
                  value={form.idade}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      idade: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  data-testid="modal-edit-idade"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={form.ativo}
                  onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                  className="rounded border-white/20"
                  data-testid="modal-edit-ativo"
                />
                <label htmlFor="ativo" className="text-sm text-zinc-300">
                  Ativo
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-400 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                data-testid="modal-edit-save"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
