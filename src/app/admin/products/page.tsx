"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { showSuccess, showError } from "@/components/ui/Toast";
import { parseProductImages } from "@/lib/utils";
import type { ProductType, CategoryType } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; product: ProductType | null }>({
    open: false,
    product: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        sort,
      });
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteModal.product.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showSuccess(data.message || "Product deleted");
        setDeleteModal({ open: false, product: null });
        fetchProducts();
      } else {
        showError(data.error || "Failed to delete");
      }
    } catch {
      showError("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Product
          </Link>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="relative">
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
            </form>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
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
                    <th className="px-4 py-3 font-medium">Image</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => {
                    const images = parseProductImages(product.images);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden">
                            {images.length > 0 ? (
                              <img src={images[0]} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.sku && <p className="text-xs text-gray-500">SKU: {product.sku}</p>}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{product.category?.name || "-"}</td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-medium text-gray-900">Rs. {product.price.toLocaleString()}</span>
                            {product.salePrice && (
                              <span className="ml-2 text-xs text-green-600">Rs. {product.salePrice.toLocaleString()}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${product.stock <= 5 ? "text-red-600" : "text-gray-700"}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={product.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="rounded-md px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => setDeleteModal({ open: true, product })}
                              className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No products found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, product: null })}
          title="Delete Product"
          size="sm"
        >
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete <strong>{deleteModal.product?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModal({ open: false, product: null })}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
