import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

export default function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-solid border-brand-400 border-r-transparent align-middle",
        sizeClasses[size],
        className
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
