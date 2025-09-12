import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  const secret = process.env.STRIPE_SECRET_KEY || "";
  const pub = process.env.STRIPE_PUBLIC_KEY || "";
  const priceId = process.env.STRIPE_PRICE_ID || "";

  // Si no hay claves, activa "demo" (sin Stripe real)
  if (!secret || !pub || !priceId) {
    return NextResponse.json({ demo: true });
  }

  try {
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.PUBLIC_URL || "http://localhost:3000"}/pay/success`,
      cancel_url: `${process.env.PUBLIC_URL || "http://localhost:3000"}/pay/cancel`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo crear sesión" }, { status: 500 });
  }
}
