import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
};

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 px-4 text-center", className)}>
      <div
        className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{ background: "var(--surface)", color: "var(--fg-faint)" }}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold" style={{ color: "var(--fg)" }}>{title}</h3>
      <p className="mb-8 max-w-sm text-sm" style={{ color: "var(--fg-muted)" }}>{description}</p>
      {action && (
        <Link
          href={action.href}
          className="btn-primary"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
