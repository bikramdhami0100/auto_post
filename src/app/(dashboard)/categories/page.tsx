"use client";

import { useState } from "react";
import { useCrud } from "@/lib/useCrud";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import FilterBar from "@/components/ui/FilterBar";
import Modal from "@/components/ui/Modal";
import ExcelExportButton from "@/components/ui/ExcelExportButton";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  subTypes: string[];
  isActive: boolean;
  createdAt: string;
}

export default function CategoriesPage() {
  const crud = useCrud<Category>("/api/categories");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "", subTypes: "" });
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: "", slug: "", description: "", icon: "", subTypes: "" });
    setModalOpen(true);
  };

  const openEdit = (item: Category) => {
    setEditId(item._id);
    setForm({ name: item.name, slug: item.slug, description: item.description || "", icon: item.icon || "", subTypes: item.subTypes.join(", ") });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...form,
        subTypes: form.subTypes.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (editId) { await crud.update(editId, body); }
      else { await crud.create(body); }
      setModalOpen(false);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (item: Category) => {
    if (!confirm("Delete this category?")) return;
    try { await crud.remove(item._id); } catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Categories & Subtypes</h1>
        <div className="flex gap-2">
          <ExcelExportButton exportUrl="/api/categories" />
          <button onClick={openCreate} className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:opacity-90">+ Add Category</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1"><SearchBar value={crud.search} onChange={crud.setSearch} placeholder="Search categories..." /></div>
        <FilterBar filters={crud.filters} options={{ isActive: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] }} onFilterChange={crud.setFilter} />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <DataTable
          columns={[
            { key: "name", label: "Name", sortable: true },
            { key: "slug", label: "Slug", sortable: true, render: (item) => <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{item.slug}</code> },
            { key: "subTypes", label: "Subtypes", render: (item) => (
              <div className="flex flex-wrap gap-1">
                {item.subTypes.map((st, i) => <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{st}</span>)}
              </div>
            )},
            { key: "isActive", label: "Active", sortable: true, render: (item) => (
              <span className={`px-2 py-0.5 text-xs rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>{item.isActive ? "Active" : "Inactive"}</span>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editId ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "_") })} required className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Subtypes (comma separated)</label>
            <input type="text" value={form.subTypes} onChange={(e) => setForm({ ...form, subTypes: e.target.value })} placeholder="book_quote, economic_mindset, rich_mindset" className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
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
