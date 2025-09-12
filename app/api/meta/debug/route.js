import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongo";
import MetaAuth from "@/models/MetaAuth";

export async function GET() {
  await connectMongo();
  const doc = await MetaAuth.findOne().sort({ updatedAt: -1 }).lean();
  if (!doc) return NextResponse.json({ ok: false, reason: "no-doc" });

  const pages = (doc.pages || []).map(p => ({
    pageId: p.pageId,
    name: p.name,
    hasIG: !!p.igBusinessId,
  }));
  return NextResponse.json({
    ok: true,
    metaUserId: doc.metaUserId,
    pages,
    hasLongToken: !!doc.longLivedToken, // sin exponer el token
  });
}
