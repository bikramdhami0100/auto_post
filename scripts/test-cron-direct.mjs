// Direct test of cron pipeline without a server
import { generateContent } from "../src/lib/ai.ts";
import { getSlotCategory, getTodaySubType, getTargetLanguage } from "../src/lib/scheduler.ts";

async function main() {
  console.log("=== Direct Cron Test (Dry Run) ===\n");

  const slot = parseInt(process.argv[2] || "0", 10);
  const category = getSlotCategory(slot);
  const subType = getTodaySubType(category);
  const targetLanguage = getTargetLanguage(subType);

  console.log(`Slot: ${slot}`);
  console.log(`Category: ${category}`);
  console.log(`Sub-type: ${subType}`);
  console.log(`Language: ${targetLanguage}`);
  console.log("");

  console.log("Calling DeepSeek AI...");
  const content = await generateContent(category, subType, targetLanguage);
  console.log("✓ AI content generated\n");

  console.log(`Title: ${content.title}`);
  console.log(`Body (first 100 chars): ${content.content_body.substring(0, 100)}...`);
  console.log(`Hashtags: ${(content.hashtags || []).join(" ")}`);
  if (content.word_list?.length) {
    console.log(`Word list: ${content.word_list.length} items`);
    console.log(`  First: ${content.word_list[0].nepali} → ${content.word_list[0].target}`);
  }
  console.log("");

  console.log("Generating image...");
  const { generateImage } = await import("../src/lib/image-generator.ts");
  const imageBuffer = await generateImage(content.content_body, content.title);
  console.log(`✓ Image generated: ${(imageBuffer.length / 1024).toFixed(1)} KB`);
  console.log("");

  console.log("=== TEST PASSED ===");
  console.log("Full pipeline works: AI → content → image");
  process.exit(0);
}

main().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
