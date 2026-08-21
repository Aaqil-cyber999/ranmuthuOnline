"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { showSuccess, showError } from "@/components/ui/Toast";
import type { ProductType } from "@/types";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("low");
  const [editingStock, setEditingStock] = useState<{ id: string; value: string } | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100", status: "active" });
      if (search) params.set("search", search);
      params.set("sort", sortBy === "low" ? "newest" : "name");

      const res = await fetch(`/api/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        let sorted = data.products || [];
        if (sortBy === "low") {
          sorted = [...sorted].sort((a: ProductType, b: ProductType) => a.stock - b.stock);
        } else if (sortBy === "high") {
          sorted = [...sorted].sort((a: ProductType, b: ProductType) => b.stock - a.stock);
        }
        setProducts(sorted);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: String(newStock) }),
      });
      if (res.ok) {
        showSuccess("Stock updated");
        fetchProducts();
      } else {
        const data = await res.json();
        showError(data.error || "Failed to update stock");
      }
    } catch {
      showError("Failed to update stock");
    }
    setEditingStock(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>

        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="low">Stock: Low to High</option>
              <option value="high">Stock: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" className="text-indigo-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 ${product.stock <= 5 ? "bg-red-50/50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{product.name}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{product.sku || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{product.category?.name || "-"}</td>
                      <td className="px-4 py-3">
                        {editingStock?.id === product.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editingStock.value}
                              onChange={(e) => setEditingStock({ ...editingStock, value: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleStockUpdate(product.id, parseInt(editingStock.value) || 0);
                                if (e.key === "Escape") setEditingStock(null);
                              }}
                              autoFocus
                              min="0"
                              className="w-20 rounded border border-indigo-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button
                              onClick={() => handleStockUpdate(product.id, parseInt(editingStock.value) || 0)}
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStock(null)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingStock({ id: product.id, value: String(product.stock) })}
                            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-sm font-medium hover:bg-gray-100 transition-colors ${
                              product.stock === 0
                                ? "text-red-600"
                                : product.stock <= 5
                                ? "text-amber-600"
                                : "text-gray-900"
                            }`}
                          >
                            {product.stock}
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                            </svg>
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {product.stock === 0 ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            Out of Stock
                          </span>
                        ) : product.stock <= 5 ? (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-400">No products found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
