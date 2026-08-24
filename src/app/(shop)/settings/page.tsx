"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { formatPrice } from "@/lib/utils";

interface OrderLookupResult {
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

type SectionKey = "orders" | "appearance" | "support" | "account";

const SECTIONS: { key: SectionKey; label: string; icon: string; soon?: boolean }[] = [
  {
    key: "orders",
    label: "My Orders",
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z",
  },
  {
    key: "appearance",
    label: "Appearance",
    icon: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z",
  },
  {
    key: "support",
    label: "Help & Support",
    icon: "M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
  },
  {
    key: "account",
    label: "Account & Security",
    icon: "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z",
    soon: true,
  },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-500", label: "Pending" },
  confirmed: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Confirmed" },
  processing: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Processing" },
  shipped: { bg: "bg-purple-500/10", text: "text-purple-400", label: "Shipped" },
  delivered: { bg: "bg-emerald-500/10", text: "text-emerald-500", label: "Delivered" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-500", label: "Cancelled" },
};

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [section, setSection] = useState<SectionKey>("orders");

  const [phone, setPhone] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookedUp, setLookedUp] = useState(false);
  const [orders, setOrders] = useState<OrderLookupResult[]>([]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError("");
    setLookupLoading(true);
    try {
      const res = await fetch(`/api/orders/lookup?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || "Something went wrong");
        setOrders([]);
      } else {
        setOrders(data.orders || []);
        setLookedUp(true);
      }
    } catch {
      setLookupError("Could not reach the server. Please try again.");
      setOrders([]);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-6xl section-padding py-3 sm:py-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "var(--fg)" }}>Settings</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl section-padding pt-4 pb-10 sm:pt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr] lg:gap-8">
          {/* Sidebar */}
          <nav className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Settings sections">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => !s.soon && setSection(s.key)}
                disabled={s.soon}
                className={`flex flex-shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 lg:w-full ${
                  section === s.key ? "" : ""
                }`}
                style={
                  s.soon
                    ? { background: "transparent", color: "var(--fg-faint)", border: "1px dashed var(--border)", cursor: "not-allowed" }
                    : section === s.key
                    ? { background: "var(--surface)", color: "var(--fg)", border: "1px solid var(--border-strong)" }
                    : { background: "transparent", color: "var(--fg-muted)", border: "1px solid transparent" }
                }
              >
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
                <span className="whitespace-nowrap">{s.label}</span>
                {s.soon && (
                  <span className="ml-auto hidden rounded-full px-2 py-0.5 text-[10px] font-semibold lg:inline" style={{ background: "var(--surface)", color: "var(--fg-faint)" }}>
                    Soon
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="space-y-4">
            {/* ===== MY ORDERS ===== */}
            {section === "orders" && (
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <h2 className="text-base font-bold" style={{ color: "var(--fg)" }}>Track Your Orders</h2>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  Enter the phone number you used at checkout to see your orders and their current status.
                </p>

                <form onSubmit={handleLookup} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 XX XXX XXXX"
                    className="input-field flex-1"
                    aria-label="Phone number"
                  />
                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="btn-primary px-6 py-3 text-sm font-semibold disabled:opacity-50"
                  >
                    {lookupLoading ? "Searching…" : "Find Orders"}
                  </button>
                </form>

                {lookupError && (
                  <p className="mt-3 text-xs font-medium text-red-400">{lookupError}</p>
                )}

                {lookedUp && !lookupError && orders.length === 0 && (
                  <div className="mt-5 rounded-xl px-4 py-6 text-center" style={{ background: "var(--surface)" }}>
                    <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>No orders found</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--fg-muted)" }}>
                      We couldn&apos;t find any orders for this number.
                    </p>
                  </div>
                )}

                {orders.length > 0 && (
                  <div className="mt-5 space-y-2.5">
                    {orders.map((o) => {
                      const st = STATUS_STYLES[o.status] || STATUS_STYLES.pending;
                      return (
                        <div
                          key={o.orderNumber}
                          className="flex items-center justify-between gap-3 rounded-xl px-4 py-3.5"
                          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-mono text-xs font-bold" style={{ color: "var(--fg)" }}>{o.orderNumber}</p>
                            <p className="mt-0.5 text-[11px]" style={{ color: "var(--fg-muted)" }}>
                              {new Date(o.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}
                              {" · "}
                              {o.itemCount} {o.itemCount === 1 ? "item" : "items"}
                            </p>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-3">
                            <span className="text-sm font-bold" style={{ color: "var(--fg)" }}>{formatPrice(o.total)}</span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${st.bg} ${st.text}`}>{st.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ===== APPEARANCE ===== */}
            {section === "appearance" && (
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <h2 className="text-base font-bold" style={{ color: "var(--fg)" }}>Appearance</h2>
                <p className="mt-1 text-xs" style={{ color: "var(--fg-muted)" }}>Choose how the store looks on this device.</p>

                <button
                  onClick={toggleTheme}
                  className="mt-5 flex w-full items-center justify-between rounded-xl px-4 py-4 text-left transition-colors"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <span>
                    <span className="block text-sm font-semibold" style={{ color: "var(--fg)" }}>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
                    <span className="mt-0.5 block text-xs" style={{ color: "var(--fg-muted)" }}>Tap to switch theme</span>
                  </span>
                  <span
                    className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors"
                    style={{ background: theme === "dark" ? "#8b5cf6" : "var(--border-strong)" }}
                    aria-hidden="true"
                  >
                    <span
                      className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-[24px]" : "translate-x-[4px]"}`}
                    />
                  </span>
                </button>
              </div>
            )}

            {/* ===== SUPPORT ===== */}
            {section === "support" && (
              <>
                <div className="glass-card rounded-2xl p-5 sm:p-6">
                  <h2 className="text-base font-bold" style={{ color: "var(--fg)" }}>Contact Support</h2>
                  <p className="mt-1 text-xs" style={{ color: "var(--fg-muted)" }}>Our team replies during business hours.</p>
                  <a
                    href="https://wa.me/94779560026"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-4 w-full py-3.5 text-sm font-semibold"
                  >
                    Chat on WhatsApp — 077 956 0026
                  </a>
                </div>

                <div className="glass-card rounded-2xl p-5 sm:p-6">
                  <h2 className="text-base font-bold" style={{ color: "var(--fg)" }}>Delivery & Returns</h2>
                  <div className="mt-4 space-y-3 text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                    <p><span className="font-semibold" style={{ color: "var(--fg)" }}>Delivery:</span> Island-wide within 2–4 days. Rs 350 flat fee, free on orders over Rs 10,000.</p>
                    <p><span className="font-semibold" style={{ color: "var(--fg)" }}>Payment:</span> Cash on delivery — pay when your order arrives.</p>
                    <p><span className="font-semibold" style={{ color: "var(--fg)" }}>Returns:</span> 7-day easy exchange or refund on unused items.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
