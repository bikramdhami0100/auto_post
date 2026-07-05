"use client";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
  color?: string;
}

export default function StatsCard({ title, value, icon, description, color = "bg-zinc-100 dark:bg-zinc-800" }: StatsCardProps) {
  return (
    <div className={`${color} rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</div>
      <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{title}</div>
      {description && (
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{description}</div>
      )}
    </div>
  );
}
