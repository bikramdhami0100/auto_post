import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const pid = "122104553025378042";
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "no token" });

  const res = await fetch(
    `https://graph.facebook.com/v25.0/${pid}?fields=id,story,permalink_url,attachments{media_type,title,description,url,subattachments}&access_token=${token}`
  );
  const data = await res.json();
  return NextResponse.json(data);
}
