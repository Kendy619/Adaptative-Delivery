"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { CategoryRecommendation, CategoryKey } from "@/lib/types";

interface CategoryPillsProps {
  categories: CategoryRecommendation[];
  activeCategory: CategoryKey | null;
  onSelect: (category: CategoryKey) => void;
  onClear: () => void;
}

export default function CategoryPills({
  categories,
  activeCategory,
  onSelect,
  onClear,
}: CategoryPillsProps) {
  const showingAll = activeCategory === null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Recalcula se ainda há categorias para rolar à esquerda/direita
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
  }, [updateArrows, categories]);

  const scrollByStep = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <div className="sticky top-[57px] z-40 bg-surface-50/90 backdrop-blur-lg">
      <div className="max-w-2xl mx-auto relative">
        {/* Indicador/seta esquerda — só aparece se há categorias para trás */}
        {canScrollLeft && (
          <>
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-surface-50 via-surface-50/70 to-transparent z-[5]" />
            <button
              onClick={() => scrollByStep(-1)}
              aria-label="Ver categorias anteriores"
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-md border border-surface-200 text-surface-500 hover:text-surface-900 hover:border-surface-300 transition-colors"
            >
              ‹
            </button>
          </>
        )}

        <nav
          ref={scrollRef}
          className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {/* Pill fixa "Todos" — limpa o filtro e volta à vitrine completa */}
          <button
            onClick={onClear}
            className={`
              flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full
              text-sm font-medium transition-all duration-300 ease-out
              ${
                showingAll
                  ? "bg-surface-900 text-white shadow-lg shadow-surface-900/20 scale-[1.02]"
                  : "bg-white text-surface-600 border border-surface-200 hover:border-surface-300 hover:shadow-sm"
              }
            `}
          >
            <span className="text-base">🏠</span>
            <span>Todos</span>
          </button>

          {categories.map((cat, i) => {
            const isActive = activeCategory === cat.category;
            const isHighlighted = cat.highlighted;

            return (
              <button
                key={cat.category}
                onClick={() => onSelect(cat.category)}
                className={`
                  flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full
                  text-sm font-medium transition-all duration-300 ease-out
                  ${
                    isActive
                      ? "bg-surface-900 text-white shadow-lg shadow-surface-900/20 scale-[1.02]"
                      : isHighlighted
                      ? "bg-brand-100 text-brand-700 border border-brand-200 shadow-sm shadow-brand-500/10"
                      : "bg-white text-surface-600 border border-surface-200 hover:border-surface-300 hover:shadow-sm"
                  }
                `}
                style={{
                  animationDelay: `${i * 30}ms`,
                }}
              >
                <span className="text-base">{cat.emoji}</span>
                <span>{cat.displayName}</span>
                {isHighlighted && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                )}
                {cat.score > 0 && (
                  <span
                    className={`text-[10px] font-mono ml-0.5 ${
                      isActive
                        ? "text-white/60"
                        : isHighlighted
                        ? "text-brand-400"
                        : "text-surface-400"
                    }`}
                  >
                    {cat.score.toFixed(1)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Indicador/seta direita — sinaliza que há mais categorias */}
        {canScrollRight && (
          <>
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-surface-50 via-surface-50/70 to-transparent z-[5]" />
            <button
              onClick={() => scrollByStep(1)}
              aria-label="Ver mais categorias"
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-md border border-surface-200 text-surface-500 hover:text-surface-900 hover:border-surface-300 transition-colors"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}
