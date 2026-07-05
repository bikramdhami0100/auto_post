import type { AIContent, ContentCategory, SubType } from "@/lib/types";

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";

function buildPrompt(category: ContentCategory, subType: SubType, targetLanguage?: string): string {
  const base = `You are an expert social media content creator and polyglot educator.
Your task is to generate daily content for a fully automated posting system.
You must ALWAYS respond with a valid JSON object. Do not add markdown formatting,
code blocks, or extra commentary. ONLY raw JSON.

The JSON must contain the following keys:
- "category": The exact category provided.
- "sub_type": The specific sub-type.
- "title": A catchy, engaging title (max 10 words).
- "content_body": The main text.
- "hashtags": An array of 5-10 relevant hashtags.
- "word_list": ONLY used for Language category. Array of objects: [{ "nepali": "...", "target": "...", "example": "..." }].
- "image_prompt": A detailed description of what background image to generate.`;

  switch (category) {
    case "motivation":
      return `${base}

Category: "motivation"
Sub-type: "${subType}"

Write the "title" and "content_body" in Nepali language (नेपालीमा).
The "hashtags" and "image_prompt" must be in English.
Generate a powerful, short motivational speech or quote (2-4 sentences) taken from
a famous book, economic principle, or business leader. Make it actionable and
inspiring for entrepreneurs. Include the author's name and the book's name if applicable.
The title should be in Nepali. The content_body must be entirely in Nepali.
Output JSON.`;

    case "enlightenment":
      return `${base}

Category: "enlightenment"
Sub-type: "${subType}"

Write the "title" and "content_body" in Nepali language (नेपालीमा).
The "hashtags" and "image_prompt" must be in English.
Generate a deep, philosophical thought about mindfulness, inner peace, or self-awareness.
Keep it concise (2-3 sentences) but profound. Make it relatable to modern daily life.
The title should be in Nepali. The content_body must be entirely in Nepali.
Output JSON.`;

    case "language":
      return `${base}

Category: "language"
Target_language: "${targetLanguage}"
Level: "basic_to_advanced"

Write the "title" and "content_body" in Nepali language (नेपालीमा).
The "hashtags" and "image_prompt" must be in English.

The "word_list" must contain:
- Nepali words in Devanagari script (actual Unicode characters).
- Translations in ROMANIZED/Latin script form (NOT native script).
- Example sentences in ROMANIZED/Latin script form (NOT native script).

Generate exactly 10 Nepali words/phrases with their translations and example sentences.
The list must progress from Basic (words 1-3) to Intermediate (4-7) to Advanced (8-10).
For each word, provide:
- "nepali": The Nepali word in Devanagari script.
- "target": The translation in ROMANIZED ${targetLanguage} (e.g., for Japanese use romaji like "konnichiwa", for Korean use romanization like "annyeonghaseyo"). DO NOT use native script characters.
- "example": A simple example sentence in ROMANIZED ${targetLanguage}. DO NOT use native script.

IMPORTANT: The "target" and "example" fields must use ONLY Latin (A-Z a-z) characters along with common punctuation. No native script characters.

Output JSON.`;

    default:
      return base;
  }
}

export async function generateContent(
  category: ContentCategory,
  subType: SubType,
  targetLanguage?: string
): Promise<AIContent> {
  const prompt = buildPrompt(category, subType, targetLanguage);

  const res = await fetch(DEEPSEEK_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;

  if (!raw) {
    throw new Error("DeepSeek returned empty content");
  }

  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*$/g, "")
    .trim();

  const parsed: AIContent = JSON.parse(cleaned);
  parsed.category = category;
  parsed.sub_type = subType;

  return parsed;
}
