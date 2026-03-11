"use client";

import { useState, useMemo } from "react";
import { useAdaptiveSession } from "@/hooks/useAdaptiveSession";
import { PRODUCTS } from "@/data/products";
import type { CategoryKey } from "@/lib/types";

import Header from "@/components/Header";
import CategoryPills from "@/components/CategoryPills";
import CrossSellBanner from "@/components/CrossSellBanner";
import ProductCard from "@/components/ProductCard";
import AdaptiveDebugPanel from "@/components/AdaptiveDebugPanel";

export default function HomePage() {
  const {
    sessionId,
    categories,
    crossSell,
    eventCount,
    isLoading,
    lastAdaptation,
    sendEvent,
  } = useAdaptiveSession();

  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(
    null
  );

  // Filtra produtos pela categoria ativa (ou mostra pela ordem adaptada)
  const displayProducts = useMemo(() => {
    if (activeCategory) {
      return PRODUCTS.filter((p) => p.category === activeCategory);
    }

    // Sem filtro ativo → mostra produtos na ORDEM ADAPTADA das categorias
    const categoryOrder = categories.map((c) => c.category);
    return [...PRODUCTS].sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.category);
      const indexB = categoryOrder.indexOf(b.category);
      return indexA - indexB;
    });
  }, [activeCategory, categories]);

  const handleCategorySelect = (category: CategoryKey) => {
    const isDeselecting = activeCategory === category;
    setActiveCategory(isDeselecting ? null : category);

    if (!isDeselecting) {
      sendEvent(
        "click",
        `category_${category}`,
        category,
        category
      );
    }
  };

  const handleCrossSellSelect = (category: CategoryKey) => {
    setActiveCategory(category);
    sendEvent(
      "click",
      `crosssell_${category}`,
      category,
      category
    );
  };

  // Agrupa os produtos por categoria para exibição com seções
  const groupedProducts = useMemo(() => {
    if (activeCategory) {
      return [{ category: activeCategory, products: displayProducts }];
    }

    const groups: { category: CategoryKey; products: typeof PRODUCTS }[] = [];
    const categoryOrder = categories.map((c) => c.category);

    for (const catKey of categoryOrder) {
      const catProducts = PRODUCTS.filter((p) => p.category === catKey);
      if (catProducts.length > 0) {
        groups.push({ category: catKey, products: catProducts });
      }
    }

    return groups;
  }, [activeCategory, categories, displayProducts]);

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      <Header
        sessionId={sessionId}
        eventCount={eventCount}
        isLoading={isLoading}
      />

      <CategoryPills
        categories={categories}
        activeCategory={activeCategory}
        onSelect={handleCategorySelect}
      />

      {/* Cross-sell banner (RN04) */}
      <CrossSellBanner
        suggestions={crossSell}
        onSelect={handleCrossSellSelect}
      />

      {/* Product Grid agrupado por categoria */}
      <main className="max-w-2xl mx-auto px-4 space-y-8 mt-4">
        {groupedProducts.map(({ category, products }) => {
          const catMeta = categories.find((c) => c.category === category);

          return (
            <section key={category}>
              {/* Section header */}
              {!activeCategory && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{catMeta?.emoji}</span>
                  <h2 className="text-sm font-bold text-surface-900 uppercase tracking-wide">
                    {catMeta?.displayName || category}
                  </h2>
                  {catMeta?.highlighted && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-100 text-brand-600 rounded-full">
                      Em alta para você
                    </span>
                  )}
                  <div className="flex-1 h-px bg-surface-200" />
                </div>
              )}

              {/* Products grid */}
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEvent={sendEvent}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {displayProducts.length === 0 && (
          <div className="text-center py-16 text-surface-400">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-sm">Nenhum produto nesta categoria.</p>
          </div>
        )}
      </main>

      {/* Debug panel (para avaliação acadêmica) */}
      <AdaptiveDebugPanel
        sessionId={sessionId}
        eventCount={eventCount}
        categories={categories}
        crossSell={crossSell}
        lastAdaptation={lastAdaptation}
      />
    </div>
  );
}
