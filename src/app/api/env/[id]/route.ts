import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { EnvConfigModel } from "@/models/EnvConfig";
import { withAuth } from "@/lib/api-utils";

export const GET = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const config = await EnvConfigModel.findOne({ _id: params.id, createdBy: auth.userId });
  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: config });
});

export const PUT = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const body = await req.json();
  const config = await EnvConfigModel.findOneAndUpdate(
    { _id: params.id, createdBy: auth.userId },
    { $set: body },
    { new: true }
  );
  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: config });
});

export const DELETE = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const config = await EnvConfigModel.findOneAndDelete({ _id: params.id, createdBy: auth.userId });
  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
});
