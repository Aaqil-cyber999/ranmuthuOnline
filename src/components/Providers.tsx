"use client";

import { ReactNode, useState, useCallback } from "react";
import { CartProvider } from "@/context/CartContext";
import { ToasterProvider } from "@/components/ui/Toast";
import ThemeProvider from "@/context/ThemeContext";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import CartDrawer from "@/components/shop/CartDrawer";
import FloatingCart from "@/components/shop/FloatingCart";

export default function Providers({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  return (
    <ThemeProvider>
      <CartProvider>
        <ToasterProvider />
        <Header onCartOpen={openCart} />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <FloatingCart onOpen={openCart} />
        <CartDrawer isOpen={cartOpen} onClose={closeCart} />
      </CartProvider>
    </ThemeProvider>
  );
}
