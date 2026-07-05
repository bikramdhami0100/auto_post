"use client";

import { useState } from "react";
import { useCrud } from "@/lib/useCrud";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import FilterBar from "@/components/ui/FilterBar";
import Modal from "@/components/ui/Modal";
import ExcelExportButton from "@/components/ui/ExcelExportButton";

interface EnvConfig {
  _id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  isEncrypted: boolean;
  isActive: boolean;
  createdAt: string;
}

const categoryOptions = [
  { value: "social", label: "Social" },
  { value: "ai", label: "AI" },
  { value: "database", label: "Database" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];

export default function EnvConfigPage() {
  const crud = useCrud<EnvConfig>("/api/env");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ key: "", value: "", description: "", category: "other", isEncrypted: false });
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditId(null);
    setForm({ key: "", value: "", description: "", category: "other", isEncrypted: false });
    setModalOpen(true);
  };

  const openEdit = (item: EnvConfig) => {
    setEditId(item._id);
    setForm({ key: item.key, value: "", description: item.description || "", category: item.category, isEncrypted: item.isEncrypted });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { ...form };
      if (editId && !body.value) { delete body.value; }
      if (editId) {
        await crud.update(editId, body);
      } else {
        await crud.create(body);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: EnvConfig) => {
    if (!confirm("Delete this variable?")) return;
    try { await crud.remove(item._id); } catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Environment Variables</h1>
        <div className="flex gap-2">
          <ExcelExportButton exportUrl="/api/env" />
          <button onClick={openCreate} className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:opacity-90">+ Add Variable</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1"><SearchBar value={crud.search} onChange={crud.setSearch} placeholder="Search by key or description..." /></div>
        <FilterBar filters={crud.filters} options={{ category: categoryOptions }} onFilterChange={crud.setFilter} />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <DataTable
          columns={[
            { key: "key", label: "Key", sortable: true },
            { key: "category", label: "Category", sortable: true, render: (item) => (
              <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{item.category}</span>
            )},
            { key: "isActive", label: "Active", sortable: true, render: (item) => (
              <span className={`px-2 py-0.5 text-xs rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>{item.isActive ? "Active" : "Inactive"}</span>
            )},
            { key: "description", label: "Description", render: (item) => <span className="text-zinc-500">{item.description || "—"}</span> },
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Variable" : "Add Variable"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Key</label>
            <input type="text" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value.toUpperCase() })} required className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Value</label>
            <input type="text" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required={!editId} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white">
              {categoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isEncrypted" checked={form.isEncrypted} onChange={(e) => setForm({ ...form, isEncrypted: e.target.checked })} />
            <label htmlFor="isEncrypted" className="text-sm text-zinc-600 dark:text-zinc-400">Encrypt this value</label>
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
