import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { EmailVerificationModel } from "@/models/EmailVerification";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const verification = await EmailVerificationModel.findOne({ token, type: "verify" });
    if (!verification) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    if (verification.expiresAt < new Date()) {
      await EmailVerificationModel.deleteOne({ _id: verification._id });
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    await UserModel.updateOne({ email: verification.email }, { emailVerified: true, verificationToken: null });
    await EmailVerificationModel.deleteOne({ _id: verification._id });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
