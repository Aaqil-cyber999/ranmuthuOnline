"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { formatPrice } from "@/lib/utils";
import { showError } from "@/components/ui/Toast";

interface TrackedItem {
  name: string;
  variant: string | null;
  quantity: number;
  price: number;
}

interface TrackedOrder {
  trackingNumber: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerAddress: string | null;
  items: TrackedItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
}

interface AccountUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

type SectionKey = "orders" | "notifications" | "appearance" | "security" | "support";

const SECTIONS: { key: SectionKey; label: string; icon: string; soon?: boolean }[] = [
  {
    key: "orders",
    label: "My Orders",
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z",
  },
  {
    key: "notifications",
    label: "Notifications",
    soon: true,
    icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A48.592 48.592 0 0114 18.02l-2.292.792c-.863.299-1.798-.096-2.05-1.04a46.675 46.675 0 01-.406-1.693m10.24-9.805a48.602 48.602 0 00-10.25 1.72M4.5 19.5a48.667 48.667 0 003.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
  },
  {
    key: "appearance",
    label: "Appearance",
    icon: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z",
  },
  {
    key: "security",
    label: "Privacy & Security",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  },
  {
    key: "support",
    label: "Help & Support",
    icon: "M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
  },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-500", label: "Order Received" },
  confirmed: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Confirmed" },
  processing: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Processing" },
  ready: { bg: "bg-cyan-500/10", text: "text-cyan-400", label: "Ready for Delivery" },
  shipped: { bg: "bg-purple-500/10", text: "text-purple-400", label: "Out for Delivery" },
  completed: { bg: "bg-emerald-500/10", text: "text-emerald-500", label: "Delivered" },
  delivered: { bg: "bg-emerald-500/10", text: "text-emerald-500", label: "Delivered" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-500", label: "Cancelled" },
};

const TIMELINE_STEPS = [
  { key: "pending", label: "Order Received" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "ready", label: "Ready for Delivery" },
  { key: "shipped", label: "Out for Delivery" },
  { key: "completed", label: "Delivered" },
];

function statusStepIndex(status: string): number {
  switch (status) {
    case "pending": return 0;
    case "confirmed": return 1;
    case "processing": return 2;
    case "ready": return 3;
    case "shipped": return 4;
    case "delivered":
    case "completed": return 5;
    default: return 0;
  }
}

function SectionIcon({ path, className = "h-4 w-4" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [section, setSection] = useState<SectionKey>("orders");
  const [user, setUser] = useState<AccountUser | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const [trackingInput, setTrackingInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookedUp, setLookedUp] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("section");
    if (requested && ["orders", "notifications", "appearance", "security", "support"].includes(requested)) {
      setSection(requested as SectionKey);
    }
    const tracking = params.get("tracking");
    if (tracking) {
      const value = tracking.toUpperCase();
      setTrackingInput(value);
      runLookup(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setUser(data.authenticated ? data.user : null);
          setSessionLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setSessionLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      setUser(null);
      router.refresh();
    } catch {
      showError("Could not sign out. Please try again.");
    }
  };

  const runLookup = async (value: string) => {
    setLookupError("");
    setLookupLoading(true);
    try {
      const res = await fetch(`/api/orders/lookup?tracking=${encodeURIComponent(value.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || "Something went wrong");
        setOrder(null);
        setLookedUp(true);
      } else {
        setOrder(data.order || null);
        setLookedUp(true);
      }
    } catch {
      setLookupError("Could not reach the server. Please try again.");
      setOrder(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    runLookup(trackingInput);
  };

  const roleLabel = user?.role === "OWNER" ? "Owner" : "Staff";

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-7xl section-padding py-4 sm:py-5">
          <Link
            href="/"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: "var(--fg-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#60a5fa"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-muted)"; }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Shopping
          </Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "var(--fg)" }}>My Account</h1>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--fg-muted)" }}>
            Manage your orders, preferences and support options.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl section-padding pt-4 pb-12 sm:pt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
          {/* ===== Sidebar ===== */}
          <div className="space-y-5 lg:space-y-6">
            {/* Signed-in identity (staff only) */}
            {user && (
              <div className="glass-card hidden rounded-2xl p-4 lg:flex lg:items-center lg:gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" style={{ color: "var(--fg)" }}>{user.name}</p>
                  <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>{roleLabel} · Ranmuthu Fancy</p>
                </div>
              </div>
            )}

            <nav
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0"
              aria-label="Account sections"
            >
              {SECTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => !s.soon && setSection(s.key)}
                  disabled={s.soon}
                  className={`flex flex-shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 lg:w-full ${
                    s.soon ? "" : ""
                  }`}
                  style={
                    s.soon
                      ? { background: "transparent", color: "var(--fg-faint)", border: "1px dashed var(--border)", cursor: "not-allowed" }
                      : section === s.key
                      ? { background: "var(--surface)", color: "var(--fg)", border: "1px solid var(--border-strong)" }
                      : { background: "transparent", color: "var(--fg-muted)", border: "1px solid transparent" }
                  }
                >
                  <SectionIcon path={s.icon} />
                  <span className="whitespace-nowrap">{s.label}</span>
                  {s.soon && (
                    <span className="ml-auto hidden rounded-full px-2 py-0.5 text-[10px] font-semibold lg:inline" style={{ background: "var(--surface)", color: "var(--fg-faint)" }}>
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Store Management — visible only to authorised staff/owner */}
            {sessionLoaded && user && (
              <div className="lg:border-t lg:pt-5 space-y-3" style={{ borderColor: "var(--border)" }}>
                <Link
                  href="/admin"
                  className="group glass-card block rounded-2xl p-4 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--surface-alt)", color: "var(--fg)" }}>
                        <SectionIcon
                          className="h-[18px] w-[18px]"
                          path="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Store Management</p>
                        <p className="mt-0.5 text-[11px] leading-snug" style={{ color: "var(--fg-muted)" }}>
                          Products, orders, inventory &amp; settings
                        </p>
                      </div>
                    </div>
                    <svg
                      className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      style={{ color: "var(--fg-faint)" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                  <p className="mt-3 border-t pt-2.5 text-[11px]" style={{ borderColor: "var(--border)", color: "var(--fg-faint)" }}>
                    Signed in as {roleLabel.toLowerCase()}
                  </p>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{ color: "var(--fg-muted)", border: "1px solid var(--border)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
                >
                  <SectionIcon path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* ===== Content ===== */}
          <div className="space-y-4">
            {/* MY ORDERS */}
            {section === "orders" && (
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <h2 className="text-base font-bold" style={{ color: "var(--fg)" }}>Track Your Order</h2>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  Enter the tracking number from your order confirmation (e.g. RMX-7K4P-92QF).
                </p>

                <form onSubmit={handleLookup} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                    placeholder="RMX-XXXX-XXXX"
                    maxLength={13}
                    className="input-field flex-1 font-mono tracking-wider uppercase"
                    aria-label="Tracking number"
                  />
                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="btn-primary px-6 py-3 text-sm font-semibold disabled:opacity-50"
                  >
                    {lookupLoading ? "Searching…" : "Track Order"}
                  </button>
                </form>

                {lookupError && (
                  <div className="mt-4 rounded-xl px-4 py-3.5 text-xs font-medium text-red-400" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {lookupError}
                  </div>
                )}

                {lookedUp && !lookupError && order && (() => {
                  const st = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                  const cancelled = order.status === "cancelled";
                  const currentStep = statusStepIndex(order.status);
                  return (
                    <div className="mt-5 space-y-4">
                      {/* Header */}
                      <div
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3.5"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                      >
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>Tracking Number</p>
                          <p className="font-mono text-lg font-bold text-brand-400">{order.trackingNumber}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ${st.bg} ${st.text}`}>{st.label}</span>
                          <p className="mt-1 text-[11px]" style={{ color: "var(--fg-muted)" }}>
                            Placed {new Date(order.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      {cancelled ? (
                        <div className="rounded-xl px-4 py-4 text-sm font-medium text-red-400" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                          This order was cancelled. If you believe this is a mistake, contact us via WhatsApp.
                        </div>
                      ) : (
                        <div className="rounded-xl px-4 py-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                          <ol>
                            {TIMELINE_STEPS.map((step, i) => {
                              const done = i <= currentStep;
                              const isCurrent = i === currentStep;
                              const isLast = i === TIMELINE_STEPS.length - 1;
                              return (
                                <li key={step.key} className="relative flex gap-3.5 pb-6 last:pb-0">
                                  {!isLast && (
                                    <span
                                      aria-hidden="true"
                                      className={`absolute left-[9px] top-[22px] h-full w-[2px] ${done && i < currentStep ? "bg-brand-500" : ""}`}
                                      style={done && i < currentStep ? undefined : { background: "var(--border)" }}
                                    />
                                  )}
                                  <span
                                    className={`relative z-10 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                                      done ? "bg-brand-500 text-white" : ""
                                    }`}
                                    style={!done ? { background: "var(--surface)", border: "2px solid var(--border-strong)" } : isCurrent ? { boxShadow: "0 0 0 4px rgba(139,92,246,0.2)" } : undefined}
                                  >
                                    {done && (
                                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                      </svg>
                                    )}
                                  </span>
                                  <span className={`text-sm leading-5 ${isCurrent ? "font-bold" : "font-medium"}`} style={{ color: done ? "var(--fg)" : "var(--fg-muted)" }}>
                                    {step.label}
                                    {isCurrent && <span className="ml-2 rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-400">Current</span>}
                                  </span>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      )}

                      {/* Items + summary */}
                      <div className="rounded-xl px-4 py-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>Items</p>
                        <ul className="mt-2 space-y-1.5">
                          {order.items.map((item, i) => (
                            <li key={`${item.name}-${i}`} className="flex items-baseline justify-between gap-3 text-xs">
                              <span style={{ color: "var(--fg)" }}>
                                {item.name}
                                {item.variant ? <span style={{ color: "var(--fg-muted)" }}> ({item.variant})</span> : null}
                                <span style={{ color: "var(--fg-muted)" }}> ×{item.quantity}</span>
                              </span>
                              <span className="flex-shrink-0 font-medium" style={{ color: "var(--fg-muted)" }}>{formatPrice(item.price * item.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 space-y-1 border-t pt-3 text-xs" style={{ borderColor: "var(--border)" }}>
                          <div className="flex justify-between" style={{ color: "var(--fg-muted)" }}>
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between" style={{ color: "var(--fg-muted)" }}>
                            <span>Delivery</span>
                            <span>{order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}</span>
                          </div>
                          <div className="flex justify-between pt-1 text-sm font-bold" style={{ color: "var(--fg)" }}>
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                          </div>
                        </div>
                        {order.customerAddress && (
                          <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>Deliver To</p>
                            <p className="mt-1 text-xs" style={{ color: "var(--fg)" }}>{order.customerAddress}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* APPEARANCE */}
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

            {/* PRIVACY & SECURITY */}
            {section === "security" && (
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <h2 className="text-base font-bold" style={{ color: "var(--fg)" }}>Privacy &amp; Security</h2>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  Customer accounts are coming soon. Until then, your orders are tracked securely by the unique tracking number on your order confirmation — never share it with anyone you don&apos;t trust.
                </p>

                <div className="mt-5 space-y-2.5">
                  <div className="flex items-start gap-3 rounded-xl px-4 py-3.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Cash on delivery</p>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--fg-muted)" }}>No card details are ever stored on this site.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl px-4 py-3.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Order confirmations via WhatsApp</p>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--fg-muted)" }}>Every order is confirmed directly with our team.</p>
                    </div>
                  </div>
                </div>

                {user && (
                  <button
                    onClick={handleSignOut}
                    className="btn-secondary mt-5 w-full py-3 text-sm font-semibold"
                  >
                    Sign out of this device
                  </button>
                )}
              </div>
            )}

            {/* HELP & SUPPORT */}
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
                  <h2 className="text-base font-bold" style={{ color: "var(--fg)" }}>Delivery &amp; Returns</h2>
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
