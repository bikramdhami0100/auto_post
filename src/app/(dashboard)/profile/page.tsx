"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = { name };
      if (currentPassword && newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMessage("Profile updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      await refreshUser();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      alert(data.message || "Verification email sent");
    } catch {
      alert("Failed to send verification email");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Profile</h1>

      <div className="max-w-lg">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-2xl text-zinc-500">
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <div className="font-semibold text-zinc-900 dark:text-white">{user?.name}</div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">{user?.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  user?.emailVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {user?.emailVerified ? "Verified" : "Unverified"}
                </span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                  {user?.role}
                </span>
              </div>
              {!user?.emailVerified && (
                <button onClick={handleResendVerification} className="text-xs text-blue-600 hover:underline mt-1">
                  Resend verification email
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <h2 className="font-semibold text-zinc-900 dark:text-white">Edit Profile</h2>

          {error && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</div>}
          {message && <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">{message}</div>}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Change Password (optional)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg hover:opacity-90 disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
