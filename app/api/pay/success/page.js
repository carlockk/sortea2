export default function Success() {
  return (
    <main className="grid min-h-[60vh] place-items-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-emerald-600">¡Pago exitoso!</h1>
        <p className="mt-2 text-slate-600">Ya puedes usar el Dashboard.</p>
        <a href="/dashboard" className="mt-6 inline-block rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
          Ir al Dashboard
        </a>
      </div>
    </main>
  );
}
