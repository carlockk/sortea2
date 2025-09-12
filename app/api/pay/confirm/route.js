import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // 24h de “pago activo” (ajusta a tu gusto o usa Webhooks Stripe real)
  res.cookies.set("paid", "true", { httpOnly: true, maxAge: 60 * 60 * 24, path: "/" });
  return res;
}
