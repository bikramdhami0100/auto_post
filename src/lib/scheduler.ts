import type { ContentCategory, MotivationSubType, SubType, LanguageSubType } from "@/lib/types";

const CATEGORY_CYCLE: ContentCategory[] = [
  "motivation",
  "enlightenment",
  "language",
  "motivation",
  "enlightenment",
  "language",
  "motivation",
];

const MOTIVATION_SUB_TYPES: MotivationSubType[] = [
  "book_quote",
  "economic_mindset",
  "rich_mindset",
  "business_speech",
];

const LANGUAGE_TARGETS: LanguageSubType[] = [
  "nepali_to_english",
  "nepali_to_japanese",
  "nepali_to_korean",
];

function getDayOffset(): number {
  const now = new Date();
  now.setHours(now.getHours() + 5.75);
  const day = now.getUTCDay();
  return day;
}

export function getTodayCategory(): ContentCategory {
  const offset = getDayOffset();
  return CATEGORY_CYCLE[offset];
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDateSeed(): number {
  const now = new Date();
  now.setHours(now.getHours() + 5.75);
  return now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
}

export function getTodaySubType(category: ContentCategory): SubType {
  const seed = getDateSeed();

  if (category === "enlightenment") return "philosophical_thought";

  if (category === "motivation") {
    const idx = Math.floor(seededRandom(seed) * MOTIVATION_SUB_TYPES.length);
    return MOTIVATION_SUB_TYPES[idx];
  }

  if (category === "language") {
    const weekIdx = Math.floor(seed / 7) % LANGUAGE_TARGETS.length;
    return LANGUAGE_TARGETS[weekIdx];
  }

  return "book_quote";
}

export function getTargetLanguage(subType: SubType): string {
  switch (subType) {
    case "nepali_to_english":
      return "english";
    case "nepali_to_japanese":
      return "japanese";
    case "nepali_to_korean":
      return "korean";
    default:
      return "english";
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  now.setHours(now.getHours() + 5.75);
  return now.toISOString().split("T")[0];
}
