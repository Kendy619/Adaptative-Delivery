"use client";

import type { CategoryRecommendation, CategoryKey } from "@/lib/types";

interface CategoryPillsProps {
  categories: CategoryRecommendation[];
  activeCategory: CategoryKey | null;
  onSelect: (category: CategoryKey) => void;
}

export default function CategoryPills({
  categories,
  activeCategory,
  onSelect,
}: CategoryPillsProps) {
  return (
    <div className="sticky top-[57px] z-40 bg-surface-50/90 backdrop-blur-lg">
      <div className="max-w-2xl mx-auto">
        <nav className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
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
      </div>
    </div>
  );
}
