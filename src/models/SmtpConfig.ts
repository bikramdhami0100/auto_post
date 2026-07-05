import mongoose, { Schema, Document } from "mongoose";

export interface ISmtpConfig extends Document {
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SmtpConfigSchema = new Schema<ISmtpConfig>(
  {
    name: { type: String, required: true, trim: true },
    host: { type: String, required: true, trim: true },
    port: { type: Number, required: true, default: 587 },
    secure: { type: Boolean, default: false },
    username: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    fromEmail: { type: String, required: true, trim: true },
    fromName: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const SmtpConfigModel =
  mongoose.models.SmtpConfig ||
  mongoose.model<ISmtpConfig>("SmtpConfig", SmtpConfigSchema);
