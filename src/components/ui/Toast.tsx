"use client";

import { Toaster, toast } from "react-hot-toast";

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "rgba(23, 23, 23, 0.95)",
          color: "#fff",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
          padding: "0.75rem 1rem",
          boxShadow: "0 16px 48px -12px rgba(0, 0, 0, 0.5)",
        },
        success: {
          iconTheme: {
            primary: "#3b82f6",
            secondary: "#000000",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#171717",
          },
        },
      }}
    />
  );
}

export function showSuccess(message: string) {
  return toast.success(message);
}

export function showError(message: string) {
  return toast.error(message);
}

export function showLoading(message: string) {
  return toast.loading(message);
}

export { toast };
