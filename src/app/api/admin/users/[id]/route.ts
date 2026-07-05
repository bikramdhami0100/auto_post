import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { withAuth } from "@/lib/api-utils";

export const GET = withAuth(async (req, { params }) => {
  await connectDB();
  const user = await UserModel.findById(params.id).select("-password");
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: user });
}, { adminOnly: true });

export const PUT = withAuth(async (req, { params }) => {
  await connectDB();
  const body = await req.json();
  const user = await UserModel.findByIdAndUpdate(params.id, { $set: body }, { new: true }).select("-password");
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: user });
}, { adminOnly: true });

export const DELETE = withAuth(async (req, { params }) => {
  await connectDB();
  const user = await UserModel.findByIdAndDelete(params.id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}, { adminOnly: true });
