import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest, JWTPayload } from "./auth";

export interface ApiHandlerContext {
  auth: JWTPayload;
  params: Record<string, string>;
}

export type ApiHandler = (req: NextRequest, ctx: ApiHandlerContext) => Promise<NextResponse>;

export function withAuth(
  handler: ApiHandler,
  options?: { adminOnly?: boolean }
) {
  return async (request: NextRequest, { params }: { params: Promise<Record<string, string>> }) => {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (options?.adminOnly && auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(request, { auth, params: await params });
  };
}

export function buildQuery(searchParams: URLSearchParams, defaultSort = "-createdAt") {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || defaultSort;
  const filter: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    if (key.startsWith("filter_") && value) {
      filter[key.replace("filter_", "")] = value;
    }
  });

  return { page, limit, search, sort, filter };
}

export function buildSortObj(sort: string): Record<string, 1 | -1> {
  const sortObj: Record<string, 1 | -1> = {};
  sort.split(",").forEach((s) => {
    if (s.startsWith("-")) {
      sortObj[s.slice(1)] = -1;
    } else {
      sortObj[s] = 1;
    }
  });
  return sortObj;
}

export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}
