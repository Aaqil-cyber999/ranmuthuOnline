"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { ProductType, CategoryType } from "@/types";
import ProductCard from "@/components/shop/ProductCard";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name" },
];

const priceRanges = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under Rs. 2,500", min: "", max: "2500" },
  { label: "Rs. 2,500 - 5,000", min: "2500", max: "5000" },
  { label: "Rs. 5,000 - 10,000", min: "5000", max: "10000" },
  { label: "Over Rs. 10,000", min: "10000", max: "" },
];

const categoryIcons: Record<string, string> = {
  electronics: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.141-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
  fashion: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
  "home-living": "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  beauty: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z",
  sports: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
};

function StorefrontContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const [searchInput, setSearchInput] = useState(search);

  const isFiltered = Boolean(search || category || minPrice || maxPrice || sort !== "newest");

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      if (Object.keys(updates).some((k) => ["category", "search", "minPrice", "maxPrice", "sort"].includes(k))) {
        params.delete("page");
      }
      return params.toString();
    },
    [searchParams]
  );

  const navigate = useCallback(
    (updates: Record<string, string>) => {
      router.push(`${pathname}?${createQueryString(updates)}`, { scroll: false });
    },
    [router, pathname, createQueryString]
  );

  // Load all products (filtered view)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (sort) params.set("sort", sort);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        params.set("page", String(page));
        params.set("limit", "24");

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setProducts(data.products || []);
          setTotalPages(data.pagination?.pages || 1);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [search, category, sort, minPrice, maxPrice, page]);

  // Load featured products (only when not filtering)
  useEffect(() => {
    if (isFiltered) { setFeaturedLoading(false); return; }
    let cancelled = false;
    async function load() {
      setFeaturedLoading(true);
      try {
        const res = await fetch("/api/products?featured=true&limit=6");
        const data = await res.json();
        if (!cancelled) setFeaturedProducts(data.products || []);
      } catch {
        if (!cancelled) setFeaturedProducts([]);
      } finally {
        if (!cancelled) setFeaturedLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isFiltered]);

  // Load categories
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch {}
    }
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: searchInput });
  };

  const activeFilters = [category, minPrice || maxPrice ? "price" : ""].filter(Boolean);

  return (
    <div className="min-h-screen">
      {/* ===== INTRO BANNER ===== */}
      {!isFiltered && (
        <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--border)" }}>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-brand-500/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-brand-400/5 rounded-full blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-1.5 pb-5 sm:py-10">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left: Text */}
              <div className="flex-1 max-w-xl">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>
                  Ranmuthu<span className="text-brand-400"> Fancy</span>
                </h1>
                <p className="mt-3 text-sm sm:text-base leading-relaxed max-w-md" style={{ color: "var(--fg-muted)" }}>
                  Quality products, beautifully curated. Browse our collection and find exactly what you need.
                </p>
                <div className="mt-4 flex flex-col items-start gap-2 text-xs" style={{ color: "var(--fg-faint)" }}>
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.141-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                    Island-wide delivery
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    Quality guaranteed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-brand-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp orders
                  </span>
                </div>
              </div>

              {/* Right: Animated fancy items */}
              <div className="hidden lg:flex items-center justify-center flex-1 relative h-48">
                {/* Big teddy bear - main */}
                <div className="absolute animate-float" style={{ animationDuration: "4s" }}>
                  <div className="text-8xl drop-shadow-lg select-none">🧸</div>
                </div>
                {/* Ring - top right */}
                <div className="absolute -top-2 right-4 animate-float" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}>
                  <div className="text-4xl drop-shadow-md select-none">💍</div>
                </div>
                {/* Sparkle - bottom left */}
                <div className="absolute bottom-0 left-0 animate-float" style={{ animationDuration: "5s", animationDelay: "1s" }}>
                  <div className="text-3xl drop-shadow-md select-none">✨</div>
                </div>
                {/* Gift - top left */}
                <div className="absolute -top-4 left-8 animate-float" style={{ animationDuration: "4.5s", animationDelay: "1.5s" }}>
                  <div className="text-3xl drop-shadow-md select-none">🎁</div>
                </div>
                {/* Band - bottom right */}
                <div className="absolute bottom-2 right-0 animate-float" style={{ animationDuration: "3.8s", animationDelay: "0.8s" }}>
                  <div className="text-3xl drop-shadow-md select-none">🎀</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== CATEGORIES STRIP ===== */}
      {!isFiltered && categories.length > 0 && (
        <section className="border-b" style={{ borderColor: "var(--border)" }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
              {categories.map((cat) => {
                const icon = categoryIcons[cat.slug] || categoryIcons.electronics;
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate({ category: cat.slug })}
                    className="flex items-center gap-2 flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all"
                    style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--fg-muted)", borderWidth: 1, borderStyle: "solid" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--fg)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--fg-muted)"; }}
                  >
                    <svg className="h-4 w-4 text-brand-400/70" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                    {cat.name}
                    {cat._count && (
                      <span className="text-[10px]" style={{ color: "var(--fg-faint)" }}>({cat._count.products})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURED PRODUCTS (home only, no filters active) ===== */}
      {!isFiltered && featuredProducts.length > 0 && (
        <section className="border-b" style={{ borderColor: "var(--border)" }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-400/70 mb-1">Featured</p>
                <h2 className="text-xl font-bold" style={{ color: "var(--fg)" }}>Popular Right Now</h2>
              </div>
              <button
                onClick={() => navigate({ sort: "newest" })}
                className="text-xs font-medium transition-colors"
                style={{ color: "var(--fg-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FULL CATALOGUE ===== */}
      <section className={isFiltered ? "pt-4" : ""}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Section header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--fg)" }}>
                {category
                  ? categories.find((c) => c.slug === category)?.name || "Products"
                  : search
                  ? `Results for "${search}"`
                  : "All Products"}
              </h2>
              <p className="mt-0.5 text-xs" style={{ color: "var(--fg-faint)" }}>
                {loading ? "Loading..." : `${products.length} products`}
              </p>
            </div>
          </div>

          {/* Filters bar */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {/* Search (mobile) */}
            <form onSubmit={handleSearch} className="flex-1 min-w-[180px] max-w-sm md:hidden">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--fg-faint)" }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-500/50"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--fg)", borderWidth: 1, borderStyle: "solid" }}
                />
              </div>
            </form>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => navigate({ sort: e.target.value })}
              className="rounded-lg px-3 py-2 text-sm outline-none cursor-pointer focus:border-brand-500/50 min-w-[150px]"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--fg-muted)", borderWidth: 1, borderStyle: "solid" }}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface-900">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm sm:hidden"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--fg-muted)", borderWidth: 1, borderStyle: "solid" }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              Filters
              {activeFilters.length > 0 && (
                <span className="h-4 w-4 rounded-full bg-brand-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Clear */}
            {activeFilters.length > 0 && (
              <button
                onClick={() => navigate({ category: "", minPrice: "", maxPrice: "" })}
                className="text-xs font-medium transition-colors"
                style={{ color: "var(--fg-faint)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-faint)")}
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {/* Sidebar */}
            <div className={`${showFilters ? "block" : "hidden"} w-full sm:block sm:w-52 flex-shrink-0`}>
              <div className="sticky top-24 space-y-5">
                {/* Categories */}
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--fg-faint)" }}>Categories</h3>
                  <div className="space-y-0.5">
                    <button
                      onClick={() => navigate({ category: "" })}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                        !category ? "bg-brand-500/10 text-brand-400 font-medium" : ""
                      }`}
                      style={!category ? undefined : { color: "var(--fg-muted)" }}
                      onMouseEnter={!category ? undefined : (e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; }}
                      onMouseLeave={!category ? undefined : (e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => navigate({ category: cat.slug })}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                          category === cat.slug ? "bg-brand-500/10 text-brand-400 font-medium" : ""
                        }`}
                        style={category === cat.slug ? undefined : { color: "var(--fg-muted)" }}
                        onMouseEnter={category === cat.slug ? undefined : (e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; }}
                        onMouseLeave={category === cat.slug ? undefined : (e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
                      >
                        {cat.name}
                        {cat._count && (
                          <span className="ml-1 text-[10px]" style={{ color: "var(--fg-faint)" }}>({cat._count.products})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--fg-faint)" }}>Price Range</h3>
                  <div className="space-y-0.5">
                    {priceRanges.map((range) => {
                      const isActive = range.min === minPrice && range.max === maxPrice;
                      return (
                        <button
                          key={range.label}
                          onClick={() => navigate({ minPrice: range.min, maxPrice: range.max })}
                          className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                            isActive ? "bg-brand-500/10 text-brand-400 font-medium" : ""
                          }`}
                          style={isActive ? undefined : { color: "var(--fg-muted)" }}
                          onMouseEnter={isActive ? undefined : (e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; }}
                          onMouseLeave={isActive ? undefined : (e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
                        >
                          {range.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden">
                      <div className="aspect-[3/4] skeleton" />
                      <div className="p-3 space-y-2">
                        <div className="h-2 w-12 skeleton" />
                        <div className="h-3 w-full skeleton" />
                        <div className="h-4 w-16 skeleton" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <EmptyState
                  icon={
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  }
                  title="No products found"
                  description="Try adjusting your search or filters."
                  action={{ label: "Clear Filters", href: "/" }}
                />
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => navigate({ page: String(p) })}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function StorefrontPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-brand-400 border-r-transparent" />
      </div>
    }>
      <StorefrontContent />
    </Suspense>
  );
}
