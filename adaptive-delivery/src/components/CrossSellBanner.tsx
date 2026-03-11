"use client";

import type { CrossSellItem, CategoryKey } from "@/lib/types";

interface CrossSellBannerProps {
  suggestions: CrossSellItem[];
  onSelect: (category: CategoryKey) => void;
}

export default function CrossSellBanner({
  suggestions,
  onSelect,
}: CrossSellBannerProps) {
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

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
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
      </div>
    </div>
  );
}
