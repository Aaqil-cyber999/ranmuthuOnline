"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StatusBadge from "@/components/ui/StatusBadge";
import { showSuccess, showError } from "@/components/ui/Toast";
import { parseProductImages } from "@/lib/utils";
import type { OrderType } from "@/types";

const statuses = ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"];

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setOrder(data.order);
            setNotes(data.order.notes || "");
          } else {
            showError("Order not found");
            router.push("/admin/orders");
          }
        } else {
          showError("Order not found");
          router.push("/admin/orders");
        }
      } catch {
        showError("Failed to load order");
        router.push("/admin/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, router]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        showSuccess("Status updated");
      } else {
        const data = await res.json();
        showError(data.error || "Failed to update");
      }
    } catch {
      showError("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleNotesSave = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        showSuccess("Notes saved");
      } else {
        showError("Failed to save notes");
      }
    } catch {
      showError("Failed to save notes");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" className="text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) return null;

  const items = order.orderItems || [];

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/orders")}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Orders
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {order.whatsappSent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-200">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Sent
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.product && parseProductImages(item.product.images).length > 0 ? (
                        <img
                          src={parseProductImages(item.product.images)[0]}
                          alt={item.product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.product?.name || "Unknown Product"}</p>
                        {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                        <p className="text-xs text-gray-500">Qty: {item.quantity} x Rs. {item.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Add notes about this order..."
              />
              <button
                onClick={handleNotesSave}
                disabled={updating}
                className="mt-3 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={updating}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <div className="mt-3">
                <StatusBadge status={order.status} />
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{order.customerPhone}</p>
                </div>
                {order.customerEmail && (
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{order.customerEmail}</p>
                  </div>
                )}
                {order.customerAddress && (
                  <div>
                    <p className="text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{order.customerAddress}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Totals</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">Rs. {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="text-gray-900">Rs. {order.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-gray-900">Rs. {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
