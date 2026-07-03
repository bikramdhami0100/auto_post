import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContentLogModel } from "@/models/ContentLog";
import { getTodayCategory, getTodaySubType, getTargetLanguage, getTodayDateString } from "@/lib/scheduler";
import { generateContent } from "@/lib/ai";
import { generateCarouselImages, generateImage } from "@/lib/image-generator";
import { postToFacebook } from "@/lib/facebook";
import { postToTikTok } from "@/lib/tiktok";
import type { AIContent, PostResult } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const auth = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");

  return auth === `Bearer ${secret}` || querySecret === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const date = getTodayDateString();
    const existing = await ContentLogModel.findOne({ date, posted: true });

    if (existing) {
      return NextResponse.json({
        status: "skipped",
        message: "Content already posted for today",
        date,
        facebook_post_id: existing.facebook_post_id,
        tiktok_post_id: existing.tiktok_post_id,
      });
    }

    const category = getTodayCategory();
    const subType = getTodaySubType(category);
    const targetLanguage = getTargetLanguage(subType);

    const content: AIContent = await generateContent(category, subType, targetLanguage);

    const caption = `${content.title}\n\n${content.content_body}\n\n${(content.hashtags || []).join(" ")}`;

    let imageBuffers: Buffer[];
    let facebookImage: Buffer;

    if (category === "language" && content.word_list?.length) {
      const slides = content.word_list.map((w) => ({
        text: `${w.nepali}\n${w.target}`,
        title: w.example,
      }));

      imageBuffers = await generateCarouselImages(slides);
      facebookImage = imageBuffers[0];
    } else {
      facebookImage = await generateImage(content.content_body, undefined, content.title);
      imageBuffers = [facebookImage];
    }

    const result: PostResult = {
      facebook: { success: false },
      tiktok: { success: false },
    };

    if (process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
      try {
        const fbId = await postToFacebook(facebookImage, caption);
        result.facebook = { success: true, post_id: fbId };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        result.facebook = { success: false, error: message };
      }
    }

    if (process.env.TIKTOK_ACCESS_TOKEN) {
      try {
        const ttId = await postToTikTok(imageBuffers, caption);
        result.tiktok = { success: true, post_id: ttId };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        result.tiktok = { success: false, error: message };
      }
    }

    const log = await ContentLogModel.create({
      date,
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

    return NextResponse.json({
      status: "success",
      date,
      category,
      sub_type: subType,
      title: content.title,
      content_body: content.content_body,
      hashtags: content.hashtags,
      word_count: content.word_list?.length || 0,
      platforms: result,
      log_id: log._id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Cron job failed:", message);

    return NextResponse.json(
      {
        status: "error",
        error: message,
      },
      { status: 500 }
    );
  }
}
