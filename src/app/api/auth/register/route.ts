import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { EmailVerificationModel } from "@/models/EmailVerification";
import { hashPassword, signToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = uuidv4();

    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      verificationToken,
    });

    await EmailVerificationModel.create({
      email: user.email,
      token: verificationToken,
      type: "verify",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch {
      // Email sending is best-effort
    }

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });

    const response = NextResponse.json({
      message: "Account created. Please verify your email.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    }, { status: 201 });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
