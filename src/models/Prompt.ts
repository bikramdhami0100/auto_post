import mongoose, { Schema, Document } from "mongoose";

export interface IPrompt extends Document {
  name: string;
  category: string;
  subType?: string;
  promptText: string;
  notesType: "realistic" | "creative" | "educational" | "minimalist";
  fontFamily: string;
  fontSize: number;
  pageSize: "1080x1920" | "1080x1080" | "1920x1080" | "720x1280";
  textColor: string;
  backgroundColor: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PromptSchema = new Schema<IPrompt>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    subType: { type: String },
    promptText: { type: String, required: true },
    notesType: {
      type: String,
      enum: ["realistic", "creative", "educational", "minimalist"],
      default: "realistic",
    },
    fontFamily: { type: String, default: "ND" },
    fontSize: { type: Number, default: 48 },
    pageSize: {
      type: String,
      enum: ["1080x1920", "1080x1080", "1920x1080", "720x1280"],
      default: "1080x1920",
    },
    textColor: { type: String, default: "#222222" },
    backgroundColor: { type: String, default: "#FFFBF5" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const PromptModel =
  mongoose.models.Prompt || mongoose.model<IPrompt>("Prompt", PromptSchema);
