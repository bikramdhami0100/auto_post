import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContentLogModel } from "@/models/ContentLog";
import { getTodayDateString } from "@/lib/scheduler";
import { getAuthFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = getAuthFromRequest(request);
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const date = getTodayDateString();
    await ContentLogModel.deleteMany({ date });
    return NextResponse.json({ status: "ok", message: `Deleted all posts for ${date}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
