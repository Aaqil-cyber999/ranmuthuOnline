"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { DashboardStats, OrderType, ProductType } from "@/types";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData({
            totalOrders: json.stats.totalOrders,
            totalRevenue: json.stats.totalRevenue,
            totalProducts: json.stats.totalProducts,
            totalCustomers: json.stats.totalCustomers,
            recentOrders: json.recentOrders,
            ordersByStatus: {
              pending: json.stats.pendingOrders,
              completed: json.stats.completedOrders,
              cancelled: json.stats.cancelledOrders,
            },
            monthlyRevenue: json.monthlyRevenue,
          });
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" className="text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-gray-500">Failed to load dashboard data.</div>
      </AdminLayout>
    );
  }

  const statCards = [
    { label: "Total Orders", value: data.totalOrders, color: "bg-blue-500", href: "/admin/orders" },
    { label: "Revenue", value: `Rs. ${data.totalRevenue.toLocaleString()}`, color: "bg-green-500", href: "/admin/orders" },
    { label: "Products", value: data.totalProducts, color: "bg-purple-500", href: "/admin/products" },
    { label: "Customers", value: data.totalCustomers, color: "bg-amber-500", href: "/admin/orders" },
  ];

  const maxRevenue = Math.max(...data.monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg ${card.color} flex items-center justify-center text-white`}>
                  {card.label === "Total Orders" && (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                    </svg>
                  )}
                  {card.label === "Revenue" && (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {card.label === "Products" && (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  )}
                  {card.label === "Customers" && (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
            <div className="flex items-end gap-3 h-48">
              {data.monthlyRevenue.map((item) => (
                <div key={item.month} className="flex flex-col items-center flex-1">
                  <div className="w-full flex justify-center mb-2">
                    <span className="text-xs text-gray-500">Rs. {item.revenue.toLocaleString()}</span>
                  </div>
                  <div
                    className="w-full max-w-[40px] bg-indigo-500 rounded-t-md transition-all"
                    style={{ height: `${Math.max((item.revenue / maxRevenue) * 140, 4)}px` }}
                  />
                  <span className="text-xs text-gray-500 mt-2 whitespace-nowrap">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            <div className="space-y-4">
              {Object.entries(data.ordersByStatus).map(([status, count]) => {
                const total = data.totalOrders || 1;
                const pct = Math.round(((count as number) / total) * 100);
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                      <span className="text-sm text-gray-500">{count as number}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${
                          status === "pending"
                            ? "bg-yellow-400"
                            : status === "completed"
                            ? "bg-green-500"
                            : "bg-red-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Order #</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentOrders.map((order: OrderType) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <Link href={`/admin/orders/${order.id}`} className="text-indigo-600 hover:underline font-medium">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-700">{order.customerName}</td>
                      <td className="py-3 text-gray-700">Rs. {order.total.toLocaleString()}</td>
                      <td className="py-3"><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                  {data.recentOrders.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-gray-400">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h2>
            <div className="space-y-3">
              {(data.lowStockProducts || []).map((product: ProductType) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">SKU: {product.sku || "N/A"}</p>
                  </div>
                  <span className={`text-sm font-bold ${product.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                    {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                  </span>
                </div>
              ))}
              {(data.lowStockProducts || []).length === 0 && (
                <p className="text-center py-6 text-gray-400 text-sm">All products are well stocked</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
