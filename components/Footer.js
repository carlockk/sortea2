export default function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} sortea2 — Hecho con Next.js + Tailwind</p>
      </div>
    </footer>
  );
}
