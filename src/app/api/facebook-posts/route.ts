import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FacebookPostModel } from "@/models/FacebookPost";
import { FacebookConfigModel } from "@/models/FacebookConfig";
import { withAuth, buildQuery, buildSortObj, paginatedResponse } from "@/lib/api-utils";
import * as XLSX from "xlsx";

export const GET = withAuth(async (req, { auth }) => {
  await connectDB();
  const { page, limit, search, sort, filter } = buildQuery(req.nextUrl.searchParams, "-createdAt");
  const query: Record<string, unknown> = { createdBy: auth.userId };

  if (search) {
    query.$or = [
      { content: { $regex: search, $options: "i" } },
      { facebookPostId: { $regex: search, $options: "i" } },
    ];
  }
  if (filter.status) query.status = filter.status;
  if (filter.facebookConfigId) query.facebookConfigId = filter.facebookConfigId;

  const sortObj = buildSortObj(sort);
  const [data, total] = await Promise.all([
    FacebookPostModel.find(query).sort(sortObj).skip((page - 1) * limit).limit(limit).populate("facebookConfigId", "name pageId").lean(),
    FacebookPostModel.countDocuments(query),
  ]);

  if (req.nextUrl.searchParams.get("export") === "excel") {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.map(({ _id, createdBy, ...d }) => ({ ...d, _id: _id.toString() })));
    XLSX.utils.book_append_sheet(wb, ws, "FacebookPosts");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": "attachment; filename=facebook-posts.xlsx" },
    });
  }

  return NextResponse.json(paginatedResponse(data, total, page, limit));
});

export const POST = withAuth(async (req, { auth }) => {
  await connectDB();
  const body = await req.json();
  const post = await FacebookPostModel.create({ ...body, createdBy: auth.userId });
  return NextResponse.json({ data: post }, { status: 201 });
});
