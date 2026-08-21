import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1.5 py-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex h-9 items-center justify-center rounded-xl px-2 text-sm font-medium transition-all",
          currentPage === 1
            ? "cursor-not-allowed"
            : "hover:bg-[var(--surface)] hover:text-[var(--fg)]"
        )}
        style={{ color: currentPage === 1 ? "var(--fg-faint)" : "var(--fg-muted)" }}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      {getPageNumbers().map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2 py-2 text-sm" style={{ color: "var(--fg-faint)" }}>
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all",
              currentPage === page
                ? "bg-brand-500"
                : "hover:bg-[var(--surface)] hover:text-[var(--fg)]"
            )}
            style={{ color: currentPage === page ? "#fff" : "var(--fg-muted)" }}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex h-9 items-center justify-center rounded-xl px-2 text-sm font-medium transition-all",
          currentPage === totalPages
            ? "cursor-not-allowed"
            : "hover:bg-[var(--surface)] hover:text-[var(--fg)]"
        )}
        style={{ color: currentPage === totalPages ? "var(--fg-faint)" : "var(--fg-muted)" }}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </nav>
  );
}
