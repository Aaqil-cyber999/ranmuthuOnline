"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import CartItem from "@/components/shop/CartItem";
import EmptyState from "@/components/ui/EmptyState";

const DELIVERY_FEE = 350;
const FREE_DELIVERY_MIN = 10000;

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal, getItemCount } = useCart();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const deliveryFee = subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl section-padding py-16">
        <EmptyState
          icon={
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
          }
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Discover something you'll love."
          action={{ label: "Start Shopping", href: "/products" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-7xl section-padding py-10">
          <h1 className="text-3xl font-bold sm:text-4xl" style={{ color: "var(--fg)" }}>
            Shopping Cart
            <span className="ml-3 text-lg font-normal" style={{ color: "var(--fg-muted)" }}>({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl section-padding py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem
                key={`${item.id}-${item.variant || ""}`}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div>
            <div className="glass-card rounded-2xl p-6 sticky top-24">
              <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>Order Summary</h2>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--fg-muted)" }}>Subtotal</span>
                  <span className="font-medium" style={{ color: "var(--fg)" }}>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--fg-muted)" }}>Delivery</span>
                  {deliveryFee === 0 ? (
                    <span className="font-medium text-emerald-400">Free</span>
                  ) : (
                    <span className="font-medium" style={{ color: "var(--fg)" }}>{formatPrice(deliveryFee)}</span>
                  )}
                </div>
                {deliveryFee > 0 && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                    <p className="text-xs text-emerald-400">
                      Add {formatPrice(FREE_DELIVERY_MIN - subtotal)} more for free delivery!
                    </p>
                  </div>
                )}
                <div className="divider" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Total</span>
                  <span className="text-xl font-bold" style={{ color: "var(--fg)" }}>{formatPrice(total)}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-primary w-full mt-6 py-3.5">
                Proceed to Checkout
              </Link>
              <Link href="/" className="btn-secondary w-full mt-3 py-3 flex items-center justify-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
