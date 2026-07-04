import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContentLogModel } from "@/models/ContentLog";
import {
  getSlotCategory,
  getTodaySubType,
  getTargetLanguage,
  getTodayDateString,
} from "@/lib/scheduler";
import { generateContent } from "@/lib/ai";
import { generateCarouselImages, generateImage } from "@/lib/image-generator";
import { postToFacebook } from "@/lib/facebook";
import { postToTikTok } from "@/lib/tiktok";
import { downloadGoogleFonts } from "@/lib/fonts";
import type { AIContent, PostResult } from "@/lib/types";

// Preload fonts at server start
downloadGoogleFonts().catch((err) => console.error("Font preload failed:", err));

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const auth = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");

  return auth === `Bearer ${secret}` || querySecret === secret;
}

async function processPost(
  date: string,
  slotIndex: number,
  category: ReturnType<typeof getSlotCategory>
): Promise<{
  title: string;
  content_body: string;
  hashtags: string[];
  word_list: AIContent["word_list"];
  facebook: PostResult["facebook"];
  tiktok: PostResult["tiktok"];
}> {
  const subType = getTodaySubType(category);
  const targetLanguage = getTargetLanguage(subType);

  const content: AIContent = await generateContent(category, subType, targetLanguage);

  const caption = `${content.title}\n\n${content.content_body}\n\n${(content.hashtags || []).join(" ")}`;

  let imageBuffers: Buffer[];

  if (category === "language" && content.word_list?.length) {
    const slides = content.word_list.map((w) => ({
      text: `${w.nepali}\n${w.target}`,
      title: w.example,
    }));
    imageBuffers = await generateCarouselImages(slides);
  } else {
    imageBuffers = [await generateImage(content.content_body, content.title)];
  }

  const result = {
    facebook: { success: false } as PostResult["facebook"],
    tiktok: { success: false } as PostResult["tiktok"],
  };

  if (process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
    if (slotIndex === 0) {
      try {
        const fbId = await postToFacebook(caption, imageBuffers);
        result.facebook = { success: true, post_id: fbId };
      } catch (err: unknown) {
        result.facebook = { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }
  }

  if (process.env.TIKTOK_ACCESS_TOKEN) {
    try {
      const ttId = await postToTikTok(imageBuffers, caption);
      result.tiktok = { success: true, post_id: ttId };
    } catch (err: unknown) {
      result.tiktok = { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  await ContentLogModel.create({
    date,
    slot: slotIndex,
    category,
    sub_type: subType,
    title: content.title,
    content_body: content.content_body,
    word_list: content.word_list || [],
    hashtags: content.hashtags || [],
    facebook_post_id: result.facebook.post_id || null,
    tiktok_post_id: result.tiktok.post_id || null,
    posted: true,
  });

  return {
    title: content.title,
    content_body: content.content_body,
    hashtags: content.hashtags || [],
    word_list: content.word_list,
    facebook: result.facebook,
    tiktok: result.tiktok,
  };
}

async function processPostDryRun(
  slotIndex: number,
  category: ReturnType<typeof getSlotCategory>
) {
  const subType = getTodaySubType(category);
  const targetLanguage = getTargetLanguage(subType);

  const content: AIContent = await generateContent(category, subType, targetLanguage);

  const caption = `${content.title}\n\n${content.content_body}\n\n${(content.hashtags || []).join(" ")}`;

  let imageBuffers: Buffer[];

  if (category === "language" && content.word_list?.length) {
    const slides = content.word_list.map((w) => ({
      text: `${w.nepali}\n${w.target}`,
      title: w.example,
    }));
    imageBuffers = await generateCarouselImages(slides);
  } else {
    imageBuffers = [await generateImage(content.content_body, content.title)];
  }

  return {
    slot: slotIndex,
    category,
    sub_type: subType,
    title: content.title,
    content_body: content.content_body,
    caption,
    hashtags: content.hashtags || [],
    word_list: content.word_list || [],
    image_prompt: content.image_prompt,
    image_count: imageBuffers.length,
    preview_image_base64: `data:image/png;base64,${imageBuffers[0].toString("base64")}`,
  };
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dryrun") === "true";

  try {
    if (dryRun) {
      const slot = parseInt(request.nextUrl.searchParams.get("slot") || "0", 10);
      const category = getSlotCategory(slot);
      const post = await processPostDryRun(slot, category);

      return NextResponse.json({
        status: "dryrun",
        message: "Content generated but NOT posted to any platform",
        date: getTodayDateString(),
        post,
      });
    }

    await connectDB();
    const date = getTodayDateString();
    const postsPerDay = Math.min(3, Math.max(1, parseInt(process.env.POSTS_PER_DAY || "3", 10) || 3));
    const slot = parseInt(request.nextUrl.searchParams.get("slot") || "-1", 10);

    const results = [];

    if (slot >= 0) {
      const existing = await ContentLogModel.findOne({ date, slot, posted: true });
      if (existing) {
        return NextResponse.json({ status: "skipped", message: `Slot ${slot} already posted today`, date, slot });
      }

      const category = getSlotCategory(slot);
      const post = await processPost(date, slot, category);
      results.push({ slot, category, ...post });
    } else {
      for (let i = 0; i < postsPerDay; i++) {
        const existing = await ContentLogModel.findOne({ date, slot: i, posted: true });
        if (existing) {
          results.push({ slot: i, status: "skipped", message: "Already posted" });
          continue;
        }

        const category = getSlotCategory(i);
        const post = await processPost(date, i, category);
        results.push({ slot: i, category, ...post });
      }
    }

    return NextResponse.json({ status: "success", date, posts: results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Cron job failed:", message);
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}
