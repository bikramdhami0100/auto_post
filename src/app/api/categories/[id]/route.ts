import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import { withAuth } from "@/lib/api-utils";

export const GET = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const query: Record<string, unknown> = { _id: params.id };
  if (auth.role !== "admin") query.createdBy = auth.userId;
  const category = await CategoryModel.findOne(query);
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: category });
});

export const PUT = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const body = await req.json();
  const query: Record<string, unknown> = { _id: params.id };
  if (auth.role !== "admin") query.createdBy = auth.userId;
  const category = await CategoryModel.findOneAndUpdate(query, { $set: body }, { new: true });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: category });
});

export const DELETE = withAuth(async (req, { auth, params }) => {
  await connectDB();
  const query: Record<string, unknown> = { _id: params.id };
  if (auth.role !== "admin") query.createdBy = auth.userId;
  const category = await CategoryModel.findOneAndDelete(query);
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
});
