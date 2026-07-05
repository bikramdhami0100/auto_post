import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { EmailVerificationModel } from "@/models/EmailVerification";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const verification = await EmailVerificationModel.findOne({ token, type: "reset" });
    if (!verification) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    if (verification.expiresAt < new Date()) {
      await EmailVerificationModel.deleteOne({ _id: verification._id });
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    await UserModel.updateOne({ email: verification.email }, { password: hashedPassword, resetToken: null, resetTokenExpiry: null });
    await EmailVerificationModel.deleteOne({ _id: verification._id });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
