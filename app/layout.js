// app/layout.js
import "./globals.css"; // 👈 necesario para que Tailwind cargue

export const metadata = {
  title: "sortea2",
  description: "Sorteos para Instagram y Facebook",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
