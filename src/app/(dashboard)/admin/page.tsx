"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/ui/StatsCard";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

interface AdminData {
  stats: {
    totalUsers: number;
    verifiedUsers: number;
    activeUsers: number;
    adminUsers: number;
    totalPosts: number;
    totalContentLogs: number;
    postedContentLogs: number;
  };
  chartData: { date: string; count: number }[];
  recentLogs: { title: string; category: string; posted: boolean; createdAt: string }[];
  recentUsers: { name: string; email: string; role: string; emailVerified: boolean; createdAt: string }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) {
          if (res.status === 403) setError("Admin access required");
          else setError("Failed to load dashboard");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load dashboard");
      }
    }
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20 text-zinc-400">Loading admin dashboard...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">System overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Users" value={data.stats.totalUsers} icon="👥" color="bg-blue-50 dark:bg-blue-900/20" />
        <StatsCard title="Verified Users" value={data.stats.verifiedUsers} icon="✅" color="bg-green-50 dark:bg-green-900/20" />
        <StatsCard title="Active Users" value={data.stats.activeUsers} icon="⚡" color="bg-amber-50 dark:bg-amber-900/20" />
        <StatsCard title="Admins" value={data.stats.adminUsers} icon="🛡" color="bg-purple-50 dark:bg-purple-900/20" />
        <StatsCard title="Content Logs" value={data.stats.totalContentLogs} icon="📋" color="bg-rose-50 dark:bg-rose-900/20" />
        <StatsCard title="Posted" value={data.stats.postedContentLogs} icon="✅" color="bg-teal-50 dark:bg-teal-900/20" />
        <StatsCard title="Facebook/TikTok Posts" value={data.stats.totalPosts} icon="📤" color="bg-sky-50 dark:bg-sky-900/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Daily Posts (30 Days)</h2>
          {data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-zinc-400">No data available</div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Content by Category</h2>
          {data.recentLogs.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(
                data.recentLogs.reduce<Record<string, number>>((acc, log) => {
                  acc[log.category] = (acc[log.category] || 0) + 1;
                  return acc;
                }, {})
              ).map(([category, count]) => ({ category, count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-zinc-400">No data available</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Recent Users</h2>
          <div className="space-y-3">
            {data.recentUsers.map((user, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-white">{user.name}</div>
                  <div className="text-xs text-zinc-500">{user.email}</div>
                </div>
                <div className="flex gap-1">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${user.emailVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {user.emailVerified ? "Verified" : "Pending"}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 capitalize">{user.role}</span>
                </div>
              </div>
            ))}
            {data.recentUsers.length === 0 && <div className="text-sm text-zinc-400">No users yet</div>}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Recent Content Logs</h2>
          <div className="space-y-3">
            {data.recentLogs.map((log, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1">{log.title}</div>
                  <div className="text-xs text-zinc-500">{log.category}</div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full ${log.posted ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {log.posted ? "Posted" : "Failed"}
                </span>
              </div>
            ))}
            {data.recentLogs.length === 0 && <div className="text-sm text-zinc-400">No content logs yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
