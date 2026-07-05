import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SmtpConfigModel } from "@/models/SmtpConfig";
import { withAuth } from "@/lib/api-utils";

export const GET = withAuth(async (_req, { params, auth }) => {
  await connectDB();
  const config = await SmtpConfigModel.findById(params.id).lean();
  if (!config) return NextResponse.json({ error: "SMTP config not found" }, { status: 404 });
  if (auth.role !== "admin" && config.createdBy?.toString() !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ data: config });
}, { adminOnly: true });

export const PUT = withAuth(async (req, { params }) => {
  await connectDB();
  const body = await req.json();
  if (!body.password) delete body.password;
  const config = await SmtpConfigModel.findByIdAndUpdate(params.id, body, { new: true }).lean();
  if (!config) return NextResponse.json({ error: "SMTP config not found" }, { status: 404 });
  return NextResponse.json({ data: config });
}, { adminOnly: true });

export const DELETE = withAuth(async (_req, { params }) => {
  await connectDB();
  const config = await SmtpConfigModel.findByIdAndDelete(params.id);
  if (!config) return NextResponse.json({ error: "SMTP config not found" }, { status: 404 });
  return NextResponse.json({ message: "SMTP config deleted" });
}, { adminOnly: true });
