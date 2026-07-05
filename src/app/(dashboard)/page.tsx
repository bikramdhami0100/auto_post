"use client";

import { useAuth } from "@/context/AuthContext";
import StatsCard from "@/components/ui/StatsCard";
import { useEffect, useState } from "react";

interface DashboardStats {
  facebookConfigs: number;
  tikTokConfigs: number;
  envConfigs: number;
  prompts: number;
  categories: number;
  facebookPosts: number;
  tikTokPosts: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    facebookConfigs: 0, tikTokConfigs: 0, envConfigs: 0,
    prompts: 0, categories: 0, facebookPosts: 0, tikTokPosts: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const endpoints = [
        { key: "facebookConfigs", url: "/api/facebook-config?limit=1" },
        { key: "tikTokConfigs", url: "/api/tiktok-config?limit=1" },
        { key: "envConfigs", url: "/api/env?limit=1" },
        { key: "prompts", url: "/api/prompts?limit=1" },
        { key: "categories", url: "/api/categories?limit=1" },
        { key: "facebookPosts", url: "/api/facebook-posts?limit=1" },
        { key: "tikTokPosts", url: "/api/tiktok-posts?limit=1" },
      ];

      const results = await Promise.all(
        endpoints.map(async ({ key, url }) => {
          try {
            const res = await fetch(url);
            const data = await res.json();
            return { key, value: (data.pagination?.total as number) || 0 };
          } catch {
            return { key, value: 0 };
          }
        })
      );

      const newStats = { facebookConfigs: 0, tikTokConfigs: 0, envConfigs: 0, prompts: 0, categories: 0, facebookPosts: 0, tikTokPosts: 0 };
      for (const { key, value } of results) {
        if (key === "facebookConfigs") newStats.facebookConfigs = value;
        else if (key === "tikTokConfigs") newStats.tikTokConfigs = value;
        else if (key === "envConfigs") newStats.envConfigs = value;
        else if (key === "prompts") newStats.prompts = value;
        else if (key === "categories") newStats.categories = value;
        else if (key === "facebookPosts") newStats.facebookPosts = value;
        else if (key === "tikTokPosts") newStats.tikTokPosts = value;
      }
      setStats(newStats);
    }
    fetchStats();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Welcome back, {user?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatsCard title="Facebook Configs" value={stats.facebookConfigs} icon="📘" color="bg-blue-50 dark:bg-blue-900/20" />
        <StatsCard title="TikTok Configs" value={stats.tikTokConfigs} icon="🎵" color="bg-purple-50 dark:bg-purple-900/20" />
        <StatsCard title="Environment Variables" value={stats.envConfigs} icon="⚙" color="bg-amber-50 dark:bg-amber-900/20" />
        <StatsCard title="Prompts" value={stats.prompts} icon="📝" color="bg-green-50 dark:bg-green-900/20" />
        <StatsCard title="Categories" value={stats.categories} icon="📂" color="bg-rose-50 dark:bg-rose-900/20" />
        <StatsCard title="Facebook Posts" value={stats.facebookPosts} icon="📤" color="bg-sky-50 dark:bg-sky-900/20" />
        <StatsCard title="TikTok Posts" value={stats.tikTokPosts} icon="🎬" color="bg-teal-50 dark:bg-teal-900/20" />
      </div>
    </div>
  );
}
