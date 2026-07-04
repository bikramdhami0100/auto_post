import { NextResponse } from "next/server";
import { postToFacebook } from "@/lib/facebook";
import { generateImage } from "@/lib/image-generator";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const img = await generateImage("परीक्षण पोस्ट", "परीक्षण", "— परीक्षण");

    const id = await postToFacebook(
      "AutoPost Nepal test - " + new Date().toISOString(),
      [img]
    );

    return NextResponse.json({ success: true, facebook_post_id: id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
