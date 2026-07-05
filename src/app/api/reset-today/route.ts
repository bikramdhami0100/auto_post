import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContentLogModel } from "@/models/ContentLog";
import { getTodayDateString } from "@/lib/scheduler";

export const dynamic = "force-dynamic";

export async function POST() {
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
