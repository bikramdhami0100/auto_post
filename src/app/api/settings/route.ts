import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SettingModel } from "@/models/Setting";
import { withAuth, buildQuery, buildSortObj, paginatedResponse } from "@/lib/api-utils";
import * as XLSX from "xlsx";

export const GET = withAuth(async (req, { auth }) => {
  await connectDB();
  const { page, limit, search, sort, filter } = buildQuery(req.nextUrl.searchParams, "-createdAt");
  const query: Record<string, unknown> = {};

  if (auth.role !== "admin") query.createdBy = auth.userId;
  if (req.nextUrl.searchParams.get("group")) query.group = req.nextUrl.searchParams.get("group");

  if (search) {
    query.$or = [
      { key: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (filter.group) query.group = filter.group;

  const sortObj = buildSortObj(sort);
  const [data, total] = await Promise.all([
    SettingModel.find(query).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
    SettingModel.countDocuments(query),
  ]);

  if (req.nextUrl.searchParams.get("export") === "excel") {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.map(({ _id, createdBy, ...d }) => ({ ...d, _id: _id.toString() })));
    XLSX.utils.book_append_sheet(wb, ws, "Settings");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": "attachment; filename=settings.xlsx" },
    });
  }

  return NextResponse.json(paginatedResponse(data, total, page, limit));
});

export const POST = withAuth(async (req, { auth }) => {
  await connectDB();
  const body = await req.json();
  const setting = await SettingModel.create({ ...body, createdBy: auth.userId });
  return NextResponse.json({ data: setting }, { status: 201 });
});
