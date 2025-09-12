import mongoose from "mongoose";

const PageSchema = new mongoose.Schema({
  pageId: String,
  name: String,
  accessToken: String,
  igBusinessId: String, // instagram_business_account.id si existe
}, { _id: false });

const MetaAuthSchema = new mongoose.Schema({
  metaUserId: { type: String, index: true },
  shortLivedToken: String,
  longLivedToken: String,
  longLivedTokenExpiresAt: Date,
  pages: [PageSchema],
  raw: Object,
}, { timestamps: true });

export default mongoose.models.MetaAuth || mongoose.model("MetaAuth", MetaAuthSchema);
