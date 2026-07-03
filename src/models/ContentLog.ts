import mongoose, { Schema, Document } from "mongoose";
import type { ContentCategory, SubType, WordEntry } from "@/lib/types";

export interface IContentLog extends Document {
  date: string;
  category: ContentCategory;
  sub_type: SubType;
  title: string;
  content_body: string;
  word_list?: WordEntry[];
  hashtags: string[];
  facebook_post_id: string | null;
  tiktok_post_id: string | null;
  posted: boolean;
  created_at: Date;
}

const ContentLogSchema = new Schema<IContentLog>({
  date: { type: String, required: true, index: true },
  category: { type: String, required: true },
  sub_type: { type: String, required: true },
  title: { type: String, required: true },
  content_body: { type: String, required: true },
  word_list: [
    {
      nepali: { type: String },
      target: { type: String },
      example: { type: String },
    },
  ],
  hashtags: [{ type: String }],
  facebook_post_id: { type: String, default: null },
  tiktok_post_id: { type: String, default: null },
  posted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now, index: { expires: "30d" } },
});

export const ContentLogModel =
  mongoose.models.ContentLog ||
  mongoose.model<IContentLog>("ContentLog", ContentLogSchema);
