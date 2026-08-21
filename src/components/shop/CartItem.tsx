"use client";

import Image from "next/image";
import { CartItem as CartItemType } from "@/types";
import { formatPrice } from "@/lib/utils";

type CartItemProps = {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number, variant?: string) => void;
  onRemove: (id: string, variant?: string) => void;
};

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const lineTotal = item.price * item.quantity;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex gap-4 sm:gap-5">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24" style={{ background: "var(--surface)" }}>
        <Image
          src={item.image || "/placeholder-product.png"}
          alt={item.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold sm:text-base truncate" style={{ color: "var(--fg)" }}>{item.name}</h3>
            {item.variant && (
              <p className="mt-0.5 text-xs" style={{ color: "var(--fg-faint)" }}>{item.variant}</p>
            )}
            <p className="mt-1 text-sm font-semibold text-brand-400">{formatPrice(item.price)}</p>
          </div>
          <button
            onClick={() => onRemove(item.id, item.variant)}
            className="flex-shrink-0 rounded-lg p-1.5 transition-colors"
            style={{ color: "var(--fg-faint)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-faint)")}
            aria-label={`Remove ${item.name}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.variant)}
              disabled={item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all disabled:opacity-30"
              style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "var(--border)", color: "var(--fg-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface)";
                e.currentTarget.style.color = "var(--fg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "";
                e.currentTarget.style.color = "var(--fg-muted)";
              }}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" d="M5 12h14" />
              </svg>
            </button>
            <span className="w-8 text-center text-sm font-semibold" style={{ color: "var(--fg)" }}>{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.variant)}
              disabled={item.quantity >= item.stock}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all disabled:opacity-30"
              style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "var(--border)", color: "var(--fg-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface)";
                e.currentTarget.style.color = "var(--fg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "";
                e.currentTarget.style.color = "var(--fg-muted)";
              }}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
          <p className="text-sm font-bold sm:text-base" style={{ color: "var(--fg)" }}>{formatPrice(lineTotal)}</p>
        </div>
      </div>
    </div>
  );
}
