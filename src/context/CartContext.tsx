"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { CartItem, CartState } from "@/types";

const CartContext = createContext<CartState | undefined>(undefined);

const CART_STORAGE_KEY = "ranmuthu_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    if (!data || data === "undefined" || data === "null") return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.quantity === "number"
    );
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCart(items);
  }, [items, loaded]);

  const addItem = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const quantity = item.quantity || 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.variant === item.variant);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.variant === item.variant
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
            : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
  }, []);

  const removeItem = useCallback((id: string, variant?: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.variant === variant)));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number, variant?: string) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.variant === variant
          ? { ...i, quantity: Math.min(quantity, i.stock) }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getSubtotal = useCallback(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const getItemCount = useCallback(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, getSubtotal, getItemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
