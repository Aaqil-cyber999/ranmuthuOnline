"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";
import { showSuccess, showError } from "@/components/ui/Toast";
import type { BannerType } from "@/types";

type SettingsMap = Record<string, string>;

const tabs = ["General", "WhatsApp", "Delivery", "Banners"] as const;
type Tab = typeof tabs[number];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("General");
  const [settings, setSettings] = useState<SettingsMap>({});
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bannerModal, setBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerType | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
    sortOrder: "0",
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings || {});
          setBanners(data.banners || []);
        }
      } catch {
        //
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        showSuccess("Settings saved");
      } else {
        showError("Failed to save settings");
      }
    } catch {
      showError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const openAddBanner = () => {
    setEditingBanner(null);
    setBannerForm({ title: "", subtitle: "", image: "", link: "", sortOrder: "0", isActive: true });
    setBannerModal(true);
  };

  const openEditBanner = (banner: BannerType) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image: banner.image,
      link: banner.link || "",
      sortOrder: String(banner.sortOrder),
      isActive: banner.isActive,
    });
    setBannerModal(true);
  };

  const handleBannerSave = async () => {
    setSaving(true);
    try {
      let updatedBanners;
      if (editingBanner) {
        updatedBanners = banners.map((b) =>
          b.id === editingBanner.id
            ? { ...b, ...bannerForm, sortOrder: parseInt(bannerForm.sortOrder) || 0 }
            : b
        );
      } else {
        updatedBanners = [
          ...banners,
          {
            id: null,
            title: bannerForm.title,
            subtitle: bannerForm.subtitle || null,
            image: bannerForm.image,
            link: bannerForm.link || null,
            isActive: bannerForm.isActive,
            sortOrder: parseInt(bannerForm.sortOrder) || 0,
          },
        ];
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners: updatedBanners }),
      });

      if (res.ok) {
        showSuccess(editingBanner ? "Banner updated" : "Banner added");
        setBannerModal(false);
        const settingsRes = await fetch("/api/admin/settings");
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setBanners(data.banners || []);
        }
      } else {
        showError("Failed to save banner");
      }
    } catch {
      showError("Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const toggleBannerActive = async (banner: BannerType) => {
    const updated = banners.map((b) =>
      b.id === banner.id ? { ...b, isActive: !b.isActive } : b
    );
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners: updated }),
      });
      if (res.ok) {
        setBanners(updated);
        showSuccess("Banner updated");
      }
    } catch {
      showError("Failed to update banner");
    }
  };

  const deleteBanner = async (banner: BannerType) => {
    const updated = banners.filter((b) => b.id !== banner.id);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners: updated }),
      });
      if (res.ok) {
        setBanners(updated);
        showSuccess("Banner deleted");
      }
    } catch {
      showError("Failed to delete banner");
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

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        <div className="border-b border-gray-200">
          <nav className="flex gap-0 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "General" && (
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName || ""}
                  onChange={(e) => updateSetting("storeName", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.storeEmail || ""}
                  onChange={(e) => updateSetting("storeEmail", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={settings.storePhone || ""}
                  onChange={(e) => updateSetting("storePhone", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={settings.currency || "LKR"}
                  onChange={(e) => updateSetting("currency", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={settings.storeAddress || ""}
                onChange={(e) => updateSetting("storeAddress", e.target.value)}
                rows={2}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "WhatsApp" && (
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">WhatsApp Settings</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Phone Number</label>
              <input
                type="text"
                value={settings.whatsappAdminNumber || ""}
                onChange={(e) => updateSetting("whatsappAdminNumber", e.target.value)}
                placeholder="+94xxxxxxxxx"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
              <input
                type="text"
                value={settings.whatsappApiUrl || ""}
                onChange={(e) => updateSetting("whatsappApiUrl", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {settings.whatsappApiUrl && (
                <p className="mt-1 text-xs text-gray-400">
                  {settings.whatsappApiUrl.substring(0, 30)}{"***"}
                </p>
              )}
            </div>
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "Delivery" && (
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Delivery Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Delivery Fee (Rs.)</label>
                <input
                  type="number"
                  value={settings.deliveryFee || "0"}
                  onChange={(e) => updateSetting("deliveryFee", e.target.value)}
                  min="0"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Threshold (Rs.)</label>
                <input
                  type="number"
                  value={settings.freeDeliveryThreshold || ""}
                  onChange={(e) => updateSetting("freeDeliveryThreshold", e.target.value)}
                  min="0"
                  placeholder="0 for no free delivery"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "Banners" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Banners</h2>
              <button
                onClick={openAddBanner}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Banner
              </button>
            </div>

            <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
              {banners.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">No banners yet</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {banners.map((banner) => (
                    <div key={banner.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                      <div className="h-16 w-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {banner.image ? (
                          <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{banner.title}</p>
                        {banner.subtitle && <p className="text-xs text-gray-500 truncate">{banner.subtitle}</p>}
                        <p className="text-xs text-gray-400">Order: {banner.sortOrder}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleBannerActive(banner)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${banner.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </button>
                        <button
                          onClick={() => openEditBanner(banner)}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBanner(banner)}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <Modal
          isOpen={bannerModal}
          onClose={() => setBannerModal(false)}
          title={editingBanner ? "Edit Banner" : "Add Banner"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={bannerForm.title}
                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={bannerForm.subtitle}
                onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={bannerForm.image}
                onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <input
                type="text"
                value={bannerForm.link}
                onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={bannerForm.sortOrder}
                  onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bannerForm.isActive}
                    onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setBannerModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBannerSave}
                disabled={saving || !bannerForm.title}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : editingBanner ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
