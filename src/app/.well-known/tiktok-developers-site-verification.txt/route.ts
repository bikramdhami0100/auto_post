import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(
    "tiktok-developers-site-verification=jZPvNIQ6DOgf1vc4qwSKTYIzOD2FdQzS",
    {
      headers: { "Content-Type": "text/plain" },
    }
  );
}
