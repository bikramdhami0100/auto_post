import mongoose, { Schema, Document } from "mongoose";

export interface IFacebookPost extends Document {
  facebookConfigId: mongoose.Types.ObjectId;
  content: string;
  imageUrl?: string;
  facebookPostId?: string;
  permalinkUrl?: string;
  status: "draft" | "scheduled" | "posted" | "failed";
  scheduledAt?: Date;
  postedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FacebookPostSchema = new Schema<IFacebookPost>(
  {
    facebookConfigId: { type: Schema.Types.ObjectId, ref: "FacebookConfig", required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    facebookPostId: { type: String },
    permalinkUrl: { type: String },
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

export const FacebookPostModel =
  mongoose.models.FacebookPost ||
  mongoose.model<IFacebookPost>("FacebookPost", FacebookPostSchema);
