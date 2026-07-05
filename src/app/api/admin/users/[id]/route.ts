import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { withAuth } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";

export const GET = withAuth(async (_req, { params }) => {
  await connectDB();
  const user = await UserModel.findById(params.id).select("-password").lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ data: user });
}, { adminOnly: true });

export const PUT = withAuth(async (req, { params }) => {
  await connectDB();
  const body = await req.json();
  if (body.password) {
    body.password = await hashPassword(body.password);
  } else {
    delete body.password;
  }
  const user = await UserModel.findByIdAndUpdate(params.id, body, { new: true }).select("-password").lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ data: user });
}, { adminOnly: true });

export const DELETE = withAuth(async (_req, { params }) => {
  await connectDB();
  const user = await UserModel.findByIdAndDelete(params.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ message: "User deleted" });
}, { adminOnly: true });
