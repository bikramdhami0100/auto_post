"use client";

import { useState } from "react";
import { useCrud } from "@/lib/useCrud";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import FilterBar from "@/components/ui/FilterBar";
import Modal from "@/components/ui/Modal";
import ExcelExportButton from "@/components/ui/ExcelExportButton";

interface SmtpConfig {
  _id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromEmail: string;
  fromName?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminSmtpPage() {
  const crud = useCrud<SmtpConfig>("/api/admin/smtp");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", host: "", port: 587, secure: false, username: "", password: "", fromEmail: "", fromName: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: "", host: "", port: 587, secure: false, username: "", password: "", fromEmail: "", fromName: "" });
    setModalOpen(true);
  };

  const openEdit = (item: SmtpConfig) => {
    setEditId(item._id);
    setForm({ name: item.name, host: item.host, port: item.port, secure: item.secure, username: item.username, password: "", fromEmail: item.fromEmail, fromName: item.fromName || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { ...form };
      if (editId && !body.password) delete body.password;
      if (editId) { await crud.update(editId, body); }
      else { await crud.create(body); }
      setModalOpen(false);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (item: SmtpConfig) => {
    if (!confirm("Delete this SMTP configuration?")) return;
    try { await crud.remove(item._id); } catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
  };

  const toggleActive = async (item: SmtpConfig) => {
    await crud.update(item._id, { isActive: !item.isActive });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">SMTP / Email Configuration</h1>
        <div className="flex gap-2">
          <ExcelExportButton exportUrl="/api/admin/smtp" />
          <button onClick={openCreate} className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:opacity-90">+ Add Config</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1"><SearchBar value={crud.search} onChange={crud.setSearch} placeholder="Search by name, host, or email..." /></div>
        <FilterBar filters={crud.filters} options={{ isActive: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] }} onFilterChange={crud.setFilter} />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <DataTable
          columns={[
            { key: "name", label: "Name", sortable: true },
            { key: "host", label: "Host", sortable: true, render: (item) => <span className="font-mono text-xs">{item.host}:{item.port}</span> },
            { key: "fromEmail", label: "From Email", sortable: true },
            { key: "username", label: "Username", render: (item) => <span className="text-xs text-zinc-500">{item.username}</span> },
            { key: "secure", label: "Security", render: (item) => <span className={`px-2 py-0.5 text-xs rounded-full ${item.secure ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>{item.secure ? "SSL/TLS" : "STARTTLS"}</span> },
            { key: "isActive", label: "Active", sortable: true, render: (item) => (
              <button onClick={() => toggleActive(item)} className={`px-2 py-0.5 text-xs rounded-full ${item.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"}`}>
                {item.isActive ? "Active" : "Inactive"}
              </button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit SMTP Config" : "Add SMTP Config"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Host</label>
              <input type="text" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} required placeholder="smtp.gmail.com" className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Port</label>
              <input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) || 587 })} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.secure} onChange={(e) => setForm({ ...form, secure: e.target.checked })} />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Use SSL/TLS</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Username</label>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editId} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
              {editId && <p className="text-xs text-zinc-400 mt-1">Leave blank to keep existing</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">From Email</label>
              <input type="email" value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} required className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">From Name (optional)</label>
              <input type="text" value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} placeholder="AutoPost Nepal" className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
            </div>
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
