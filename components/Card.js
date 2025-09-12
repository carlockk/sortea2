export default function Card({ title, children, footer }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-3 text-sm text-slate-700">{children}</div>
      {footer && <div className="mt-4 border-t pt-3 text-right">{footer}</div>}
    </div>
  );
}
