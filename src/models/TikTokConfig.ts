import mongoose, { Schema, Document } from "mongoose";

export interface ITikTokConfig extends Document {
  name: string;
  accessToken: string;
  openId?: string;
  appId?: string;
  appSecret?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TikTokConfigSchema = new Schema<ITikTokConfig>(
  {
    name: { type: String, required: true, trim: true },
    accessToken: { type: String, required: true },
    openId: { type: String },
    appId: { type: String },
    appSecret: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const TikTokConfigModel =
  mongoose.models.TikTokConfig ||
  mongoose.model<ITikTokConfig>("TikTokConfig", TikTokConfigSchema);
