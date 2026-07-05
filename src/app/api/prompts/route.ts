import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PromptModel } from "@/models/Prompt";
import { withAuth, buildQuery, buildSortObj, paginatedResponse } from "@/lib/api-utils";
import * as XLSX from "xlsx";

export const GET = withAuth(async (req, { auth }) => {
  await connectDB();
  const { page, limit, search, sort, filter } = buildQuery(req.nextUrl.searchParams, "-createdAt");
  const query: Record<string, unknown> = { createdBy: auth.userId };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { promptText: { $regex: search, $options: "i" } },
    ];
  }
  if (filter.category) query.category = filter.category;
  if (filter.notesType) query.notesType = filter.notesType;
  if (filter.isActive) query.isActive = filter.isActive === "true";

  const sortObj = buildSortObj(sort);
  const [data, total] = await Promise.all([
    PromptModel.find(query).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
    PromptModel.countDocuments(query),
  ]);

  if (req.nextUrl.searchParams.get("export") === "excel") {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.map(({ _id, createdBy, ...d }) => ({ ...d, _id: _id.toString() })));
    XLSX.utils.book_append_sheet(wb, ws, "Prompts");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": "attachment; filename=prompts.xlsx" },
    });
  }

  return NextResponse.json(paginatedResponse(data, total, page, limit));
});

export const POST = withAuth(async (req, { auth }) => {
  await connectDB();
  const body = await req.json();
  const prompt = await PromptModel.create({ ...body, createdBy: auth.userId });
  return NextResponse.json({ data: prompt }, { status: 201 });
});
