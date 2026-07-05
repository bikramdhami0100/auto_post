import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContentLogModel } from "@/models/ContentLog";
import { getTodayDateString } from "@/lib/scheduler";
import { getAuthFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const date = getTodayDateString();
    const logs = await ContentLogModel.find({ date }).sort({ slot: 1 }).lean();
    return NextResponse.json({ date, logs });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
