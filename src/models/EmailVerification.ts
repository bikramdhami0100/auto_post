import mongoose, { Schema, Document } from "mongoose";

export interface IEmailVerification extends Document {
  email: string;
  token: string;
  type: "verify" | "reset";
  expiresAt: Date;
  createdAt: Date;
}

const EmailVerificationSchema = new Schema<IEmailVerification>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    token: { type: String, required: true },
    type: { type: String, enum: ["verify", "reset"], required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  }
);

EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailVerificationModel =
  mongoose.models.EmailVerification ||
  mongoose.model<IEmailVerification>("EmailVerification", EmailVerificationSchema);
