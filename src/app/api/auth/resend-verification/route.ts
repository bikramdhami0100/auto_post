import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { EmailVerificationModel } from "@/models/EmailVerification";
import { sendVerificationEmail } from "@/lib/email";
import { getAuthFromRequest } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthFromRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await UserModel.findById(auth.userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.emailVerified) return NextResponse.json({ error: "Email already verified" }, { status: 400 });

    const token = uuidv4();
    await EmailVerificationModel.create({
      email: user.email,
      token,
      type: "verify",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await sendVerificationEmail(user.email, token);

    return NextResponse.json({ message: "Verification email sent" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
