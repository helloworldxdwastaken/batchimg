"use client";

import { CountryStatus } from "@/types";

const config: Record<CountryStatus, { bg: string; text: string; label: string; animate?: boolean }> = {
  pending: { bg: "bg-gray-700", text: "text-gray-300", label: "Pending" },
  generating: { bg: "bg-blue-600", text: "text-blue-100", label: "Generating", animate: true },
  done: { bg: "bg-green-700", text: "text-green-100", label: "Done" },
  failed: { bg: "bg-red-700", text: "text-red-100", label: "Failed" },
};

export default function StatusBadge({ status }: { status: CountryStatus }) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
    >
      {c.animate && (
        <span className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-pulse" />
      )}
      {c.label}
    </span>
  );
}
