import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;

  if (!file.startsWith("tiktok") && !file.startsWith("tiktok-")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const code = file
    .replace(/^tiktok-?/i, "")
    .replace(/\.txt$/i, "");

  return new NextResponse(
    `tiktok-developers-site-verification=${code}`,
    {
      headers: { "Content-Type": "text/plain" },
    }
  );
}
