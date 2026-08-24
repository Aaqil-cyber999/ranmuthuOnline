"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductType } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { showSuccess } from "@/components/ui/Toast";
import ProductCard from "@/components/shop/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${params.slug}`);
        if (!res.ok) {
          router.replace("/");
          return;
        }
        const data = await res.json();
        setProduct(data.product);
        setSelectedVariant(data.product?.variants?.[0]?.value || null);

        if (data.product?.categoryId) {
          try {
            const relRes = await fetch(`/api/products?category=${data.product.category?.slug}&limit=4`);
            const relData = await relRes.json();
            setRelatedProducts((relData.products || []).filter((p: ProductType) => p.id !== data.product.id).slice(0, 4));
          } catch {}
        }
      } catch {
        router.replace("/");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug, router]);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") setSelectedImage((prev) => product ? (prev + 1) % images.length : prev);
      if (e.key === "ArrowLeft") setSelectedImage((prev) => product ? (prev - 1 + images.length) % images.length : prev);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, closeLightbox, product]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl section-padding py-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.8fr_1fr]">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 w-24 skeleton" />
            <div className="h-8 w-3/4 skeleton" />
            <div className="h-6 w-20 skeleton" />
            <div className="h-20 w-full skeleton" />
            <div className="h-12 w-full skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images: string[] = (() => {
    try {
      const parsed = JSON.parse(product.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;
  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 5;

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      image: images[0] || "/placeholder-product.png",
      stock: product.stock,
      variant: selectedVariant || undefined,
      quantity,
    });
    setAddedToCart(true);
    showSuccess(`${product.name} added to cart`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-7xl section-padding py-2">
          <nav className="flex items-center gap-1 text-[11px]" style={{ color: "var(--fg-muted)" }}>
            <Link href="/" className="hover:underline underline-offset-2 transition-colors" style={{ color: "var(--fg-faint)" }}>Home</Link>
            <span style={{ color: "var(--fg-faint)" }}>/</span>
            {product.category && (
              <>
                <Link href={`/?category=${product.category.slug}`} className="hover:underline underline-offset-2 transition-colors" style={{ color: "var(--fg-faint)" }}>{product.category.name}</Link>
                <span style={{ color: "var(--fg-faint)" }}>/</span>
              </>
            )}
            <span className="truncate max-w-[200px]" style={{ color: "var(--fg)" }}>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product */}
      <div className="mx-auto max-w-4xl section-padding py-3 lg:py-4">
        <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-[0.8fr_1fr]">
          {/* Images */}
          <div className="lg:sticky lg:top-16 lg:self-start">
            <div
              className="relative aspect-square w-full max-w-[220px] sm:max-w-[280px] lg:max-w-full overflow-hidden rounded-lg cursor-zoom-in group"
              style={{ background: "var(--surface)", borderColor: "var(--border)", borderWidth: 1, borderStyle: "solid" }}
              onClick={() => images.length > 0 && setLightboxOpen(true)}
            >
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage] || images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <svg className="h-14 w-14" style={{ color: "var(--fg-faint)" }} fill="none" viewBox="0 0 24 24" strokeWidth="0.75" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              )}
              {hasDiscount && (
                <div className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-0.5 shadow">
                  <span className="text-[10px] font-bold text-white">-{discountPercent}%</span>
                </div>
              )}
              {images.length > 1 && (
                <div className="absolute bottom-2 right-2 rounded px-1.5 py-0.5 text-[10px] font-medium shadow" style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
                  {selectedImage + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-1.5 flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-9 w-9 flex-shrink-0 overflow-hidden rounded transition-all duration-200 ${
                      selectedImage === i
                        ? "ring-2 ring-brand-500 ring-offset-1 ring-offset-white/0"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    style={selectedImage !== i ? { borderColor: "var(--border)" } : undefined}
                  >
                    <Image src={img} alt="" fill sizes="36px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.category && (
              <Link href={`/?category=${product.category.slug}`} className="text-[10px] font-semibold uppercase tracking-widest text-brand-500 hover:text-brand-400 transition-colors mb-1 w-fit">
                {product.category.name}
              </Link>
            )}

            <h1 className="text-base font-bold sm:text-lg leading-snug" style={{ color: "var(--fg)" }}>
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
              <span className="text-lg font-extrabold" style={{ color: "var(--fg)" }}>
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xs line-through" style={{ color: "var(--fg-faint)" }}>{formatPrice(product.price)}</span>
                  <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-500">
                    Save {formatPrice(product.price - displayPrice!)}
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="mt-1.5">
              {inStock ? (
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${lowStock ? "text-amber-500" : "text-emerald-500"}`}>
                  <span className={`h-1 w-1 rounded-full ${lowStock ? "bg-amber-500" : "bg-emerald-500"}`} />
                  {lowStock ? `Only ${product.stock} left` : "In Stock"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500">
                  <span className="h-1 w-1 rounded-full bg-red-500" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-2">
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>{product.description}</p>
              </div>
            )}

            {/* Divider */}
            <div className="mt-2" style={{ borderTop: "1px solid var(--border)" }} />

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-2">
                <p className="text-[11px] font-semibold mb-1" style={{ color: "var(--fg)" }}>
                  {product.variants[0].name}: <span className="font-normal" style={{ color: "var(--fg-muted)" }}>{selectedVariant}</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.value)}
                      className={`rounded border px-2 py-0.5 text-[11px] font-medium transition-all duration-150 ${
                        selectedVariant === v.value
                          ? "border-brand-500 bg-brand-500/10 text-brand-500"
                          : "hover:border-opacity-60"
                      }`}
                      style={selectedVariant !== v.value ? { borderColor: "var(--border)", color: "var(--fg-muted)" } : undefined}
                    >
                      {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="mt-2 space-y-2">
              <div>
                <p className="text-[11px] font-semibold mb-1" style={{ color: "var(--fg)" }}>Quantity</p>
                <div className="inline-flex items-center rounded" style={{ border: "1px solid var(--border)" }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-l transition-colors"
                    style={{ color: "var(--fg-muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-7 text-center text-[11px] font-bold tabular-nums" style={{ color: "var(--fg)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="flex h-7 w-7 items-center justify-center rounded-r transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{ color: "var(--fg-muted)" }}
                    onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="btn-primary w-full py-2 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                {addedToCart ? (
                  <span className="flex items-center justify-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Added to Cart
                  </span>
                ) : inStock ? (
                  <span className="flex items-center justify-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                    </svg>
                    Add to Cart
                  </span>
                ) : (
                  "Out of Stock"
                )}
              </button>

              <Link
                href="/"
                className="btn-secondary w-full flex items-center justify-center py-1.5 text-xs"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {[
                { icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.141-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12", label: "Fast Delivery" },
                { icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", label: "Quality Assured" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 rounded px-2 py-1.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <svg className="h-3 w-3 flex-shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon} />
                  </svg>
                  <span className="text-[10px] font-medium" style={{ color: "var(--fg-muted)" }}>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-8 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
            <h2 className="text-sm font-bold mb-3" style={{ color: "var(--fg)" }}>You Might Also Like</h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-[101] flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev - 1 + images.length) % images.length); }}
                className="absolute left-4 z-[110] flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev + 1) % images.length); }}
                className="absolute right-4 z-[110] flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          <div className="relative max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selectedImage]}
              alt={product.name}
              width={1200}
              height={1200}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(i); }}
                  className={`h-2 w-2 rounded-full transition-all ${selectedImage === i ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
