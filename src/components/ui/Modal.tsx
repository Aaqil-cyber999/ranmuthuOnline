"use client";

import { useEffect, useRef, ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 backdrop-blur-sm animate-fade-in"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizeClasses[size]} glass-strong rounded-2xl shadow-glass-lg animate-scale-in`}
        style={{ border: "1px solid var(--border)" }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-base font-semibold" style={{ color: "var(--fg)" }}>{title}</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              style={{ color: "var(--fg-faint)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "var(--fg-faint)"; }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
