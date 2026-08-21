"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

interface FloatingCartProps {
  onOpen: () => void;
}

export default function FloatingCart({ onOpen }: FloatingCartProps) {
  const { items, getItemCount, getSubtotal } = useCart();
  const count = getItemCount();
  const total = getSubtotal();

  if (count === 0) return null;

  return (
    <button
      onClick={onOpen}
      className="fixed bottom-6 right-6 z-50 group"
      aria-label={`Open cart with ${count} items`}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-brand-500/90 backdrop-blur-xl px-4 py-3 shadow-glow-lg transition-all duration-300 hover:bg-brand-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.35)]">
        {/* Cart icon */}
        <div className="relative">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
          <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-surface-950">
            {count}
          </span>
        </div>
        {/* Info */}
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-white leading-tight">{count} {count === 1 ? "item" : "items"}</p>
          <p className="text-[11px] font-bold text-white/90">{formatPrice(total)}</p>
        </div>
        {/* Arrow */}
        <svg className="h-4 w-4 text-white/70 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </button>
  );
}
