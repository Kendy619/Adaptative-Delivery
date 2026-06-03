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
 * - Enviar eventos de clickstream para a API (registro contínuo)
 * - Manter o estado da vitrine adaptada no client
 * - Fornecer funções para os componentes emitirem eventos
 *
 * ── Política de adaptação ───────────────────────────────────
 * O REGISTRO de eventos acontece a cada interação (a sessão e os
 * scores continuam evoluindo no backend), mas a APLICAÇÃO VISUAL
 * da adaptação (reordenar categorias, cross-sell, highlights) só
 * é commitada quando o usuário NAVEGA entre telas. Isso evita que
 * a vitrine se reorganize embaixo do dedo do usuário a cada clique.
 *
 * O fluxo é: sendEvent() guarda a última resposta adaptada em um
 * ref "pendente"; commitAdaptation() (chamado nas transições de
 * tela) é quem efetivamente aplica essa adaptação ao estado visível.
 */
export function useAdaptiveSession() {
  const [sessionId, setSessionId] = useState("");
  const [categories, setCategories] = useState<CategoryRecommendation[]>(
    buildDefaultCategories()
  );
  const [crossSell, setCrossSell] = useState<CrossSellItem[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAdaptation, setLastAdaptation] = useState<number | null>(null);
  // Sinaliza que há uma nova vitrine adaptada aguardando a próxima navegação
  const [hasPendingAdaptation, setHasPendingAdaptation] = useState(false);

  // Última adaptação calculada pelo backend, ainda NÃO aplicada à UI
  const pendingRef = useRef<AdaptiveResponse | null>(null);

  // Gerar sessionId somente no client para evitar hydration mismatch
  useEffect(() => {
    setSessionId(generateSessionId());
  }, []);

  // Debounce rápido para VIEW events (evitar flood)
  const viewTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Registra um evento de clickstream no backend.
   * Chamado pelos componentes sempre que o usuário interage.
   *
   * NÃO aplica a adaptação à vitrine imediatamente — apenas guarda
   * o resultado como "pendente" para ser commitado na próxima
   * navegação entre telas.
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

      // O contador de eventos é telemetria (não é "adaptação"), pode
      // refletir o registro em tempo real para dar feedback ao usuário.
      setEventCount(data.totalEventsProcessed);

      // A vitrine adaptada fica PENDENTE: só é aplicada ao navegar.
      pendingRef.current = data;
      setHasPendingAdaptation(true);
    } catch (err) {
      console.error("Erro ao enviar evento:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Aplica a adaptação pendente à vitrine visível.
   * Deve ser chamado nas transições de tela (catálogo ↔ carrinho,
   * seleção de categoria, etc.). É um no-op se não houver pendência.
   */
  const commitAdaptation = useCallback(() => {
    const data = pendingRef.current;
    if (!data) return;

    setCategories(data.adaptedCategories);
    setCrossSell(data.crossSellSuggestions);
    setLastAdaptation(data.adaptationTimestampMs);

    pendingRef.current = null;
    setHasPendingAdaptation(false);
  }, []);

  return {
    sessionId,
    categories,
    crossSell,
    eventCount,
    isLoading,
    lastAdaptation,
    hasPendingAdaptation,
    sendEvent,
    commitAdaptation,
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
