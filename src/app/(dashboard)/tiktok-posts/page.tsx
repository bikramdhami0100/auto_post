"use client";

import { useState } from "react";
import { useCrud } from "@/lib/useCrud";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import FilterBar from "@/components/ui/FilterBar";
import Modal from "@/components/ui/Modal";
import ExcelExportButton from "@/components/ui/ExcelExportButton";

interface TikTokPost {
  _id: string;
  tikTokConfigId: { _id: string; name: string } | string;
  caption: string;
  tikTokPostId?: string;
  status: string;
  scheduledAt?: string;
  postedAt?: string;
  createdAt: string;
}

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "posted", label: "Posted" },
  { value: "failed", label: "Failed" },
];

export default function TikTokPostsPage() {
  const crud = useCrud<TikTokPost>("/api/tiktok-posts");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ tikTokConfigId: "", caption: "", status: "draft", scheduledAt: "" });
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditId(null);
    setForm({ tikTokConfigId: "", caption: "", status: "draft", scheduledAt: "" });
    setModalOpen(true);
  };

  const openEdit = (item: TikTokPost) => {
    setEditId(item._id);
    const configId = typeof item.tikTokConfigId === "object" ? item.tikTokConfigId._id : item.tikTokConfigId;
    setForm({ tikTokConfigId: configId, caption: item.caption, status: item.status, scheduledAt: item.scheduledAt ? new Date(item.scheduledAt).toISOString().slice(0, 16) : "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { ...form };
      if (body.scheduledAt) body.scheduledAt = new Date(body.scheduledAt as string).toISOString();
      else delete body.scheduledAt;
      if (editId) { await crud.update(editId, body); }
      else { await crud.create(body); }
      setModalOpen(false);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (item: TikTokPost) => {
    if (!confirm("Delete this post?")) return;
    try { await crud.remove(item._id); } catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
  };

  const getConfigName = (item: TikTokPost) => {
    if (typeof item.tikTokConfigId === "object" && item.tikTokConfigId) return item.tikTokConfigId.name;
    return "N/A";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">TikTok Posts</h1>
        <div className="flex gap-2">
          <ExcelExportButton exportUrl="/api/tiktok-posts" />
          <button onClick={openCreate} className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:opacity-90">+ New Post</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1"><SearchBar value={crud.search} onChange={crud.setSearch} placeholder="Search posts..." /></div>
        <FilterBar filters={crud.filters} options={{ status: statusOptions }} onFilterChange={crud.setFilter} />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <DataTable
          columns={[
            { key: "caption", label: "Caption", render: (item) => <span className="line-clamp-1 max-w-xs">{item.caption}</span> },
            { key: "tikTokConfigId", label: "Config", render: (item) => <span className="text-xs">{getConfigName(item)}</span> },
            { key: "status", label: "Status", sortable: true, render: (item) => (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                item.status === "posted" ? "bg-green-100 text-green-700" :
                item.status === "failed" ? "bg-red-100 text-red-700" :
                item.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                "bg-zinc-100 text-zinc-500"
              }`}>{item.status}</span>
            )},
            { key: "createdAt", label: "Created", sortable: true, render: (item) => new Date(item.createdAt).toLocaleDateString() },
          ]}
          data={crud.data}
          sort={crud.sort}
          onSort={crud.setSort}
          onEdit={openEdit}
          onDelete={handleDelete}
          loading={crud.loading}
        />
        <Pagination page={crud.pagination.page} totalPages={crud.pagination.totalPages} total={crud.pagination.total} limit={crud.pagination.limit} onPageChange={crud.setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Post" : "New Post"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Caption</label>
            <textarea value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} required rows={4} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white">
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Schedule (optional)</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg font-medium disabled:opacity-50">{submitting ? "Saving..." : editId ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
