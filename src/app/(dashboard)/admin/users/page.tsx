"use client";

import { useState } from "react";
import { useCrud } from "@/lib/useCrud";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import FilterBar from "@/components/ui/FilterBar";
import Modal from "@/components/ui/Modal";
import ExcelExportButton from "@/components/ui/ExcelExportButton";
import { useAuth } from "@/context/AuthContext";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const crud = useCrud<User>("/api/admin/users");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<{ role: "user" | "admin"; isActive: boolean; emailVerified: boolean }>({ role: "user", isActive: true, emailVerified: false });
  const [submitting, setSubmitting] = useState(false);

  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({ role: user.role, isActive: user.isActive, emailVerified: user.emailVerified });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSubmitting(true);
    try {
      await crud.update(editUser._id, form);
      setModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (user._id === currentUser?.id) {
      alert("You cannot delete yourself");
      return;
    }
    if (!confirm(`Delete user "${user.name}"?`)) return;
    try { await crud.remove(user._id); } catch (err: unknown) { alert(err instanceof Error ? err.message : "Error"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Manage Users</h1>
        <ExcelExportButton exportUrl="/api/admin/users" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1"><SearchBar value={crud.search} onChange={crud.setSearch} placeholder="Search users..." /></div>
        <FilterBar
          filters={crud.filters}
          options={{
            role: [{ value: "user", label: "User" }, { value: "admin", label: "Admin" }],
            isActive: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }],
            emailVerified: [{ value: "true", label: "Verified" }, { value: "false", label: "Unverified" }],
          }}
          onFilterChange={crud.setFilter}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <DataTable
          columns={[
            { key: "name", label: "Name", sortable: true },
            { key: "email", label: "Email", sortable: true },
            { key: "role", label: "Role", sortable: true, render: (item) => (
              <span className={`px-2 py-0.5 text-xs rounded-full ${item.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-zinc-100 text-zinc-600"}`}>{item.role}</span>
            )},
            { key: "emailVerified", label: "Verified", sortable: true, render: (item) => (
              <span className={`px-2 py-0.5 text-xs rounded-full ${item.emailVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{item.emailVerified ? "Yes" : "No"}</span>
            )},
            { key: "isActive", label: "Active", sortable: true, render: (item) => (
              <span className={`px-2 py-0.5 text-xs rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{item.isActive ? "Active" : "Inactive"}</span>
            )},
            { key: "createdAt", label: "Joined", sortable: true, render: (item) => new Date(item.createdAt).toLocaleDateString() },
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Manage User: ${editUser?.name}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg mb-2">
            <div className="text-sm font-medium text-zinc-900 dark:text-white">{editUser?.name}</div>
            <div className="text-xs text-zinc-500">{editUser?.email}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "user" | "admin" })} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <label htmlFor="isActive" className="text-sm text-zinc-600 dark:text-zinc-400">Account Active</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="emailVerified" checked={form.emailVerified} onChange={(e) => setForm({ ...form, emailVerified: e.target.checked })} />
            <label htmlFor="emailVerified" className="text-sm text-zinc-600 dark:text-zinc-400">Email Verified</label>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg font-medium disabled:opacity-50">{submitting ? "Saving..." : "Update User"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
