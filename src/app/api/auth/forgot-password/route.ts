import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { EmailVerificationModel } from "@/models/EmailVerification";
import { sendPasswordResetEmail } from "@/lib/email";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ message: "If the email exists, a reset link has been sent." });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await EmailVerificationModel.create({ email: user.email, token, type: "reset", expiresAt });

    try {
      await sendPasswordResetEmail(user.email, token);
    } catch {
      // Best-effort
    }

    return NextResponse.json({ message: "If the email exists, a reset link has been sent." });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
