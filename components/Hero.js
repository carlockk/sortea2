export default function Hero() {
  return (
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
              <a href="/dashboard" className="rounded-xl border px-5 py-3 font-medium hover:bg-slate-50">
                Ir al Dashboard
              </a>
              <a href="/api/meta/oauth/login" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                Conectar Meta (FB/IG)
              </a>
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-xl border p-4">
                <div className="text-2xl font-bold">1</div>
                <p>Conecta tu cuenta</p>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-2xl font-bold">2</div>
                <p>Elige la publicación</p>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-2xl font-bold">3</div>
                <p>Sortea y anuncia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
