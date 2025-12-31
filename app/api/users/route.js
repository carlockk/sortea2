import { connectMongo } from "@/lib/mongo";
import User from "@/models/User";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  await connectMongo();
  const users = await User.find();
  return Response.json(users);
}
