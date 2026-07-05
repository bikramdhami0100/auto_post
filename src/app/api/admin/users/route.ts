import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { withAuth, buildQuery, buildSortObj, paginatedResponse } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";
import * as XLSX from "xlsx";

export const GET = withAuth(async (req) => {
  await connectDB();
  const { page, limit, search, sort, filter } = buildQuery(req.nextUrl.searchParams, "-createdAt");
  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (filter.role) query.role = filter.role;
  if (filter.isActive) query.isActive = filter.isActive === "true";
  if (filter.emailVerified) query.emailVerified = filter.emailVerified === "true";

  const sortObj = buildSortObj(sort);
  const [data, total] = await Promise.all([
    UserModel.find(query).sort(sortObj).skip((page - 1) * limit).limit(limit).select("-password").lean(),
    UserModel.countDocuments(query),
  ]);

  if (req.nextUrl.searchParams.get("export") === "excel") {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.map(({ _id, ...d }) => ({ ...d, _id: _id.toString() })));
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": "attachment; filename=users.xlsx" },
    });
  }

  return NextResponse.json(paginatedResponse(data, total, page, limit));
}, { adminOnly: true });

export const POST = withAuth(async (req) => {
  await connectDB();
  const body = await req.json();
  if (body.password) body.password = await hashPassword(body.password);
  const user = await UserModel.create(body);
  return NextResponse.json({ data: { ...user.toObject(), password: undefined } }, { status: 201 });
}, { adminOnly: true });
