import { NextResponse } from "next/server";

export function middleware(req) {
  // 🔧 Paywall desactivable por env:
  const enabled = (process.env.PAYWALL_ENABLED || "true").toLowerCase() === "true";
  if (!enabled) return NextResponse.next(); // ⬅️ si está OFF, no bloquea nada

  const url = req.nextUrl;
  if (url.pathname.startsWith("/dashboard")) {
    const paid = req.cookies.get("paid")?.value;
    if (paid !== "true") {
      url.pathname = "/";
      url.searchParams.set("paywall", "1");
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
