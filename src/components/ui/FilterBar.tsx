"use client";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  filters: Record<string, string>;
  options: Record<string, FilterOption[]>;
  onFilterChange: (key: string, value: string) => void;
}

export default function FilterBar({ filters, options, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(options).map(([key, opts]) => (
        <select
          key={key}
          value={filters[key] || ""}
          onChange={(e) => onFilterChange(key, e.target.value)}
          className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
        >
          <option value="">All {key}</option>
          {opts.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
