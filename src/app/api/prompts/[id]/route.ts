import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PromptModel } from "@/models/Prompt";
import { withAuth } from "@/lib/api-utils";

export const GET = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const prompt = await PromptModel.findOne({ _id: params.id, createdBy: auth.userId });
  if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: prompt });
});

export const PUT = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const body = await req.json();
  const prompt = await PromptModel.findOneAndUpdate(
    { _id: params.id, createdBy: auth.userId },
    { $set: body },
    { new: true }
  );
  if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: prompt });
});

export const DELETE = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const prompt = await PromptModel.findOneAndDelete({ _id: params.id, createdBy: auth.userId });
  if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
});
