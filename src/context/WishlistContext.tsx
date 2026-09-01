"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { WishlistItem, WishlistState } from "@/types";

const WishlistContext = createContext<WishlistState | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "ranmuthu_wishlist";

function loadWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!data || data === "undefined" || data === "null") return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number"
    );
  } catch {
    return [];
  }
}

function saveWishlist(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadWishlist());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveWishlist(items);
  }, [items, loaded]);

  const addItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  }, []);

  const hasItem = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const getItemCount = useCallback(() => items.length, [items]);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, hasItem, getItemCount }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistState {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
