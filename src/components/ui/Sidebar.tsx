"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/dashboard/facebook-config", label: "Facebook Config", icon: "📘" },
  { href: "/dashboard/tiktok-config", label: "TikTok Config", icon: "🎵" },
  { href: "/dashboard/env", label: "Environment Variables", icon: "⚙" },
  { href: "/dashboard/prompts", label: "Prompts", icon: "📝" },
  { href: "/dashboard/categories", label: "Categories", icon: "📂" },
  { href: "/dashboard/facebook-posts", label: "Facebook Posts", icon: "📤" },
  { href: "/dashboard/tiktok-posts", label: "TikTok Posts", icon: "📤" },
  { href: "/dashboard/settings", label: "Settings", icon: "🔧" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
];

const adminNavItems = [
  { href: "/admin", label: "Admin Dashboard", icon: "🛡" },
  { href: "/admin/users", label: "Manage Users", icon: "👥" },
  { href: "/admin/smtp", label: "SMTP Config", icon: "📧" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-zinc-900 text-white flex flex-col transition-all duration-200 min-h-screen`}
    >
      <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
        {!collapsed && <span className="font-bold text-lg">AutoPost</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-zinc-400 hover:text-white text-xl"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {userNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
              isActive(item.href)
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
            title={collapsed ? item.label : undefined}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {user?.role === "admin" && (
          <>
            <div className="border-t border-zinc-700 my-2 mx-4" />
            {!collapsed && (
              <div className="px-4 py-1 text-xs text-zinc-500 uppercase tracking-wider">
                Admin
              </div>
            )}
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-zinc-700 p-4">
        {!collapsed && user && (
          <div className="text-sm text-zinc-400 mb-2 truncate">{user.email}</div>
        )}
        <button
          onClick={logout}
          className="text-sm text-zinc-400 hover:text-red-400 transition-colors w-full text-left"
        >
          {collapsed ? "⏻" : "Logout"}
        </button>
      </div>
    </aside>
  );
}
