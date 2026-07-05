import mongoose, { Schema, Document } from "mongoose";

export interface IEnvConfig extends Document {
  key: string;
  value: string;
  description?: string;
  category: "social" | "ai" | "database" | "email" | "other";
  isEncrypted: boolean;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EnvConfigSchema = new Schema<IEnvConfig>(
  {
    key: { type: String, required: true, unique: true, uppercase: true, trim: true },
    value: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ["social", "ai", "database", "email", "other"],
      default: "other",
    },
    isEncrypted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const EnvConfigModel =
  mongoose.models.EnvConfig || mongoose.model<IEnvConfig>("EnvConfig", EnvConfigSchema);
