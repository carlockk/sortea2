"use client";
import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";

export default function Dashboard() {
  const [postUrl, setPostUrl] = useState("");
  const [filters, setFilters] = useState({ winners: 1, dedup: true });
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [winners, setWinners] = useState([]);
  const [showCountdown, setShowCountdown] = useState(false);
  const [count, setCount] = useState(3);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setWinners([]);
      const { data } = await axios.post("/api/meta/comments", { target: postUrl.trim() });
      setComments(data.comments || []);
    } catch (e) {
      alert(e?.response?.data?.error || "Error cargando comentarios");
    } finally {
      setLoading(false);
    }
  };

  const runDraw = async () => {
    if (!comments.length) return;
    setShowCountdown(true);
    setCount(3);
    // cuenta regresiva simple
    const t1 = setTimeout(()=>setCount(2), 800);
    const t2 = setTimeout(()=>setCount(1), 1600);
    const t3 = setTimeout(async ()=> {
      try {
        setLoading(true);
        const { data } = await axios.post("/api/draw", { comments, filters });
        setWinners(data.winners || []);
      } catch (e) {
        alert(e?.response?.data?.error || "Error al sortear");
      } finally {
        setLoading(false);
        setShowCountdown(false);
      }
    }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  };

  const downloadCertificate = (winner, index=1) => {
    const doc = new jsPDF({ unit: "pt", format: "A4" });
    const margin = 56;
    const line = (y) => doc.line(margin, y, 595 - margin, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Certificado de Ganador", 297.5, 120, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Sorteo: ${postUrl || "(publicación sin URL informada)"}`, margin, 170);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, margin, 190);

    line(220);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Ganador #${index}: ${winner.username}`, margin, 270);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Comentario: ${winner.text || "(sin texto)"}`, margin, 300, { maxWidth: 595 - margin*2 });

    line(340);
    doc.setFontSize(10);
    doc.text("Este documento fue generado por sortea2 para dar transparencia al resultado.", margin, 370);

    doc.save(`certificado-ganador-${index}.pdf`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="text-xl font-bold">sortea<span className="text-blue-600">2</span></div>
          <nav className="space-x-4 text-sm">
            <a className="hover:text-blue-600" href="/">Inicio</a>
          </nav>
        </div>
      </header>

      <main className="py-10">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

          <div className="grid gap-6 md:grid-cols-3">
            {/* izquierda */}
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">Publicación objetivo</h3>
                <div className="mt-3 flex gap-2">
                  <input
                    className="flex-1 rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pega la URL del post de Instagram o Facebook"
                    value={postUrl}
                    onChange={(e)=>setPostUrl(e.target.value)}
                  />
                  <button
                    onClick={fetchComments}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    disabled={loading || !postUrl}
                  >
                    {loading ? "Cargando..." : "Cargar"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">Filtros</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!filters.dedup}
                      onChange={(e)=>setFilters({ ...filters, dedup: e.target.checked })}
                    />
                    Excluir duplicados
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">Debe mencionar @</span>
                    <input
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="@usuario (opcional)"
                      value={filters.mustMention || ""}
                      onChange={(e)=>setFilters({ ...filters, mustMention: e.target.value })}
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">Hashtag requerido</span>
                    <input
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="#miSorteo (opcional)"
                      value={filters.mustHashtag || ""}
                      onChange={(e)=>setFilters({ ...filters, mustHashtag: e.target.value })}
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium">Cantidad de ganadores</span>
                    <input
                      type="number" min="1"
                      className="w-full rounded-lg border px-3 py-2"
                      value={filters.winners || 1}
                      onChange={(e)=>setFilters({ ...filters, winners: Number(e.target.value) })}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">Comentarios cargados ({comments.length})</h3>
                {comments.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">Sin datos aún. Carga una publicación para ver comentarios.</p>
                ) : (
                  <div className="mt-3 max-h-80 overflow-auto rounded-lg border">
                    <ul className="divide-y text-sm">
                      {comments.map((c, i) => (
                        <li key={i} className="px-3 py-2">
                          <div className="font-medium">{c.username || c.from || "usuario"}</div>
                          <div className="text-slate-600">{c.text}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* derecha */}
            <div className="space-y-6">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">Sorteo</h3>
                <button
                  onClick={runDraw}
                  className="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  disabled={loading || !comments.length}
                >
                  {loading ? "Sorteando..." : "Elegir ganadores"}
                </button>

                <div className="mt-4 space-y-2">
                  {winners.map((w, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="text-xs text-slate-500">Ganador #{i+1}</div>
                      <div className="font-semibold">{w.username}</div>
                      <div className="text-slate-600 break-words">{w.text}</div>

                      <button
                        onClick={() => downloadCertificate(w, i+1)}
                        className="mt-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
                      >
                        Descargar certificado PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">Próximos pasos</h3>
                <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                  <li>Conectar OAuth de Meta: <code>/api/meta/oauth/*</code></li>
                  <li>Validar Webhook: <code>/api/meta/webhook</code></li>
                  <li>Reemplazar fetch de comentarios con Graph API</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay de cuenta regresiva */}
        {showCountdown && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
            <div className="animate-pulse text-9xl font-extrabold text-white">{count}</div>
          </div>
        )}
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
          © {new Date().getFullYear()} sortea2 — Hecho con Next.js + Tailwind
        </div>
      </footer>
    </>
  );
}
