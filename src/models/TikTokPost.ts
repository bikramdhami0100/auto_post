import mongoose, { Schema, Document } from "mongoose";

export interface ITikTokPost extends Document {
  tikTokConfigId: mongoose.Types.ObjectId;
  caption: string;
  videoUrl?: string;
  imageUrls?: string[];
  tikTokPostId?: string;
  status: "draft" | "scheduled" | "posted" | "failed";
  scheduledAt?: Date;
  postedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TikTokPostSchema = new Schema<ITikTokPost>(
  {
    tikTokConfigId: { type: Schema.Types.ObjectId, ref: "TikTokConfig", required: true },
    caption: { type: String, required: true },
    videoUrl: { type: String },
    imageUrls: [{ type: String }],
    tikTokPostId: { type: String },
    status: {
      type: String,
      enum: ["draft", "scheduled", "posted", "failed"],
      default: "draft",
    },
    scheduledAt: { type: Date },
    postedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const TikTokPostModel =
  mongoose.models.TikTokPost ||
  mongoose.model<ITikTokPost>("TikTokPost", TikTokPostSchema);
