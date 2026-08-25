import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  processing: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  ready: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  shipped: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  draft: "bg-surface-500/15 text-surface-400 border-surface-500/20",
  archived: "bg-surface-500/15 text-surface-400 border-surface-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  ready: "Ready for Delivery",
  shipped: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const fallback = !statusStyles[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold capitalize",
        statusStyles[status],
        className
      )}
      style={fallback ? { background: "var(--surface)", color: "var(--fg-muted)", borderColor: "var(--border)" } : undefined}
    >
      {statusLabels[status] || status}
    </span>
  );
}
