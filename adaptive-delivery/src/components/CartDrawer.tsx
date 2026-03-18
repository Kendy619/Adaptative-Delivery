"use client";

import { useEffect, useRef } from "react";
import type { CartItem } from "@/hooks/useCart";
import type { CategoryRecommendation } from "@/lib/types";

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  categories: CategoryRecommendation[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  items,
  totalItems,
  totalPrice,
  categories,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  // Fechar com ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Gerenciar scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop - rendered conditionally, no AnimatePresence */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] 
                     transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* Drawer - always rendered, controlled via translate */}
      <div
        className={`
          fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[70] 
          flex flex-col transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200/60">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🛒</span>
            <h2 className="text-lg font-bold text-surface-900">
              Seu Carrinho
            </h2>
            {totalItems > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-brand-500 text-white rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-surface-100 flex items-center justify-center
                       hover:bg-surface-200 transition-colors text-surface-500"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Estado vazio */
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <span className="text-6xl mb-4">🛒</span>
              <h3 className="text-lg font-bold text-surface-900 mb-1">
                Seu carrinho está vazio
              </h3>
              <p className="text-sm text-surface-400 mb-6">
                Explore o cardápio e adicione itens deliciosos!
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-semibold
                           hover:bg-brand-600 transition-colors text-sm"
              >
                Explorar Cardápio
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Lista de itens */}
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 bg-surface-50 rounded-2xl p-3
                             border border-surface-200/60 transition-all duration-200"
                >
                  {/* Emoji */}
                  <div className="w-12 h-12 rounded-xl bg-white border border-surface-200/60 
                                  flex items-center justify-center text-2xl flex-shrink-0">
                    {item.product.image}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-surface-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-surface-400">
                      R$ {item.product.price.toFixed(2).replace(".", ",")} un.
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-lg bg-white border border-surface-200 
                                 flex items-center justify-center text-surface-500 
                                 hover:bg-surface-100 transition-colors text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-surface-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="w-7 h-7 rounded-lg bg-white border border-surface-200 
                                 flex items-center justify-center text-surface-500 
                                 hover:bg-surface-100 transition-colors text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Price + Remove */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-surface-900">
                      R${" "}
                      {(item.product.price * item.quantity)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-[10px] text-red-400 hover:text-red-500 
                                 transition-colors font-medium"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}

              {/* Limpar carrinho */}
              <button
                onClick={onClearCart}
                className="w-full text-center text-xs text-surface-400 hover:text-red-400 
                           transition-colors py-2 mt-2"
              >
                Limpar carrinho
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-surface-200/60 p-5 space-y-3 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Total</span>
              <span className="text-xl font-bold text-surface-900">
                R$ {totalPrice.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <button
              className="w-full py-3.5 bg-brand-500 text-white rounded-2xl font-bold
                         hover:bg-brand-600 transition-all active:scale-[0.98] text-sm
                         shadow-lg shadow-brand-500/20"
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
}
