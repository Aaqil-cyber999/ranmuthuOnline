"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { showError } from "@/components/ui/Toast";

const DELIVERY_FEE = 350;
const FREE_DELIVERY_MIN = 10000;
const ADMIN_WHATSAPP = "+94779560026";

function buildWhatsAppLink(params: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: { name: string; quantity: number; price: number; variant?: string }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  trackingNumber: string;
}): string {
  const fmt = (n: number) => `Rs. ${n.toLocaleString("en-LK")}`;
  let msg = `*New Order - ${params.orderNumber}*\n\n`;
  msg += `*Name:* ${params.customerName}\n`;
  msg += `*Phone:* ${params.customerPhone}\n`;
  if (params.customerAddress) msg += `*Address:* ${params.customerAddress}\n`;
  msg += `\n*Items:*\n`;
  msg += `-`.repeat(30) + "\n";
  params.items.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.name}`;
    if (item.variant) msg += ` (${item.variant})`;
    msg += `\n   Qty: ${item.quantity} x ${fmt(item.price)} = ${fmt(item.quantity * item.price)}\n`;
  });
  msg += `-`.repeat(30) + "\n";
  msg += `*Subtotal:* ${fmt(params.subtotal)}\n`;
  if (params.deliveryFee > 0) msg += `*Delivery:* ${fmt(params.deliveryFee)}\n`;
  msg += `*Total:* ${fmt(params.total)}\n`;
  if (params.trackingNumber) msg += `*Tracking:* ${params.trackingNumber}\n`;
  msg += `\n${new Date().toLocaleString("en-LK")}`;

  const phone = ADMIN_WHATSAPP.replace(/[^0-9]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      router.replace("/cart");
    }
  }, [items.length, router, orderPlaced]);

  if (items.length === 0 && !orderPlaced) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const digits = form.phone.replace(/[\s\-()]/g, "");
      const validFormats = /^(\+?94|0)?7\d{8}$/.test(digits);
      if (!validFormats) newErrors.phone = "Enter a valid Sri Lankan phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name.trim(),
          customerPhone: form.phone.trim(),
          customerAddress: form.address.trim() || undefined,
          deliveryFee: String(deliveryFee),
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            variant: item.variant || null,
          })),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.order) {
        showError(data.error || "Could not place your order. Please try again.");
        setSubmitting(false);
        return;
      }

      const waLink = buildWhatsAppLink({
        orderNumber: data.order.orderNumber,
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        customerAddress: form.address.trim() || undefined,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          variant: item.variant || undefined,
        })),
        subtotal,
        deliveryFee,
        total,
        trackingNumber: data.order.trackingNumber || "",
      });

      setOrderPlaced(true);
      clearCart();
      router.push(
        `/order-success?order=${encodeURIComponent(data.order.orderNumber)}` +
        `&tracking=${encodeURIComponent(data.order.trackingNumber || "")}` +
        (waLink ? `&wa=${encodeURIComponent(waLink)}` : "")
      );
    } catch {
      showError("Could not place your order. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-[1600px] section-padding py-3 sm:py-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl" style={{ color: "var(--fg)" }}>Checkout</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mx-auto max-w-[1600px] section-padding pt-4 sm:pt-6 lg:pt-8 pb-8 sm:pb-10">
          <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-2xl p-4 sm:p-6 lg:p-8">
                <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>Contact Information</h2>
                <div className="mt-4 sm:mt-5 space-y-4 sm:space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium mb-2" style={{ color: "var(--fg-muted)" }}>Full Name *</label>
                    <input
                      id="name" name="name" type="text" value={form.name} onChange={handleChange}
                      className={`input-field ${errors.name ? "!border-red-500/50 !ring-red-500/20" : ""}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium mb-2" style={{ color: "var(--fg-muted)" }}>Phone Number *</label>
                    <input
                      id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                      className={`input-field ${errors.phone ? "!border-red-500/50 !ring-red-500/20" : ""}`}
                      placeholder="+94 XX XXX XXXX"
                    />
                    {errors.phone && <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-xs font-medium mb-2" style={{ color: "var(--fg-muted)" }}>Delivery Address</label>
                    <textarea
                      id="address" name="address" value={form.address} onChange={handleChange} rows={3}
                      className="input-field"
                      placeholder="Enter your delivery address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="glass-card rounded-2xl p-4 sm:p-6 lg:sticky lg:top-24">
                <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>Order Summary</h2>
                <div className="mt-4 sm:mt-5 max-h-64 space-y-3 overflow-y-auto scrollbar-hide">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variant || ""}`} className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--fg)" }}>{item.name}</p>
                        {item.variant && <p className="text-xs" style={{ color: "var(--fg-muted)" }}>{item.variant}</p>}
                        <p className="text-xs" style={{ color: "var(--fg-muted)" }}>Qty: {item.quantity} x {formatPrice(item.price)}</p>
                      </div>
                      <span className="flex-shrink-0 text-sm font-medium" style={{ color: "var(--fg)" }}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 sm:mt-5 space-y-2 divider pt-4 sm:pt-5">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--fg-muted)" }}>Subtotal</span>
                    <span className="font-medium" style={{ color: "var(--fg)" }}>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--fg-muted)" }}>Delivery</span>
                    {deliveryFee === 0 ? (
                      <span className="font-medium text-emerald-400">Free</span>
                    ) : (
                      <span className="font-medium" style={{ color: "var(--fg)" }}>{formatPrice(deliveryFee)}</span>
                    )}
                  </div>
                  <div className="flex justify-between divider pt-2">
                    <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Total</span>
                    <span className="text-lg font-bold" style={{ color: "var(--fg)" }}>{formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-5 sm:mt-6 py-3.5 rounded-xl bg-emerald-500 font-semibold text-white transition-all hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:bg-emerald-500"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {submitting ? "Placing Order…" : "Order via WhatsApp"}
                </button>
                <Link href="/cart" className="btn-secondary w-full mt-3 py-3 flex items-center justify-center">
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
