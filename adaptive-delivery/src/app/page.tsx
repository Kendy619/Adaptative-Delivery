"use client";

import { useState, useMemo, useCallback } from "react";
import { useAdaptiveSession } from "@/hooks/useAdaptiveSession";
import { useCart } from "@/hooks/useCart";
import { PRODUCTS } from "@/data/products";
import { generateTicketRecommendations } from "@/lib/ticket-engine";
import { generateCartUpsells } from "@/lib/upsell-engine";
import type { CategoryKey } from "@/lib/types";

import Header from "@/components/Header";
import CategoryPills from "@/components/CategoryPills";
import CrossSellBanner from "@/components/CrossSellBanner";
import TicketRecommendationBanner from "@/components/TicketRecommendationBanner";
import ProductCard from "@/components/ProductCard";
import CartScreen from "@/components/CartScreen";
import AdaptiveDebugPanel from "@/components/AdaptiveDebugPanel";

/** Telas navegáveis da aplicação */
type View = "catalog" | "cart";

export default function HomePage() {
  const {
    sessionId,
    categories,
    crossSell,
    eventCount,
    isLoading,
    lastAdaptation,
    hasPendingAdaptation,
    sendEvent,
    commitAdaptation,
  } = useAdaptiveSession();

  const {
    items: cartItems,
    totalItems: cartTotalItems,
    totalPrice: cartTotalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  } = useCart();

  const [view, setView] = useState<View>("catalog");
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(
    null
  );

  // Scores da sessão (mapa categoria → score) para alimentar as engines
  const sessionScores = useMemo(() => {
    const scores: Record<string, number> = {};
    for (const cat of categories) {
      if (cat.score > 0) scores[cat.category] = cat.score;
    }
    return scores;
  }, [categories]);

  // Recomendações de ticket médio com base no carrinho atual
  const ticketInfo = useMemo(() => {
    const cartProductIds = cartItems.map((item) => item.product.id);
    return generateTicketRecommendations(
      cartTotalPrice,
      cartProductIds,
      sessionScores
    );
  }, [cartItems, cartTotalPrice, sessionScores]);

  // Upsells da tela de carrinho — produtos que combinam com o pedido
  const cartUpsells = useMemo(() => {
    const cartProductIds = cartItems.map((item) => item.product.id);
    return generateCartUpsells(cartProductIds, sessionScores);
  }, [cartItems, sessionScores]);

  // ── Navegação entre telas (commita a adaptação pendente) ──
  const goToCart = useCallback(() => {
    commitAdaptation();
    setView("cart");
  }, [commitAdaptation]);

  const goToCatalog = useCallback(() => {
    commitAdaptation();
    setView("catalog");
  }, [commitAdaptation]);

  // Filtra produtos pela categoria ativa (ou mostra pela ordem adaptada)
  const displayProducts = useMemo(() => {
    if (activeCategory) {
      return PRODUCTS.filter((p) => p.category === activeCategory);
    }
    const categoryOrder = categories.map((c) => c.category);
    return [...PRODUCTS].sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.category);
      const indexB = categoryOrder.indexOf(b.category);
      return indexA - indexB;
    });
  }, [activeCategory, categories]);

  const handleCategorySelect = (category: CategoryKey) => {
    const isDeselecting = activeCategory === category;

    // Selecionar/limpar uma categoria é uma navegação → aplica a adaptação
    commitAdaptation();
    setActiveCategory(isDeselecting ? null : category);

    if (!isDeselecting) {
      sendEvent("click", `category_${category}`, category, category);
    }
  };

  // Pill "Todos": limpa o filtro e volta à vitrine adaptativa completa.
  // É uma navegação (aplica a adaptação pendente), mas não gera peso —
  // "Todos" não é uma categoria de interesse.
  const handleClearCategory = () => {
    commitAdaptation();
    setActiveCategory(null);
  };

  const handleCrossSellSelect = (category: CategoryKey) => {
    commitAdaptation();
    setActiveCategory(category);
    sendEvent("click", `crosssell_${category}`, category, category);
  };

  const handleAddToCart = (productId: string) => {
    addItem(productId, sessionId);
  };

  // Adiciona um upsell sugerido na tela do carrinho (registra o evento)
  const handleAddUpsell = (
    productId: string,
    productName: string,
    category: CategoryKey
  ) => {
    sendEvent("add_to_cart", productId, productName, category);
    addItem(productId, sessionId);
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
        hasPendingAdaptation={hasPendingAdaptation}
        cartItemCount={cartTotalItems}
        onCartClick={goToCart}
      />

      {view === "cart" ? (
        <CartScreen
          items={cartItems}
          totalItems={cartTotalItems}
          totalPrice={cartTotalPrice}
          ticketInfo={ticketInfo}
          upsells={cartUpsells}
          onBack={goToCatalog}
          onUpdateQuantity={(productId, qty) =>
            updateQuantity(productId, qty, sessionId)
          }
          onRemoveItem={(productId) => removeItem(productId, sessionId)}
          onClearCart={() => clearCart(sessionId)}
          onAddUpsell={handleAddUpsell}
        />
      ) : (
        <>
          <CategoryPills
            categories={categories}
            activeCategory={activeCategory}
            onSelect={handleCategorySelect}
            onClear={handleClearCategory}
          />

          {/* Cross-sell banner (RN04) */}
          <CrossSellBanner
            suggestions={crossSell}
            onSelect={handleCrossSellSelect}
          />

          {/* Ticket médio — nudge para abrir o carrinho */}
          <TicketRecommendationBanner
            ticketInfo={ticketInfo}
            onAddToCart={handleAddToCart}
            onProductClick={(productId, productName, category) => {
              sendEvent("click", productId, productName, category);
            }}
          />

          {/* Product Grid agrupado por categoria */}
          <main className="max-w-2xl mx-auto px-4 space-y-8 mt-4">
            {groupedProducts.map(({ category, products }) => {
              const catMeta = categories.find((c) => c.category === category);

              return (
                <section key={category}>
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

                  <div className="grid grid-cols-2 gap-3">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        cartQuantity={getItemQuantity(product.id)}
                        onEvent={sendEvent}
                        onAddToCart={handleAddToCart}
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
        </>
      )}

      {/* Debug panel (para avaliação acadêmica) */}
      <AdaptiveDebugPanel
        sessionId={sessionId}
        eventCount={eventCount}
        categories={categories}
        crossSell={crossSell}
        lastAdaptation={lastAdaptation}
        ticketInfo={ticketInfo}
      />
    </div>
  );
}
