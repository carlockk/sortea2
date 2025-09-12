"use client";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const paywall = useMemo(() => {
    if (typeof window === "undefined") return false;
    const url = new URL(window.location.href);
    return url.searchParams.get("paywall") === "1";
  }, []);

  useEffect(() => {
    if (paywall) setShowModal(true);
  }, [paywall]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="text-xl font-bold">sortea<span className="text-blue-600">2</span></div>
          <nav className="space-x-4 text-sm">
            <button onClick={() => setShowModal(true)} className="hover:text-blue-600">Dashboard</button>
            <a className="rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700" href="/api/meta/oauth/login">
              Conectar Meta
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50" />
          <div className="relative mx-auto max-w-6xl px-4">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
                  Sorteos simples para <span className="text-blue-600">Instagram</span> y <span className="text-blue-600">Facebook</span>
                </h1>
                <p className="mt-4 text-lg text-slate-600">
                  Importa comentarios, aplica filtros y elige ganadores con transparencia.
                </p>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setShowModal(true)} className="rounded-xl border px-5 py-3 font-medium hover:bg-slate-50">
                    Ir al Dashboard
                  </button>
                  <a href="/api/meta/oauth/login" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                    Conectar Meta (FB/IG)
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="rounded-xl border p-4"><div className="text-2xl font-bold">1</div><p>Conecta tu cuenta</p></div>
                  <div className="rounded-xl border p-4"><div className="text-2xl font-bold">2</div><p>Elige la publicación</p></div>
                  <div className="rounded-xl border p-4"><div className="text-2xl font-bold">3</div><p>Sortea y anuncia</p></div>
                </div>
              </div>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border bg-white p-6"><h3 className="text-lg font-semibold">Instagram</h3><p className="mt-2 text-sm text-slate-600">Sorteos basados en comentarios de posts o reels.</p></div>
              <div className="rounded-2xl border bg-white p-6"><h3 className="text-lg font-semibold">Facebook</h3><p className="mt-2 text-sm text-slate-600">Usa comentarios de publicaciones de tu página.</p></div>
              <div className="rounded-2xl border bg-white p-6"><h3 className="text-lg font-semibold">Transparencia</h3><p className="mt-2 text-sm text-slate-600">Exporta comentarios y genera evidencia del sorteo.</p></div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Paywall */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">¿Deseas activar el Dashboard?</h2>
            <p className="mt-2 text-sm text-slate-600">Para continuar, debes realizar el pago.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <a href="/checkout" className="rounded-xl bg-emerald-600 px-4 py-2 text-center font-semibold text-white hover:bg-emerald-700">Sí</a>
              <button
                onClick={() => {
                  alert("😢 Lamentamos tu decisión. ¡Esperamos verte pronto!");
                  setShowModal(false);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
          © {new Date().getFullYear()} sortea2 — Hecho con Next.js + Tailwind
        </div>
      </footer>
    </>
  );
}
