"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {hasDiscount && (
            <div className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-0.5">
              <span className="text-[10px] font-bold text-white">-{discountPercent}%</span>
            </div>
          )}

          {product.stock < 1 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-lg px-3 py-1.5 text-xs font-medium text-white" style={{ background: "rgba(255,255,255,0.15)" }}>
                Out of Stock
              </span>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.stock < 1}
            className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-2 rounded-lg bg-brand-500 py-2 text-[11px] font-semibold text-white opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-brand-400 disabled:opacity-0 disabled:pointer-events-none"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add to Cart
          </button>
        </div>

        <div className="p-3">
          {product.category && (
            <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-400/70">
              {product.category.name}
            </p>
          )}
          <h3 className="mb-1 text-xs font-medium line-clamp-1 transition-colors"
            style={{ color: "var(--fg-muted)" }}
          >
            {product.name}
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold" style={{ color: "var(--fg)" }}>{formatPrice(displayPrice)}</span>
            {hasDiscount && (
              <span className="text-[10px] line-through" style={{ color: "var(--fg-faint)" }}>{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
