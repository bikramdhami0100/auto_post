"use client";

import { useState } from "react";
import { useCrud } from "@/lib/useCrud";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import FilterBar from "@/components/ui/FilterBar";
import Modal from "@/components/ui/Modal";
import ExcelExportButton from "@/components/ui/ExcelExportButton";

interface TikTokConfig {
  _id: string;
  name: string;
  accessToken: string;
  openId?: string;
  appId?: string;
  isActive: boolean;
  createdAt: string;
}

export default function TikTokConfigPage() {
  const crud = useCrud<TikTokConfig>("/api/tiktok-config");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", accessToken: "", openId: "", appId: "", appSecret: "" });
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: "", accessToken: "", openId: "", appId: "", appSecret: "" });
    setModalOpen(true);
  };

  const openEdit = (item: TikTokConfig) => {
    setEditId(item._id);
    setForm({ name: item.name, accessToken: item.accessToken, openId: item.openId || "", appId: item.appId || "", appSecret: "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await crud.update(editId, form);
      } else {
        await crud.create(form);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: TikTokConfig) => {
    if (!confirm("Delete this configuration?")) return;
    try { await crud.remove(item._id); } catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
  };

  const toggleActive = async (item: TikTokConfig) => {
    await crud.update(item._id, { isActive: !item.isActive });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">TikTok Configuration</h1>
        <div className="flex gap-2">
          <ExcelExportButton exportUrl="/api/tiktok-config" />
          <button onClick={openCreate} className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:opacity-90">+ Add Config</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1"><SearchBar value={crud.search} onChange={crud.setSearch} placeholder="Search by name or open ID..." /></div>
        <FilterBar filters={crud.filters} options={{ isActive: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] }} onFilterChange={crud.setFilter} />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <DataTable
          columns={[
            { key: "name", label: "Name", sortable: true },
            { key: "openId", label: "Open ID", sortable: true },
            { key: "isActive", label: "Active", sortable: true, render: (item) => (
              <button onClick={() => toggleActive(item)} className={`px-2 py-0.5 text-xs rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>{item.isActive ? "Active" : "Inactive"}</button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Config" : "Add Config"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Access Token</label>
            <input type="password" value={form.accessToken} onChange={(e) => setForm({ ...form, accessToken: e.target.value })} required className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Open ID (optional)</label>
            <input type="text" value={form.openId} onChange={(e) => setForm({ ...form, openId: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">App ID (optional)</label>
            <input type="text" value={form.appId} onChange={(e) => setForm({ ...form, appId: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
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
