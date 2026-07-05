import mongoose, { Schema, Document } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "json";
  description?: string;
  group: "general" | "scheduler" | "email" | "appearance" | "social";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: String, required: true },
    type: {
      type: String,
      enum: ["string", "number", "boolean", "json"],
      default: "string",
    },
    description: { type: String },
    group: {
      type: String,
      enum: ["general", "scheduler", "email", "appearance", "social"],
      default: "general",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const SettingModel =
  mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);
