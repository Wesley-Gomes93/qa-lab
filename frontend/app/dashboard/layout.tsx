"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SESSION_KEY = "qa-lab-session";

type Session = { token: string; user: { name: string }; isAdmin?: boolean };

const nav = [
  { href: "/dashboard", label: "Usuários", testId: "nav-usuarios" },
  { href: "/dashboard/testes", label: "Histórico de testes", testId: "nav-testes" },
  { href: "/dashboard/metricas", label: "Métricas", testId: "nav-metricas" },
  { href: "/dashboard/health", label: "Health", testId: "nav-health" },
];

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [mounted, setMounted] = useState(false);

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

  function handleLogout() {
    window.localStorage.removeItem(SESSION_KEY);
    router.replace("/");
  }

  if (!mounted || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0f14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0f14] text-zinc-100">
      <div
        className="fixed inset-0 -z-10 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.15), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(6, 182, 212, 0.08), transparent)
          `,
        }}
      />
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-sm font-medium text-zinc-500">
            QA Lab {session.isAdmin && <span className="ml-2 text-amber-400">(Admin)</span>}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-zinc-600 bg-white/5 px-3 py-1.5 text-sm text-zinc-400 transition hover:border-zinc-500 hover:bg-white/10 hover:text-zinc-200"
            data-testid="btn-logout"
          >
            Sair
          </button>
        </div>
        {session.isAdmin && (
          <nav className="mx-auto flex max-w-6xl gap-1 px-4 pb-3">
            {nav.map(({ href, label, testId }) => (
              <Link
                key={href}
                href={href}
                data-testid={testId}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                    ? "bg-white/10 text-emerald-400"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
