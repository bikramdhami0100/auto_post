import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SmtpConfigModel } from "@/models/SmtpConfig";
import { withAuth, buildQuery, buildSortObj, paginatedResponse } from "@/lib/api-utils";
import * as XLSX from "xlsx";

export const GET = withAuth(async (req) => {
  await connectDB();
  const { page, limit, search, sort, filter } = buildQuery(req.nextUrl.searchParams, "-createdAt");
  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { host: { $regex: search, $options: "i" } },
      { fromEmail: { $regex: search, $options: "i" } },
    ];
  }
  if (filter.isActive) query.isActive = filter.isActive === "true";

  const sortObj = buildSortObj(sort);
  const [data, total] = await Promise.all([
    SmtpConfigModel.find(query).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
    SmtpConfigModel.countDocuments(query),
  ]);

  if (req.nextUrl.searchParams.get("export") === "excel") {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.map(({ _id, createdBy, password, ...d }) => ({ ...d, _id: _id.toString() })));
    XLSX.utils.book_append_sheet(wb, ws, "SMTPConfigs");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": "attachment; filename=smtp-configs.xlsx" },
    });
  }

  return NextResponse.json(paginatedResponse(data, total, page, limit));
}, { adminOnly: true });

export const POST = withAuth(async (req, { auth }) => {
  await connectDB();
  const body = await req.json();
  const config = await SmtpConfigModel.create({ ...body, createdBy: auth.userId });
  return NextResponse.json({ data: config }, { status: 201 });
}, { adminOnly: true });
