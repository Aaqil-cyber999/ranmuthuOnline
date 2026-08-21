"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductType } from "@/types";
import { formatPrice } from "@/lib/utils";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const searchProducts = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=6`);
      const data = await res.json();
      setResults(data.products || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative mx-auto max-w-2xl px-4 pt-[10vh] animate-fade-in-up">
        <div className="glass-strong rounded-2xl overflow-hidden shadow-glass-lg border border-white/10">
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
            <svg className="h-5 w-5 flex-shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-base text-white placeholder-white/40 outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 items-center rounded-lg border border-white/10 px-3 text-xs font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white"
            >
              ESC
            </button>
          </form>

          {/* Results */}
          {query.trim().length >= 2 && (
            <div className="max-h-[50vh] overflow-y-auto px-4 py-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-400 border-r-transparent" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((product) => {
                    const images: string[] = (() => {
                      try {
                        return JSON.parse(product.images);
                      } catch {
                        return [];
                      }
                    })();

                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-white/5"
                      >
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
                          <Image
                            src={images[0] || "/placeholder-product.png"}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-white truncate">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-semibold text-brand-400">
                              {formatPrice(product.salePrice ?? product.price)}
                            </span>
                            {product.salePrice && (
                              <span className="text-xs text-white/30 line-through">{formatPrice(product.price)}</span>
                            )}
                          </div>
                        </div>
                        <svg className="h-4 w-4 flex-shrink-0 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    );
                  })}
                  <Link
                    href={`/products?search=${encodeURIComponent(query.trim())}`}
                    onClick={onClose}
                    className="flex items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    View all results for &ldquo;{query}&rdquo;
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-white/50">No products found for &ldquo;{query}&rdquo;</p>
                  <p className="mt-1 text-xs text-white/30">Try different keywords</p>
                </div>
              )}
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="px-6 py-4">
              <p className="text-xs font-medium uppercase tracking-wider text-white/30 mb-3">Popular</p>
              <div className="flex flex-wrap gap-2">
                {["Electronics", "Fashion", "Beauty", "Home", "Sports"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
