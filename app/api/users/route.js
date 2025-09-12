import { connectMongo } from "@/lib/mongo";
import User from "@/models/User";

export async function GET() {
  await connectMongo();
  const users = await User.find();
  return Response.json(users);
}
