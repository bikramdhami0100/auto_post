import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContentLogModel } from "@/models/ContentLog";
import { getTodayDateString } from "@/lib/scheduler";

export const dynamic = "force-dynamic";

export async function GET() {
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
