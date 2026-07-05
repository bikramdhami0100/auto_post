import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FacebookConfigModel } from "@/models/FacebookConfig";
import { withAuth } from "@/lib/api-utils";

export const GET = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const config = await FacebookConfigModel.findOne({ _id: params.id, createdBy: auth.userId });
  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: config });
});

export const PUT = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const body = await req.json();
  const config = await FacebookConfigModel.findOneAndUpdate(
    { _id: params.id, createdBy: auth.userId },
    { $set: body },
    { new: true }
  );
  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: config });
});

export const DELETE = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const config = await FacebookConfigModel.findOneAndDelete({ _id: params.id, createdBy: auth.userId });
  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
});
