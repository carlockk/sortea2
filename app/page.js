"use client";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [paywallEnabled, setPaywallEnabled] = useState(true);

  useEffect(() => {
    // Leemos flag desde una meta-env inyectada por Next (build-time):
    // Alternativamente podrías exponerlo desde una API, pero basta con usar el valor “esperado”
    // en runtime para local. Aquí lo inferimos por query 'paywall' también:
    const envEnabled = process.env.NEXT_PUBLIC_PAYWALL_ENABLED;
    if (typeof envEnabled !== "undefined") {
      setPaywallEnabled(envEnabled === "true");
    } else {
      // fallback: si llega con ?paywall=1 asumimos que estaba ON
      const url = new URL(window.location.href);
      setPaywallEnabled(url.searchParams.get("paywall") === "1");
    }
  }, []);

  const goToDashboard = () => {
    if (paywallEnabled) {
      setShowModal(true);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="text-xl font-bold">sortea<span className="text-blue-600">2</span></div>
          <nav className="space-x-4 text-sm">
            <button onClick={goToDashboard} className="hover:text-blue-600">Dashboard</button>
            <a className="rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700" href="/api/meta/oauth/login">
              Conectar Meta
            </a>
          </nav>
        </div>
      </header>

      {/* … (resto de la landing igual que lo tenías) … */}

      {/* Modal solo si paywallEnabled === true */}
      {paywallEnabled && showModal && (
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
