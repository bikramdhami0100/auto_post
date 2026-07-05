import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SmtpConfigModel } from "@/models/SmtpConfig";
import { withAuth } from "@/lib/api-utils";

export const GET = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const query: Record<string, unknown> = { _id: params.id };
  if (auth.role !== "admin") query.createdBy = auth.userId;
  const config = await SmtpConfigModel.findOne(query);
  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: config });
});

export const PUT = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const body = await req.json();
  const query: Record<string, unknown> = { _id: params.id };
  if (auth.role !== "admin") query.createdBy = auth.userId;
  const config = await SmtpConfigModel.findOneAndUpdate(query, { $set: body }, { new: true });
  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: config });
}, { adminOnly: true });

export const DELETE = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const query: Record<string, unknown> = { _id: params.id };
  if (auth.role !== "admin") query.createdBy = auth.userId;
  const config = await SmtpConfigModel.findOneAndDelete(query);
  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}, { adminOnly: true });
