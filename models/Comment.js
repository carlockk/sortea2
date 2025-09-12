import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  username: String,
  text: String,
  postId: String, // referencia a la publicación ficticia
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
