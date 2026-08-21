"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { showSuccess, showError } from "@/components/ui/Toast";
import { parseProductImages } from "@/lib/utils";
import type { CategoryType, ProductVariantType } from "@/types";

interface VariantRow {
  id?: string;
  name: string;
  value: string;
  price: string;
  stock: string;
  sku: string;
}

export default function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("active");
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch("/api/categories"),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const p = prodData.product;
          setName(p.name);
          setDescription(p.description || "");
          setPrice(String(p.price));
          setSalePrice(p.salePrice ? String(p.salePrice) : "");
          setSku(p.sku || "");
          setBarcode(p.barcode || "");
          setStock(String(p.stock));
          setCategoryId(p.categoryId || "");
          setStatus(p.status);
          setIsFeatured(p.isFeatured);
          setImages(parseProductImages(p.images));
          setVariants(
            (p.variants || []).map((v: ProductVariantType) => ({
              id: v.id,
              name: v.name,
              value: v.value,
              price: v.price ? String(v.price) : "",
              stock: String(v.stock),
              sku: v.sku || "",
            }))
          );
        } else {
          showError("Product not found");
          router.push("/admin/products");
        }
      } catch {
        showError("Failed to load product");
        router.push("/admin/products");
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          setImages((prev) => [...prev, data.url]);
        } else {
          showError("Image upload failed");
        }
      } catch {
        showError("Image upload failed");
      }
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { name: "", value: "", price: "", stock: "0", sku: "" }]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantRow, value: string) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const body = {
        name,
        description,
        price,
        salePrice: salePrice || null,
        sku: sku || null,
        barcode: barcode || null,
        stock,
        categoryId: categoryId || null,
        status,
        isFeatured,
        images,
        variants: variants.filter((v) => v.name && v.value).map((v) => ({
          id: v.id,
          name: v.name,
          value: v.value,
          price: v.price || null,
          stock: v.stock || "0",
          sku: v.sku || null,
        })),
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showSuccess("Product updated successfully!");
        router.push("/admin/products");
      } else {
        const data = await res.json();
        showError(data.error || "Failed to update product");
      }
    } catch {
      showError("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loadingProduct) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" className="text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (Rs.)</label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  min="0"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">Featured Product</label>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Images</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {uploading && <p className="mt-2 text-sm text-gray-500">Uploading...</p>}
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="h-20 w-20 rounded-lg object-cover border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Variant
              </button>
            </div>

            {variants.map((variant, index) => (
              <div key={index} className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Name"
                  value={variant.name}
                  onChange={(e) => updateVariant(index, "name", e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={variant.value}
                  onChange={(e) => updateVariant(index, "value", e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={variant.price}
                  onChange={(e) => updateVariant(index, "price", e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={variant.stock}
                  onChange={(e) => updateVariant(index, "stock", e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, "sku", e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="rounded-lg px-2 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {saving ? <LoadingSpinner size="sm" /> : null}
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="rounded-lg px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
