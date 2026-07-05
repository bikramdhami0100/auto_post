"use client";

import { ReactNode } from "react";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  sort: string;
  onSort: (key: string) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
}

export default function DataTable<T>({
  columns,
  data,
  sort,
  onSort,
  onEdit,
  onDelete,
  loading,
}: DataTableProps<T>) {
  const getSortIndicator = (key: string) => {
    if (sort === key) return " ↑";
    if (sort === `-${key}`) return " ↓";
    return "";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400 ${
                  col.sortable ? "cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200" : ""
                }`}
                onClick={() => col.sortable && onSort(col.key)}
              >
                {col.label}
                {col.sortable && getSortIndicator(col.key)}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-8 text-zinc-400">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-8 text-zinc-400">
                No data found
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr
                key={String((item as Record<string, unknown>)._id || idx)}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="text-xs px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="text-xs px-3 py-1 rounded bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
