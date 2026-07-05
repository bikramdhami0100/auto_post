import { getSlotCategory, getTodaySubType, getTargetLanguage, getTodayDateString } from "../src/lib/scheduler";
import { generateContent } from "../src/lib/ai";
import { generateImage } from "../src/lib/image-generator";

async function main() {
  console.log("=== Full Pipeline Test ===\n");

  const slot = parseInt(process.argv[2] || "0", 10);
  const category = getSlotCategory(slot);
  const subType = getTodaySubType(category);
  const targetLanguage = getTargetLanguage(subType);

  console.log(`Slot: ${slot}`);
  console.log(`Category: ${category}`);
  console.log(`Sub-type: ${subType}`);
  console.log(`Language: ${targetLanguage}`);
  console.log(`Date: ${getTodayDateString()}`);
  console.log("");

  console.log("1. Generating AI content...");
  const content = await generateContent(category, subType, targetLanguage);
  console.log(`   ✓ Title: ${content.title}`);
  console.log(`   ✓ Body (${content.content_body.length} chars)`);
  console.log(`   ✓ Hashtags: ${(content.hashtags || []).join(" ")}`);
  if (content.word_list?.length) {
    console.log(`   ✓ Word list: ${content.word_list.length} items`);
    console.log(`     First: ${content.word_list[0].nepali} → ${content.word_list[0].target}`);
  }
  console.log("");

  console.log("2. Generating image...");
  const imageBuffer = await generateImage(content.content_body, content.title);
  console.log(`   ✓ Image: ${(imageBuffer.length / 1024).toFixed(1)} KB`);

  console.log("");
  console.log("=== ALL TESTS PASSED ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
