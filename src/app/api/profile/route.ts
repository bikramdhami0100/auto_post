import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { withAuth } from "@/lib/api-utils";
import { hashPassword, comparePassword } from "@/lib/auth";

export const GET = withAuth(async (req, { auth }) => {
  await connectDB();
  const user = await UserModel.findById(auth.userId).select("-password");
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: user });
});

export const PUT = withAuth(async (req, { auth }) => {
  await connectDB();
  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (body.name) update.name = body.name;
  if (body.avatar) update.avatar = body.avatar;
  if (body.currentPassword && body.newPassword) {
    const user = await UserModel.findById(auth.userId);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const valid = await comparePassword(body.currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    update.password = await hashPassword(body.newPassword);
  }

  const user = await UserModel.findByIdAndUpdate(auth.userId, { $set: update }, { new: true }).select("-password");
  return NextResponse.json({ data: user });
});
