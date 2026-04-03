"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { PRODUCTS } from "@/data/products";
import type { Product } from "@/lib/types";

// ============================================================
// Tipos do Carrinho
// ============================================================

export interface CartItem {
  product: Product;
  quantity: number;
}

// ============================================================
// Hook useCart — gerencia estado do carrinho
// ============================================================

export function useCart() {
  const [cartMap, setCartMap] = useState<Record<string, number>>({});
  const [isOpen, setIsOpen] = useState(false);

  // Derivar itens completos do carrinho (join com catálogo)
  const items: CartItem[] = useMemo(() => {
    return Object.entries(cartMap)
      .map(([productId, quantity]) => {
        const product = PRODUCTS.find((p) => p.id === productId);
        if (!product || quantity <= 0) return null;
        return { product, quantity };
      })
      .filter(Boolean) as CartItem[];
  }, [cartMap]);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  // Tentar sincronizar com backend (graceful fallback se API não existir)
  const syncWithBackend = useCallback(
    async (
      method: string,
      sessionId: string,
      body?: Record<string, unknown>
    ) => {
      try {
        const options: RequestInit = {
          method,
          headers: { "Content-Type": "application/json" },
        };
        if (body) options.body = JSON.stringify(body);

        const url =
          method === "GET"
            ? `/api/cart?sessionId=${sessionId}`
            : "/api/cart";
        const res = await fetch(url, options);

        if (res.ok) {
          const data = await res.json();
          if (data.items) {
            // Rebuild cartMap from backend response
            const newMap: Record<string, number> = {};
            for (const item of data.items) {
              newMap[item.productId] = item.quantity;
            }
            setCartMap(newMap);
          }
        }
      } catch {
        // Backend não disponível — continua com estado local
      }
    },
    []
  );

  /**
   * Adiciona 1 unidade de um produto ao carrinho.
   */
  const addItem = useCallback(
    (productId: string, sessionId?: string) => {
      setCartMap((prev) => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1,
      }));

      if (sessionId) {
        syncWithBackend("POST", sessionId, { sessionId, productId });
      }
    },
    [syncWithBackend]
  );

  /**
   * Atualiza a quantidade de um produto.
   */
  const updateQuantity = useCallback(
    (productId: string, quantity: number, sessionId?: string) => {
      if (quantity <= 0) {
        setCartMap((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      } else {
        setCartMap((prev) => ({ ...prev, [productId]: quantity }));
      }

      if (sessionId) {
        if (quantity <= 0) {
          syncWithBackend("DELETE", sessionId, { sessionId, productId });
        } else {
          syncWithBackend("PATCH", sessionId, {
            sessionId,
            productId,
            quantity,
          });
        }
      }
    },
    [syncWithBackend]
  );

  /**
   * Remove um produto do carrinho.
   */
  const removeItem = useCallback(
    (productId: string, sessionId?: string) => {
      setCartMap((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });

      if (sessionId) {
        syncWithBackend("DELETE", sessionId, { sessionId, productId });
      }
    },
    [syncWithBackend]
  );

  /**
   * Limpa todo o carrinho.
   */
  const clearCart = useCallback(
    (sessionId?: string) => {
      setCartMap({});
      if (sessionId) {
        syncWithBackend("DELETE", sessionId, { sessionId });
      }
    },
    [syncWithBackend]
  );

  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  /**
   * Retorna a quantidade de um produto no carrinho (0 se não estiver).
   */
  const getItemQuantity = useCallback(
    (productId: string) => cartMap[productId] || 0,
    [cartMap]
  );

  return {
    items,
    totalItems,
    totalPrice,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    getItemQuantity,
  };
}
