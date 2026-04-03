"use client";

import { useState } from "react";
import type { Product, EventType, CategoryKey } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onEvent: (
    eventType: EventType,
    itemId: string,
    itemName: string,
    category: CategoryKey
  ) => void;
  onAddToCart: (productId: string) => void;
}

export default function ProductCard({
  product,
  cartQuantity,
  onEvent,
  onAddToCart,
}: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = () => {
    onEvent("click", product.id, product.name, product.category);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEvent("add_to_cart", product.id, product.name, product.category);
    onAddToCart(product.id);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white rounded-2xl border border-surface-200/80 
                 hover:border-brand-300/50 hover:shadow-lg hover:shadow-brand-500/5
                 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Emoji placeholder para imagem */}
      <div className="relative h-32 bg-gradient-to-br from-surface-100 to-surface-50 flex items-center justify-center">
        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
          {product.image}
        </span>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="absolute top-2 left-2 flex gap-1">
            {product.tags.includes("popular") && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-brand-500 text-white rounded-full">
                Popular
              </span>
            )}
            {product.tags.includes("destaque") && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-red-500 text-white rounded-full">
                Destaque
              </span>
            )}
          </div>
        )}

        {/* Cart quantity badge */}
        {cartQuantity > 0 && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-500 text-white rounded-full shadow-sm">
              {cartQuantity}× no carrinho
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-semibold text-surface-900 text-sm leading-tight">
          {product.name}
        </h3>
        <p className="text-xs text-surface-400 mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-surface-900">
            <span className="text-xs font-normal text-surface-400">R$</span>{" "}
            {product.price.toFixed(2).replace(".", ",")}
          </span>

          <button
            onClick={handleAddToCart}
            className={`
              px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300
              ${
                justAdded
                  ? "bg-emerald-500 text-white scale-95"
                  : cartQuantity > 0
                  ? "bg-brand-500 text-white hover:bg-brand-600 active:scale-95"
                  : "bg-surface-900 text-white hover:bg-brand-500 active:scale-95"
              }
            `}
          >
            {justAdded ? "✓ Adicionado" : cartQuantity > 0 ? `+ Mais 1` : "+ Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
