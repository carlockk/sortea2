"use client";
import { useEffect, useState } from "react";

export default function Checkout() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const go = async () => {
      try {
        const res = await fetch("/api/stripe/checkout", { method: "POST" });
        const data = await res.json();
        if (data.demo) {
          // Modo demo: simula pago y confirma
          const ok = await fetch("/api/pay/confirm", { method: "POST" });
          window.location.href = "/pay/success";
          return;
        }
        if (!data.url) throw new Error(data.error || "No se pudo crear sesión");
        window.location.href = data.url;
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    go();
  }, []);

  return (
    <main className="grid min-h-[60vh] place-items-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Redirigiendo a pago…</h1>
        <p className="mt-2 text-slate-600">
          {loading ? "Preparando tu sesión de pago segura." : error || "Listo."}
        </p>
      </div>
    </main>
  );
}
