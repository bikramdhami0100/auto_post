import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  console.log("TikTok OAuth callback:", { code: code?.slice(0, 20), state, error });

  return NextResponse.json({
    status: "ok",
    message: "TikTok OAuth callback received. You can close this window.",
    code_received: !!code,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  console.log("TikTok OAuth POST callback:", body);

  return NextResponse.json({ status: "ok" });
}
