import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SettingModel } from "@/models/Setting";
import { withAuth } from "@/lib/api-utils";

export const GET = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const query: Record<string, unknown> = { _id: params.id };
  if (auth.role !== "admin") query.createdBy = auth.userId;
  const setting = await SettingModel.findOne(query);
  if (!setting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: setting });
});

export const PUT = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const body = await req.json();
  const query: Record<string, unknown> = { _id: params.id };
  if (auth.role !== "admin") query.createdBy = auth.userId;
  const setting = await SettingModel.findOneAndUpdate(query, { $set: body }, { new: true });
  if (!setting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: setting });
});

export const DELETE = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const query: Record<string, unknown> = { _id: params.id };
  if (auth.role !== "admin") query.createdBy = auth.userId;
  const setting = await SettingModel.findOneAndDelete(query);
  if (!setting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
});
