// ============================================================
// Tipos centrais do Adaptive Delivery System
// ============================================================

/** Tipos de evento capturados pelo clickstream (RN01) */
export type EventType = "view" | "click" | "add_to_cart" | "search" | "favorite";

/** Pesos por tipo de evento — quanto maior, mais forte o sinal de interesse */
export const EVENT_WEIGHTS: Record<EventType, number> = {
  view: 1.0,
  click: 2.0,
  search: 3.0,
  favorite: 4.0,
  add_to_cart: 5.0,
};

/** Categorias do catálogo */
export type CategoryKey =
  | "SALGADOS"
  | "DOCES"
  | "BEBIDAS"
  | "LANCHES"
  | "PIZZAS"
  | "SOBREMESAS"
  | "CAFES"
  | "ACOMPANHAMENTOS"
  | "MOLHOS"
  | "PROMOCOES";

/** Metadados de cada categoria */
export interface CategoryMeta {
  key: CategoryKey;
  displayName: string;
  emoji: string;
  crossSell: CategoryKey[];
}

/** Mapa completo de categorias com cross-sell (RN04) */
export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  SALGADOS: {
    key: "SALGADOS",
    displayName: "Salgados",
    emoji: "🥟",
    crossSell: ["BEBIDAS", "MOLHOS", "ACOMPANHAMENTOS", "CAFES", "LANCHES"],
  },
  DOCES: {
    key: "DOCES",
    displayName: "Doces",
    emoji: "🍬",
    crossSell: ["CAFES", "BEBIDAS", "SOBREMESAS", "PROMOCOES"],
  },
  BEBIDAS: {
    key: "BEBIDAS",
    displayName: "Bebidas",
    emoji: "🥤",
    crossSell: ["SALGADOS", "LANCHES", "PIZZAS", "ACOMPANHAMENTOS", "PROMOCOES"],
  },
  LANCHES: {
    key: "LANCHES",
    displayName: "Lanches",
    emoji: "🍔",
    crossSell: ["BEBIDAS", "ACOMPANHAMENTOS", "MOLHOS", "SOBREMESAS", "PROMOCOES"],
  },
  PIZZAS: {
    key: "PIZZAS",
    displayName: "Pizzas",
    emoji: "🍕",
    crossSell: ["BEBIDAS", "SOBREMESAS", "ACOMPANHAMENTOS", "MOLHOS", "PROMOCOES"],
  },
  SOBREMESAS: {
    key: "SOBREMESAS",
    displayName: "Sobremesas",
    emoji: "🍰",
    crossSell: ["CAFES", "BEBIDAS", "DOCES", "PROMOCOES"],
  },
  CAFES: {
    key: "CAFES",
    displayName: "Cafés",
    emoji: "☕",
    crossSell: ["DOCES", "SALGADOS", "SOBREMESAS", "LANCHES"],
  },
  ACOMPANHAMENTOS: {
    key: "ACOMPANHAMENTOS",
    displayName: "Acompanhamentos",
    emoji: "🍟",
    crossSell: ["LANCHES", "BEBIDAS", "MOLHOS", "PIZZAS", "PROMOCOES"],
  },
  MOLHOS: {
    key: "MOLHOS",
    displayName: "Molhos",
    emoji: "🫙",
    crossSell: ["SALGADOS", "LANCHES", "ACOMPANHAMENTOS", "PIZZAS"],
  },
  PROMOCOES: {
    key: "PROMOCOES",
    displayName: "Promoções",
    emoji: "🔥",
    crossSell: ["LANCHES", "PIZZAS", "BEBIDAS", "SOBREMESAS"],
  },
};

/** Ordem padrão da vitrine (antes de qualquer adaptação) */
export const DEFAULT_CATEGORY_ORDER: CategoryKey[] = [
  "PROMOCOES",
  "LANCHES",
  "PIZZAS",
  "BEBIDAS",
  "SALGADOS",
  "DOCES",
  "SOBREMESAS",
  "CAFES",
  "ACOMPANHAMENTOS",
  "MOLHOS",
];

// ============================================================
// DTOs — Request / Response
// ============================================================

/** Payload enviado pelo front-end a cada interação */
export interface ClickEventRequest {
  sessionId: string;
  eventType: EventType;
  itemId: string;
  itemName: string;
  category: CategoryKey;
}

/** Uma categoria na vitrine adaptada */
export interface CategoryRecommendation {
  category: CategoryKey;
  displayName: string;
  emoji: string;
  score: number;
  rank: number;
  highlighted: boolean;
}

/** Sugestão de venda cruzada */
export interface CrossSellItem {
  category: CategoryKey;
  displayName: string;
  emoji: string;
  reason: string;
}

/** Resposta completa da API */
export interface AdaptiveResponse {
  sessionId: string;
  adaptedCategories: CategoryRecommendation[];
  crossSellSuggestions: CrossSellItem[];
  totalEventsProcessed: number;
  adaptationTimestampMs: number;
}

// ============================================================
// PostgreSQL — Estado da Sessão
// ============================================================

/** Item persistido no PostgreSQL */
export interface SessionStateRecord {
  sessionId: string; // PK
  eventTimestamp: string; // SK (ISO-8601)
  categoryScores: Record<string, number>;
  lastItemViewed: string;
  lastCategory: string;
  eventType: string;
  eventCount: number;
  ttl: number; // epoch seconds
}

// ============================================================
// Produto (dados do catálogo mock para a interface)
// ============================================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryKey;
  image: string;
  tags: string[];
}
