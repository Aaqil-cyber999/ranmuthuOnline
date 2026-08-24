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
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[340px_1fr] lg:gap-10">
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

  const handleBuyNow = () => {
    if (!inStock) return;
    handleAddToCart();
    router.push("/checkout");
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
      <div className="mx-auto max-w-6xl section-padding pt-4 pb-8 sm:pt-6 sm:pb-10">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[340px_1fr] lg:gap-10">
          {/* Images */}
          <div>
            <div
              className="relative aspect-square w-full max-w-[250px] mx-auto overflow-hidden rounded-xl cursor-zoom-in group lg:max-w-none lg:mx-0"
              style={{ background: "var(--surface)", borderColor: "var(--border)", borderWidth: 1, borderStyle: "solid" }}
              onClick={() => images.length > 0 && setLightboxOpen(true)}
            >
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage] || images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 250px, 340px"
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
              <div className="mt-2.5 flex justify-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 lg:justify-start">
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
              <Link href={`/?category=${product.category.slug}`} className="text-[11px] font-semibold uppercase tracking-widest text-brand-500 hover:text-brand-400 transition-colors mb-2 w-fit">
                {product.category.name}
              </Link>
            )}

            <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl leading-snug tracking-tight" style={{ color: "var(--fg)" }}>
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
              <span className="text-2xl font-extrabold sm:text-3xl tracking-tight" style={{ color: "var(--fg)" }}>
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm line-through" style={{ color: "var(--fg-faint)" }}>{formatPrice(product.price)}</span>
                  <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-500">
                    -{discountPercent}% · Save {formatPrice(product.price - displayPrice!)}
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="mt-3">
              {inStock ? (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${lowStock ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${lowStock ? "bg-amber-500" : "bg-emerald-500"}`} />
                  {lowStock ? `Low stock — only ${product.stock} left` : "In Stock"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Product code */}
            {(product.sku || product.barcode) && (
              <p className="mt-3 text-[11px]" style={{ color: "var(--fg-faint)" }}>
                {product.sku && <>Product Code: <span className="font-medium" style={{ color: "var(--fg-muted)" }}>{product.sku}</span></>}
                {product.sku && product.barcode && <span className="mx-1.5">·</span>}
                {product.barcode && <>Barcode: <span className="font-medium" style={{ color: "var(--fg-muted)" }}>{product.barcode}</span></>}
              </p>
            )}

            {/* Description */}
            {product.description && (
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>{product.description}</p>
            )}

            {/* Divider */}
            <div className="my-5" style={{ borderTop: "1px solid var(--border)" }} />

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--fg)" }}>
                  {product.variants[0].name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.value)}
                      className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all duration-150 ${
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

            {/* Quantity & Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--fg)" }}>Quantity</p>
                <div className="inline-flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center transition-colors"
                    style={{ color: "var(--fg-muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
                    aria-label="Decrease quantity"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="w-10 text-center text-sm font-bold tabular-nums" style={{ color: "var(--fg)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="flex h-10 w-10 items-center justify-center transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{ color: "var(--fg-muted)" }}
                    onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--fg)"; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
                    aria-label="Increase quantity"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                {addedToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Added to Cart
                  </span>
                ) : inStock ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                    </svg>
                    Add to Cart
                  </span>
                ) : (
                  "Out of Stock"
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="w-full py-3.5 rounded-xl bg-emerald-500 font-semibold text-sm text-white transition-all hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>

              <Link href="/" className="btn-secondary w-full flex items-center justify-center py-3 text-sm rounded-xl">
                Continue Shopping
              </Link>
            </div>

            {/* Delivery & Service */}
            <div className="mt-6 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5" style={{ borderTop: "1px solid var(--border)" }}>
              {[
                { icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.141-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12", title: "Island-wide Delivery", sub: "Rs 350 · Free over Rs 10,000 · 2–4 days" },
                { icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z", title: "Cash on Delivery", sub: "Pay when your order arrives" },
                { icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99", title: "7-Day Returns", sub: "Easy exchange or refund" },
                { icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155", title: "WhatsApp Support", sub: "077 956 0026" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl px-3.5 py-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "var(--fg)" }}>{item.title}</p>
                    <p className="mt-0.5 text-[11px]" style={{ color: "var(--fg-muted)" }}>{item.sub}</p>
                  </div>
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
