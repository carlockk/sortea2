import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: { type: String, enum: ["admin", "user"], default: "user" },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
