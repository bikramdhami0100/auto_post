import type { ContentCategory, SubType } from "@/lib/types";

const ALL_CATEGORIES: ContentCategory[] = [
  "motivation",
  "enlightenment",
  "language",
  "general_knowledge",
  "health_fitness",
  "nepali_culture",
  "coding_tech",
];

const MOTIVATION_SUB_TYPES = [
  "book_quote",
  "economic_mindset",
  "rich_mindset",
  "business_speech",
] as const;

const GK_SUB_TYPES = ["science", "history", "geography", "technology"] as const;
const HEALTH_SUB_TYPES = ["nutrition", "exercise", "mental_health", "wellness"] as const;
const CULTURE_SUB_TYPES = ["festival", "tradition", "history", "personality"] as const;
const TECH_SUB_TYPES = ["programming", "digital_skills", "tech_facts", "tools"] as const;

function getNepalDate(): Date {
  const now = new Date();
  now.setHours(now.getHours() + 5.75);
  return now;
}

function getDateSeed(): number {
  const d = getNepalDate();
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getSlotCategory(slotIndex: number): ContentCategory {
  const seed = getDateSeed();
  const weekOffset = Math.floor(seed / 7);
  return ALL_CATEGORIES[(weekOffset + slotIndex) % ALL_CATEGORIES.length];
}

export function getTodaySubType(category: ContentCategory): SubType {
  const seed = getDateSeed();

  if (category === "enlightenment") return "philosophical_thought";
  if (category === "language") return "nepali_to_english";

  const arr =
    category === "motivation"
      ? MOTIVATION_SUB_TYPES
      : category === "general_knowledge"
        ? GK_SUB_TYPES
        : category === "health_fitness"
          ? HEALTH_SUB_TYPES
          : category === "nepali_culture"
            ? CULTURE_SUB_TYPES
            : category === "coding_tech"
              ? TECH_SUB_TYPES
              : MOTIVATION_SUB_TYPES;

  const idx = Math.floor(seededRandom(seed) * arr.length);
  return arr[idx];
}

export function getTargetLanguage(_subType: SubType): string {
  return "english";
}

export function getTodayDateString(): string {
  return getNepalDate().toISOString().split("T")[0];
}
