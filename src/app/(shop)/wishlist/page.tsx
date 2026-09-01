"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { showSuccess } from "@/components/ui/Toast";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (item: typeof items[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.salePrice ?? item.price,
      image: item.image,
      stock: item.stock,
    });
    removeItem(item.id);
    showSuccess(item.name + " moved to cart");
  };

  return (
    <div className="min-h-screen">
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-[1600px] section-padding py-4 sm:py-5">
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
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "var(--fg)" }}>My Wishlist</h1>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--fg-muted)" }}>
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] section-padding py-6 sm:py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="h-16 w-16 mb-4" style={{ color: "var(--fg-faint)" }} fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <h2 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Your wishlist is empty</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>Tap the heart icon on any product to save it here.</p>
            <Link
              href="/"
              className="btn-primary mt-6 px-6 py-2.5 text-sm font-semibold rounded-xl"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => {
              const displayPrice = item.salePrice ?? item.price;
              const hasDiscount = item.salePrice !== null && item.salePrice < item.price;
              return (
                <div key={item.id} className="group rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <Link href={`/products/${item.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden" style={{ background: "var(--surface)" }}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      {hasDiscount && (
                        <div className="absolute left-1 top-1 rounded-md bg-red-500 px-1.5 py-0.5">
                          <span className="text-[9px] font-bold text-white">Sale</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-3">
                    <Link href={`/products/${item.slug}`}>
                      <h3 className="text-xs font-medium line-clamp-1 transition-colors hover:underline" style={{ color: "var(--fg)" }}>
                        {item.name}
                      </h3>
                    </Link>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-sm font-bold" style={{ color: "var(--fg)" }}>{formatPrice(displayPrice)}</span>
                      {hasDiscount && (
                        <span className="text-[10px] line-through" style={{ color: "var(--fg-faint)" }}>{formatPrice(item.price)}</span>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={item.stock < 1}
                        className="flex-1 rounded-lg py-2 text-[11px] font-semibold transition-colors disabled:opacity-30"
                        style={{ background: "var(--bg)", color: "var(--fg)", border: "1px solid var(--border)" }}
                        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => { removeItem(item.id); showSuccess("Removed from wishlist"); }}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
                        style={{ color: "var(--fg-faint)", border: "1px solid var(--border)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#ef4444"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-faint)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                        aria-label="Remove from wishlist"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
