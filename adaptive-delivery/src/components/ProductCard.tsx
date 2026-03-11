"use client";

import { useState } from "react";
import type { Product, EventType, CategoryKey } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onEvent: (
    eventType: EventType,
    itemId: string,
    itemName: string,
    category: CategoryKey
  ) => void;
}

export default function ProductCard({ product, onEvent }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleClick = () => {
    onEvent("click", product.id, product.name, product.category);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEvent("add_to_cart", product.id, product.name, product.category);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
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
                isAdded
                  ? "bg-emerald-500 text-white scale-95"
                  : "bg-surface-900 text-white hover:bg-brand-500 active:scale-95"
              }
            `}
          >
            {isAdded ? "✓ Adicionado" : "+ Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
