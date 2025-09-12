export default function Cancel() {
  return (
    <main className="grid min-h-[60vh] place-items-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-rose-600">Pago cancelado</h1>
        <p className="mt-2 text-slate-600">Puedes intentarlo nuevamente cuando quieras.</p>
        <a href="/" className="mt-6 inline-block rounded-lg border px-4 py-2 font-semibold hover:bg-slate-50">
          Volver al inicio
        </a>
      </div>
    </main>
  );
}
