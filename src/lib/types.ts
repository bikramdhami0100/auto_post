export type ContentCategory =
  | "motivation"
  | "enlightenment"
  | "language"
  | "general_knowledge"
  | "health_fitness"
  | "nepali_culture"
  | "coding_tech";

export type MotivationSubType =
  | "book_quote"
  | "economic_mindset"
  | "rich_mindset"
  | "business_speech";

export type EnlightenmentSubType = "philosophical_thought";

export type LanguageSubType = "nepali_to_english";

export type GeneralKnowledgeSubType = "science" | "history" | "geography" | "technology";
export type HealthFitnessSubType = "nutrition" | "exercise" | "mental_health" | "wellness";
export type NepaliCultureSubType = "festival" | "tradition" | "history" | "personality";
export type CodingTechSubType = "programming" | "digital_skills" | "tech_facts" | "tools";

export type SubType =
  | MotivationSubType
  | EnlightenmentSubType
  | LanguageSubType
  | GeneralKnowledgeSubType
  | HealthFitnessSubType
  | NepaliCultureSubType
  | CodingTechSubType;

export interface WordEntry {
  nepali: string;
  target: string;
  pronunciation: string;
  example: string;
}

export interface AIContent {
  category: ContentCategory;
  sub_type: SubType;
  title: string;
  content_body: string;
  hashtags: string[];
  word_list?: WordEntry[];
  image_prompt: string;
}

export interface ContentLog {
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

export interface PostResult {
  facebook: { success: boolean; post_id?: string; error?: string };
  tiktok: { success: boolean; post_id?: string; error?: string };
}
