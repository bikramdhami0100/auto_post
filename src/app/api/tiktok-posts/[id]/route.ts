import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TikTokPostModel } from "@/models/TikTokPost";
import { withAuth } from "@/lib/api-utils";

export const GET = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const post = await TikTokPostModel.findOne({ _id: params.id, createdBy: auth.userId }).populate("tikTokConfigId", "name");
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: post });
});

export const PUT = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const body = await req.json();
  const post = await TikTokPostModel.findOneAndUpdate(
    { _id: params.id, createdBy: auth.userId },
    { $set: body },
    { new: true }
  );
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: post });
});

export const DELETE = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const post = await TikTokPostModel.findOneAndDelete({ _id: params.id, createdBy: auth.userId });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
});
