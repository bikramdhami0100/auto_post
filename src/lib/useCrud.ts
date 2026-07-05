"use client";

import { useState, useEffect, useCallback } from "react";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CrudState<T> {
  data: T[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  search: string;
  sort: string;
  filters: Record<string, string>;
  page: number;
}

interface CrudActions<T> {
  setSearch: (s: string) => void;
  setSort: (s: string) => void;
  setFilter: (key: string, value: string) => void;
  setPage: (p: number) => void;
  refresh: () => Promise<void>;
  create: (body: Record<string, unknown>) => Promise<T>;
  update: (id: string, body: Record<string, unknown>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  getOne: (id: string) => Promise<T>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCrud<T = any>(baseUrl: string): CrudState<T> & CrudActions<T> {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "10");
    params.set("sort", sort);
    if (search) params.set("search", search);
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(`filter_${k}`, v);
    });
    return `${baseUrl}?${params.toString()}`;
  }, [baseUrl, page, sort, search, filters]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildUrl());
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json.data || []);
      setPagination(json.pagination || { total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (body: Record<string, unknown>): Promise<T> => {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create");
    }
    const json = await res.json();
    await refresh();
    return json.data;
  };

  const update = async (id: string, body: Record<string, unknown>): Promise<T> => {
    const res = await fetch(`${baseUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update");
    }
    const json = await res.json();
    await refresh();
    return json.data;
  };

  const remove = async (id: string): Promise<void> => {
    const res = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete");
    }
    await refresh();
  };

  const getOne = async (id: string): Promise<T> => {
    const res = await fetch(`${baseUrl}/${id}`);
    if (!res.ok) throw new Error("Not found");
    const json = await res.json();
    return json.data;
  };

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return {
    data, pagination, loading, error, search, sort, filters, page,
    setSearch: (s: string) => { setSearch(s); setPage(1); },
    setSort: (s: string) => { setSort(s); setPage(1); },
    setFilter, setPage, refresh, create, update, remove, getOne,
  };
}
