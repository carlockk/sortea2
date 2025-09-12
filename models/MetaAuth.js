import mongoose, { Schema } from "mongoose";

const PageSchema = new Schema(
  {
    pageId: String,
    name: String,
    accessToken: String,
    igBusinessId: String,
  },
  { _id: false }
);

const MetaAuthSchema = new Schema(
  {
    metaUserId: { type: String, unique: true },
    shortLivedToken: String,
    longLivedToken: String,
    longLivedTokenExpiresAt: { type: Date, required: false }, // ← opcional
    pages: [PageSchema],
    raw: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.models.MetaAuth || mongoose.model("MetaAuth", MetaAuthSchema);
