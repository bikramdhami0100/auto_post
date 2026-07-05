"use client";

interface ExcelExportButtonProps {
  exportUrl: string;
  filename?: string;
}

export default function ExcelExportButton({ exportUrl, filename = "export.xlsx" }: ExcelExportButtonProps) {
  const handleExport = () => {
    const separator = exportUrl.includes("?") ? "&" : "?";
    window.open(`${exportUrl}${separator}export=excel`, "_blank");
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
    >
      ⬇ Export Excel
    </button>
  );
}
