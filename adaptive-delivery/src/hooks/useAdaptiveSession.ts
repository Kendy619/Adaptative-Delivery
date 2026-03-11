"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  AdaptiveResponse,
  CategoryKey,
  CategoryRecommendation,
  CrossSellItem,
  EventType,
} from "@/lib/types";
import { DEFAULT_CATEGORY_ORDER, CATEGORIES } from "@/lib/types";

/**
 * Hook que gerencia a sessão adaptativa do usuário.
 *
 * Responsabilidades:
 * - Gerar/manter o sessionId
 * - Enviar eventos de clickstream para a API
 * - Manter o estado da vitrine adaptada no client
 * - Fornecer funções para os componentes emitirem eventos
 */
export function useAdaptiveSession() {
  const [sessionId] = useState(() => generateSessionId());
  const [categories, setCategories] = useState<CategoryRecommendation[]>(
    buildDefaultCategories()
  );
  const [crossSell, setCrossSell] = useState<CrossSellItem[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAdaptation, setLastAdaptation] = useState<number | null>(null);

  // Debounce rápido para VIEW events (evitar flood)
  const viewTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Envia um evento de clickstream e atualiza a vitrine.
   * Chamado pelos componentes sempre que o usuário interage.
   */
  const sendEvent = useCallback(
    async (
      eventType: EventType,
      itemId: string,
      itemName: string,
      category: CategoryKey
    ) => {
      // Debounce views (300ms) para não sobrecarregar com scroll rápido
      if (eventType === "view") {
        if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
        viewTimerRef.current = setTimeout(
          () => fireEvent(eventType, itemId, itemName, category),
          300
        );
        return;
      }

      // Eventos de ação (click, add_to_cart, etc.) são imediatos
      await fireEvent(eventType, itemId, itemName, category);
    },
    [sessionId]
  );

  const fireEvent = async (
    eventType: EventType,
    itemId: string,
    itemName: string,
    category: CategoryKey
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/session/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          eventType,
          itemId,
          itemName,
          category,
        }),
      });

      if (!res.ok) {
        console.error("Erro na API:", res.status);
        return;
      }

      const data: AdaptiveResponse = await res.json();

      setCategories(data.adaptedCategories);
      setCrossSell(data.crossSellSuggestions);
      setEventCount(data.totalEventsProcessed);
      setLastAdaptation(data.adaptationTimestampMs);
    } catch (err) {
      console.error("Erro ao enviar evento:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sessionId,
    categories,
    crossSell,
    eventCount,
    isLoading,
    lastAdaptation,
    sendEvent,
  };
}

// ============================================================
// Helpers
// ============================================================

function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `sess_${timestamp}_${random}`;
}

function buildDefaultCategories(): CategoryRecommendation[] {
  return DEFAULT_CATEGORY_ORDER.map((key, i) => ({
    category: key,
    displayName: CATEGORIES[key].displayName,
    emoji: CATEGORIES[key].emoji,
    score: 0,
    rank: i + 1,
    highlighted: false,
  }));
}
