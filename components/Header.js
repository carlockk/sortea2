export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="text-xl font-bold">sortea<span className="text-blue-600">2</span></div>
        <nav className="space-x-4 text-sm">
          <a className="hover:text-blue-600" href="/dashboard">Dashboard</a>
          <a className="hover:text-blue-600" href="https://developers.facebook.com/docs/graph-api/" target="_blank">Docs Meta</a>
          <a className="hover:text-blue-600" href="https://developers.facebook.com/docs/instagram-api/" target="_blank">IG API</a>
        </nav>
      </div>
    </header>
  );
}
