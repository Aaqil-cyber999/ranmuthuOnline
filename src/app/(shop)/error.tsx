"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 text-6xl">!</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--fg)" }}>
          Something went wrong
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--fg-muted)" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="btn-primary px-6 py-2.5 text-sm"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
