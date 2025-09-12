import { connectMongo } from "@/lib/mongo";
import MetaAuth from "@/models/MetaAuth";

export async function GET() {
  await connectMongo();
  const last = await MetaAuth.findOne().sort({ updatedAt: -1 }).lean();
  return Response.json({
    metaUserId: last?.metaUserId || null,
    pages: last?.pages || [],
  });
}
