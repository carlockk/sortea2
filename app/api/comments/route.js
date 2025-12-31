import { connectMongo } from "@/lib/mongo";
import Comment from "@/models/Comment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  await connectMongo();
  const comments = await Comment.find();
  return Response.json(comments);
}
