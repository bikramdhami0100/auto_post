import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FacebookPostModel } from "@/models/FacebookPost";
import { FacebookConfigModel } from "@/models/FacebookConfig";
import { withAuth } from "@/lib/api-utils";

export const GET = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const post = await FacebookPostModel.findOne({ _id: params.id, createdBy: auth.userId }).populate("facebookConfigId", "name pageId");
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: post });
});

export const PUT = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const body = await req.json();
  const post = await FacebookPostModel.findOneAndUpdate(
    { _id: params.id, createdBy: auth.userId },
    { $set: body },
    { new: true }
  );
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: post });
});

export const DELETE = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const post = await FacebookPostModel.findOneAndDelete({ _id: params.id, createdBy: auth.userId });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
});
