import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white text-xs font-extrabold tracking-tight">
                RF
              </div>
              <span className="text-base font-bold" style={{ color: "var(--fg)" }}>
                Ranmuthu<span className="text-brand-400"> Fancy</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed" style={{ color: "var(--fg-faint)" }}>
              Quality products, beautifully curated. Your trusted online destination in Sri Lanka.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--fg-faint)" }}>Shop</h4>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: "All Products", href: "/" },
                { label: "New Arrivals", href: "/?sort=newest" },
                { label: "On Sale", href: "/?sort=price-asc" },
                { label: "Categories", href: "/" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors"
                    style={{ color: "var(--fg-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#60a5fa")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--fg-faint)" }}>Company</h4>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: "About Us", href: "/" },
                { label: "Contact", href: "/" },
                { label: "Privacy Policy", href: "/" },
                { label: "Terms of Service", href: "/" },
                { label: "Admin", href: "/admin/login" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors"
                    style={{ color: "var(--fg-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#60a5fa")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--fg-faint)" }}>Contact</h4>
            <ul className="mt-4 space-y-2.5">
              <li className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "var(--fg-faint)" }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span className="text-sm" style={{ color: "var(--fg-muted)" }}>info@ranmuthuancy.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "var(--fg-faint)" }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-sm" style={{ color: "var(--fg-muted)" }}>Sri Lanka</span>
              </li>
            </ul>
            <a
              href="https://wa.me/94779560026"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--fg-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-alt)";
                e.currentTarget.style.color = "var(--fg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface)";
                e.currentTarget.style.color = "var(--fg-muted)";
              }}
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--fg-faint)" }}>
            &copy; {year} Ranmuthu Fancy. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="transition-colors"
              style={{ color: "var(--fg-faint)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#60a5fa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-faint)")}
              aria-label="Facebook"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="#"
              className="transition-colors"
              style={{ color: "var(--fg-faint)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#60a5fa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-faint)")}
              aria-label="Instagram"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24 18.635 24 24.007 18.633 24.007 12.013 24.007 5.393 18.635 0 12.017 0z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
