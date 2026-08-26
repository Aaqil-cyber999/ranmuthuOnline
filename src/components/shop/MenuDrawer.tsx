"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

interface AccountUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MenuItem {
  label: string;
  href: string;
  icon: string;
}

const ICONS = {
  home: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75",
  bag: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z",
  grid: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  sparkles:
    "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z",
  tag: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z",
  user:
    "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z",
  receipt:
    "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z",
  heart:
    "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  pin: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  info: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
  phone:
    "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  truck:
    "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.141-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
  returns:
    "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99",
  faq: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z",
  cog: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  globe:
    "M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802",
  currency:
    "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z",
  store:
    "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z",
  chat:
    "M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
};

const SHOP_ITEMS: MenuItem[] = [
  { label: "Home", href: "/", icon: ICONS.home },
  { label: "Shop All", href: "/#shop", icon: ICONS.bag },
  { label: "Categories", href: "/#categories", icon: ICONS.grid },
  { label: "New Arrivals", href: "/?sort=newest", icon: ICONS.sparkles },
  { label: "Offers & Discounts", href: "/?sale=true", icon: ICONS.tag },
];

const ACCOUNT_ITEMS: MenuItem[] = [
  { label: "My Account", href: "/settings", icon: ICONS.user },
  { label: "My Orders", href: "/settings?section=orders", icon: ICONS.receipt },
  { label: "Wishlist", href: "/settings", icon: ICONS.heart },
  { label: "Track Order", href: "/settings?section=orders", icon: ICONS.pin },
];

const INFO_ITEMS: MenuItem[] = [
  { label: "About Us", href: "/", icon: ICONS.info },
  { label: "Contact Us", href: "/settings?section=support", icon: ICONS.phone },
  { label: "Delivery Information", href: "/settings?section=support", icon: ICONS.truck },
  { label: "Returns & Refunds", href: "/settings?section=support", icon: ICONS.returns },
  { label: "FAQ", href: "/settings?section=support", icon: ICONS.faq },
];

function Item({ item }: { item: MenuItem }) {
  return (
    <Link
      href={item.href}
      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
      style={{ color: "var(--fg-muted)" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
    >
      <svg className="h-[18px] w-[18px] flex-shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
      </svg>
      <span>{item.label}</span>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--fg-faint)" }}>
      {children}
    </p>
  );
}

export default function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Fetch session each time the drawer opens (cheap request, keeps role fresh)
  useEffect(() => {
    if (!open || sessionLoaded) return;
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
        if (!cancelled) {
          setUser(null);
          setSessionLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, sessionLoaded]);

  // Lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const roleLabel = user?.role === "OWNER" ? "Owner" : "Staff";

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ background: "var(--overlay)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`fixed inset-y-0 right-0 z-[61] flex w-[86vw] max-w-sm transform flex-col border-l shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "var(--bg)", borderColor: "var(--border)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b px-4 py-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-xs font-extrabold tracking-tight text-white">
              RF
            </div>
            <span className="text-base font-bold tracking-tight" style={{ color: "var(--fg)" }}>
              Menu
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--fg-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-2 pb-8">
          <SectionLabel>Shop</SectionLabel>
          <div className="space-y-0.5">
            {SHOP_ITEMS.map((item) => (
              <Item key={item.label} item={item} />
            ))}
          </div>

          <SectionLabel>My Account</SectionLabel>
          <div className="space-y-0.5">
            {ACCOUNT_ITEMS.map((item) => (
              <Item key={item.label} item={item} />
            ))}
          </div>

          <SectionLabel>Information</SectionLabel>
          <div className="space-y-0.5">
            {INFO_ITEMS.map((item) => (
              <Item key={item.label} item={item} />
            ))}
          </div>

          <SectionLabel>Settings</SectionLabel>
          <div className="space-y-0.5">
            <Item item={{ label: "Settings", href: "/settings", icon: ICONS.cog }} />
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium"
              style={{ color: "var(--fg-muted)" }}
            >
              <svg className="h-[18px] w-[18px] flex-shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.globe} />
              </svg>
              <span>Language</span>
              <span className="ml-auto text-xs" style={{ color: "var(--fg-faint)" }}>English</span>
            </div>
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium"
              style={{ color: "var(--fg-muted)" }}
            >
              <svg className="h-[18px] w-[18px] flex-shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.currency} />
              </svg>
              <span>Currency</span>
              <span className="ml-auto text-xs" style={{ color: "var(--fg-faint)" }}>LKR</span>
            </div>
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors"
              style={{ color: "var(--fg-muted)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
            >
              <svg className="h-[18px] w-[18px] flex-shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                {theme === "dark" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                )}
              </svg>
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>

          {/* Business access — separated, subtle */}
          <div className="mt-5 border-t px-2 pt-4" style={{ borderColor: "var(--border)" }}>
            <p className="px-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--fg-faint)" }}>
              Business Access
            </p>

            {!sessionLoaded && (
              <div className="skeleton mx-4 my-2 h-10 rounded-xl" aria-hidden="true" />
            )}

            {sessionLoaded && user === null && (
              <Link
                href="/admin/login"
                className="group flex items-center justify-between rounded-xl px-4 py-3 transition-colors"
                style={{ color: "var(--fg-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
              >
                <span className="text-sm font-medium">Staff / Admin Login</span>
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            )}

            {user && (
              <Link
                href="/admin"
                className="group flex items-center justify-between rounded-xl px-4 py-3 transition-colors"
                style={{ color: "var(--fg-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
              >
                <span>
                  <span className="block text-sm font-medium">Store Management</span>
                  <span className="mt-0.5 block text-[11px]" style={{ color: "var(--fg-faint)" }}>
                    Signed in as {roleLabel.toLowerCase()}
                  </span>
                </span>
                <svg className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            )}
          </div>

          {/* Help & Support — bottom */}
          <div className="mt-4 border-t px-2 pt-3" style={{ borderColor: "var(--border)" }}>
            <Item item={{ label: "Help & Support", href: "/settings?section=support", icon: ICONS.chat }} />
          </div>
        </nav>
      </aside>
    </>
  );
}
