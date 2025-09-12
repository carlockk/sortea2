import { NextResponse } from "next/server";

// GET: Verify token (Meta Webhooks)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// POST: Receive events (comments, mentions, etc.)
export async function POST(req) {
  try {
    const body = await req.json();
    // Aquí procesas eventos de FB/IG. Log para inspección.
    console.log("Webhook event:", JSON.stringify(body, null, 2));
    return NextResponse.json({ received: true });
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
