"use client";

import { useState } from "react";
import { useCrud } from "@/lib/useCrud";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import FilterBar from "@/components/ui/FilterBar";
import Modal from "@/components/ui/Modal";
import ExcelExportButton from "@/components/ui/ExcelExportButton";

interface Prompt {
  _id: string;
  name: string;
  category: string;
  subType?: string;
  promptText: string;
  notesType: string;
  fontFamily: string;
  fontSize: number;
  pageSize: string;
  textColor: string;
  backgroundColor: string;
  isActive: boolean;
  createdAt: string;
}

const notesTypeOptions = [
  { value: "realistic", label: "Realistic" },
  { value: "creative", label: "Creative" },
  { value: "educational", label: "Educational" },
  { value: "minimalist", label: "Minimalist" },
];

const pageSizeOptions = [
  { value: "1080x1920", label: "1080×1920" },
  { value: "1080x1080", label: "1080×1080" },
  { value: "1920x1080", label: "1920×1080" },
  { value: "720x1280", label: "720×1280" },
];

export default function PromptsPage() {
  const crud = useCrud<Prompt>("/api/prompts");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", category: "", subType: "", promptText: "", notesType: "realistic",
    fontFamily: "ND", fontSize: 48, pageSize: "1080x1920", textColor: "#222222", backgroundColor: "#FFFBF5",
  });
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: "", category: "", subType: "", promptText: "", notesType: "realistic", fontFamily: "ND", fontSize: 48, pageSize: "1080x1920", textColor: "#222222", backgroundColor: "#FFFBF5" });
    setModalOpen(true);
  };

  const openEdit = (item: Prompt) => {
    setEditId(item._id);
    setForm({ name: item.name, category: item.category, subType: item.subType || "", promptText: item.promptText, notesType: item.notesType, fontFamily: item.fontFamily, fontSize: item.fontSize, pageSize: item.pageSize, textColor: item.textColor, backgroundColor: item.backgroundColor });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) { await crud.update(editId, form); }
      else { await crud.create(form); }
      setModalOpen(false);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (item: Prompt) => {
    if (!confirm("Delete this prompt?")) return;
    try { await crud.remove(item._id); } catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Prompts</h1>
        <div className="flex gap-2">
          <ExcelExportButton exportUrl="/api/prompts" />
          <button onClick={openCreate} className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:opacity-90">+ Add Prompt</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1"><SearchBar value={crud.search} onChange={crud.setSearch} placeholder="Search prompts..." /></div>
        <FilterBar filters={crud.filters} options={{ category: [], notesType: notesTypeOptions }} onFilterChange={crud.setFilter} />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <DataTable
          columns={[
            { key: "name", label: "Name", sortable: true },
            { key: "category", label: "Category", sortable: true, render: (item) => <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800">{item.category}</span> },
            { key: "notesType", label: "Notes Type", sortable: true, render: (item) => <span className="capitalize">{item.notesType}</span> },
            { key: "pageSize", label: "Page Size", render: (item) => <span className="text-xs font-mono">{item.pageSize}</span> },
            { key: "fontFamily", label: "Font", render: (item) => <span className="font-mono text-xs">{item.fontFamily} ({item.fontSize}px)</span> },
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Prompt" : "Add Prompt"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Sub Type</label>
              <input type="text" value={form.subType} onChange={(e) => setForm({ ...form, subType: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Notes Type</label>
              <select value={form.notesType} onChange={(e) => setForm({ ...form, notesType: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white">
                {notesTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Font Family</label>
              <input type="text" value={form.fontFamily} onChange={(e) => setForm({ ...form, fontFamily: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Font Size</label>
              <input type="number" value={form.fontSize} onChange={(e) => setForm({ ...form, fontSize: parseInt(e.target.value) || 48 })} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Page Size</label>
              <select value={form.pageSize} onChange={(e) => setForm({ ...form, pageSize: e.target.value })} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white">
                {pageSizeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Text Color</label>
              <input type="color" value={form.textColor} onChange={(e) => setForm({ ...form, textColor: e.target.value })} className="w-full h-10 border border-zinc-200 dark:border-zinc-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Background Color</label>
              <input type="color" value={form.backgroundColor} onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })} className="w-full h-10 border border-zinc-200 dark:border-zinc-700 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Prompt Text</label>
            <textarea value={form.promptText} onChange={(e) => setForm({ ...form, promptText: e.target.value })} required rows={6} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono text-xs" />
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
