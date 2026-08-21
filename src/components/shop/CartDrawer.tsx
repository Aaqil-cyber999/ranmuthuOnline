"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getSubtotal, getItemCount } = useCart();

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md animate-slide-in-right">
        <div className="flex h-full flex-col glass-strong" style={{ borderLeft: "1px solid var(--border)" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>Your Cart</h2>
              {itemCount > 0 && (
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-brand-500/15 px-2 text-xs font-semibold text-brand-400">
                  {itemCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              style={{ color: "var(--fg-faint)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface)";
                e.currentTarget.style.color = "var(--fg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "";
                e.currentTarget.style.color = "var(--fg-faint)";
              }}
              aria-label="Close cart"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl" style={{ background: "var(--surface)" }}>
                  <svg className="h-10 w-10 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium" style={{ color: "var(--fg-muted)" }}>Your cart is empty</h3>
                <p className="mt-1 text-xs" style={{ color: "var(--fg-faint)" }}>Discover something you&apos;ll love.</p>
                <Link
                  href="/"
                  onClick={onClose}
                  className="mt-6 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-400 hover:shadow-glow"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.variant || ""}`}
                    className="flex gap-4 rounded-xl p-3 transition-colors"
                    style={{ background: "var(--surface)", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg" style={{ background: "var(--surface)" }}>
                      <Image
                        src={item.image || "/placeholder-product.png"}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <h3 className="text-sm font-medium truncate" style={{ color: "var(--fg)" }}>{item.name}</h3>
                        {item.variant && (
                          <p className="text-xs" style={{ color: "var(--fg-faint)" }}>{item.variant}</p>
                        )}
                        <p className="mt-0.5 text-sm font-semibold text-brand-400">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                            disabled={item.quantity <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all disabled:opacity-30"
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
                          <span className="w-8 text-center text-sm font-medium" style={{ color: "var(--fg)" }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                            disabled={item.quantity >= item.stock}
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all disabled:opacity-30"
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
                        <button
                          onClick={() => removeItem(item.id, item.variant)}
                          style={{ color: "var(--fg-faint)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-faint)")}
                          aria-label={`Remove ${item.name}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-6 py-5 space-y-4" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--fg-muted)" }}>Subtotal</span>
                <span className="text-lg font-bold" style={{ color: "var(--fg)" }}>{formatPrice(subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-400 hover:shadow-glow"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-medium transition-all"
                style={{ border: "1px solid var(--border)", color: "var(--fg-muted)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.color = "var(--fg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "";
                  e.currentTarget.style.color = "var(--fg-muted)";
                }}
              >
                View Full Cart
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
