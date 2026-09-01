"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/utils";
import { showSuccess } from "@/components/ui/Toast";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    images: string;
    stock: number;
    category?: { name: string } | null;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();
  const isWishlisted = hasItem(product.id);

  const images: string[] = (() => {
    try {
      const parsed = JSON.parse(product.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const imageUrl = images[0] || "/placeholder-product.png";
  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock < 1) return;
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      image: imageUrl,
      stock: product.stock,
    });
    showSuccess(product.name + " added to cart");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      salePrice: product.salePrice,
      image: imageUrl,
      stock: product.stock,
    });
    showSuccess(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <Link href={"/products/" + product.slug} className="group block">
      <div className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="relative aspect-square overflow-hidden" style={{ background: "var(--surface)" }}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 17vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {hasDiscount && (
            <div className="absolute left-1 top-1 rounded-md bg-red-500 px-1.5 py-0.5">
              <span className="text-[9px] font-bold text-white sm:text-[10px]">-{discountPercent}%</span>
            </div>
          )}

          <button
            onClick={handleToggleWishlist}
            className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200"
            style={{ background: "rgba(0,0,0,0.4)" }}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg className="h-3.5 w-3.5" fill={isWishlisted ? "#ef4444" : "none"} viewBox="0 0 24 24" strokeWidth="1.5" stroke={isWishlisted ? "#ef4444" : "white"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>

          {product.stock < 1 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-lg px-3 py-1.5 text-xs font-medium text-white" style={{ background: "rgba(255,255,255,0.15)" }}>
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="p-2 sm:p-3">
          {product.category && (
            <p className="mb-0.5 hidden text-[9px] font-semibold uppercase tracking-wider text-brand-400/70 sm:block">
              {product.category.name}
            </p>
          )}
          <h3 className="mb-0.5 sm:mb-1 text-[11px] sm:text-xs font-medium line-clamp-1 transition-colors"
            style={{ color: "var(--fg-muted)" }}
          >
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs sm:text-sm font-bold" style={{ color: "var(--fg)" }}>{formatPrice(displayPrice)}</span>
              {hasDiscount && (
                <span className="hidden text-[10px] line-through sm:inline" style={{ color: "var(--fg-faint)" }}>{formatPrice(product.price)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock < 1}
              aria-label={`Add ${product.name} to cart`}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white transition-colors hover:bg-brand-400 disabled:opacity-40 disabled:pointer-events-none"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
