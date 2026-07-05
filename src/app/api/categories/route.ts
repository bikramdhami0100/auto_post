import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import { withAuth, buildQuery, buildSortObj, paginatedResponse } from "@/lib/api-utils";
import * as XLSX from "xlsx";

export const GET = withAuth(async (req, { auth }) => {
  await connectDB();
  const { page, limit, search, sort, filter } = buildQuery(req.nextUrl.searchParams, "-createdAt");
  const query: Record<string, unknown> = { createdBy: auth.userId };

  if (auth.role === "admin" && req.nextUrl.searchParams.get("all") === "true") {
    delete query.createdBy;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (filter.isActive) query.isActive = filter.isActive === "true";

  const sortObj = buildSortObj(sort);
  const [data, total] = await Promise.all([
    CategoryModel.find(query).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
    CategoryModel.countDocuments(query),
  ]);

  if (req.nextUrl.searchParams.get("export") === "excel") {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.map(({ _id, createdBy, ...d }) => ({ ...d, _id: _id.toString() })));
    XLSX.utils.book_append_sheet(wb, ws, "Categories");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": "attachment; filename=categories.xlsx" },
    });
  }

  return NextResponse.json(paginatedResponse(data, total, page, limit));
});

export const POST = withAuth(async (req, { auth }) => {
  await connectDB();
  const body = await req.json();
  body.slug = body.slug || body.name.toLowerCase().replace(/\s+/g, "_");
  const category = await CategoryModel.create({ ...body, createdBy: auth.userId });
  return NextResponse.json({ data: category }, { status: 201 });
});
