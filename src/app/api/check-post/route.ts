import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (!token || !pageId) return NextResponse.json({ error: "missing creds" });

  // get recent posts from page feed
  const res = await fetch(
    `https://graph.facebook.com/v25.0/${pageId}/feed?fields=id,message,attachments,permalink_url,created_time&limit=5&access_token=${token}`
  );
  const data = await res.json();
  return NextResponse.json(data);
}
