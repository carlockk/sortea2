import { connectMongo } from "../lib/mongo.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

async function seed() {
  try {
    await connectMongo();

    console.log("🔄 Limpiando colecciones...");
    await User.deleteMany();
    await Comment.deleteMany();

    console.log("➕ Insertando usuarios de ejemplo...");
    await User.insertMany([
      { name: "Carlos", email: "carlos@test.com", role: "admin" },
      { name: "Ana", email: "ana@test.com", role: "user" },
      { name: "Pepe", email: "pepe@test.com", role: "user" },
    ]);

    console.log("➕ Insertando comentarios de ejemplo...");
    await Comment.insertMany([
      { username: "ana", text: "¡Participo! #suerte", postId: "post123" },
      { username: "pepe", text: "Quiero ganar! @amigo", postId: "post123" },
      { username: "lucia", text: "Vamos! #sorteo", postId: "post123" },
    ]);

    console.log("✅ Seed completado con usuarios y comentarios de ejemplo");
  } catch (err) {
    console.error("❌ Error ejecutando seed:", err);
  } finally {
    process.exit();
  }
}

seed();
