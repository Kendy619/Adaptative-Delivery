"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { CrossSellItem, CategoryKey } from "@/lib/types";

interface CrossSellBannerProps {
  suggestions: CrossSellItem[];
  onSelect: (category: CategoryKey) => void;
}

export default function CrossSellBanner({
  suggestions,
  onSelect,
}: CrossSellBannerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Recalcula se ainda há conteúdo para rolar à esquerda/direita
  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, suggestions]);

  const scrollByStep = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 mb-4 animate-slide-up">
      <div className="bg-gradient-to-r from-brand-50 via-white to-brand-50 rounded-2xl border border-brand-200/60 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">💡</span>
          <h3 className="text-xs font-bold text-brand-700 uppercase tracking-widest">
            Você também pode gostar
          </h3>
          <div className="flex-1 h-px bg-brand-200/50" />
        </div>

        <div className="relative">
          {/* Indicador/seta esquerda — só aparece se há conteúdo para trás */}
          {canScrollLeft && (
            <>
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-brand-50 via-brand-50/70 to-transparent z-[5] rounded-l-xl" />
              <button
                onClick={() => scrollByStep(-1)}
                aria-label="Ver sugestões anteriores"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md border border-brand-200/60 text-surface-500 hover:text-brand-600 hover:border-brand-300 transition-colors"
              >
                ‹
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
          >
            {suggestions.map((item) => (
              <button
                key={item.category}
                onClick={() => onSelect(item.category)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white
                           rounded-xl border border-brand-200/40 hover:border-brand-300
                           hover:shadow-md hover:shadow-brand-500/10
                           transition-all duration-200 group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {item.emoji}
                </span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-surface-800">
                    {item.displayName}
                  </p>
                  <p className="text-[11px] text-surface-400 leading-tight max-w-[180px]">
                    {item.reason}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Indicador/seta direita — sinaliza que há mais sugestões */}
          {canScrollRight && (
            <>
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-brand-50 via-brand-50/70 to-transparent z-[5] rounded-r-xl" />
              <button
                onClick={() => scrollByStep(1)}
                aria-label="Ver mais sugestões"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md border border-brand-200/60 text-surface-500 hover:text-brand-600 hover:border-brand-300 transition-colors"
              >
                ›
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
