import mongoose, { Schema, Document } from "mongoose";

export interface IFacebookConfig extends Document {
  name: string;
  pageId: string;
  pageAccessToken: string;
  appId?: string;
  appSecret?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FacebookConfigSchema = new Schema<IFacebookConfig>(
  {
    name: { type: String, required: true, trim: true },
    pageId: { type: String, required: true },
    pageAccessToken: { type: String, required: true },
    appId: { type: String },
    appSecret: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const FacebookConfigModel =
  mongoose.models.FacebookConfig ||
  mongoose.model<IFacebookConfig>("FacebookConfig", FacebookConfigSchema);
