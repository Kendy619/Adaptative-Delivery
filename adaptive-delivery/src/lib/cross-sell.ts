import {
  CATEGORIES,
  type CategoryKey,
  type CrossSellItem,
  type CategoryMeta,
} from "./types";

const MAX_SUGGESTIONS = 4;

/**
 * Gera sugestões de venda cruzada (RN04).
 *
 * Exemplo: usuário vê "Coxinha" (SALGADOS)
 *   → Sugere BEBIDAS ("Que tal uma bebida?") + MOLHOS ("Realce o sabor!")
 */
export function generateCrossSell(
  categoryKey: CategoryKey,
  itemName?: string
): CrossSellItem[] {
  const meta = CATEGORIES[categoryKey];
  if (!meta || meta.crossSell.length === 0) return [];

  const context = itemName || meta.displayName;

  return meta.crossSell.slice(0, MAX_SUGGESTIONS).map((relatedKey) => {
    const related = CATEGORIES[relatedKey];
    return {
      category: relatedKey,
      displayName: related.displayName,
      emoji: related.emoji,
      reason: buildReason(related, context),
    };
  });
}

function buildReason(target: CategoryMeta, itemContext: string): string {
  const reasons: Record<CategoryKey, string> = {
    BEBIDAS: `Que tal uma bebida para acompanhar o seu ${itemContext}?`,
    SALGADOS: "Complemente com um salgado crocante!",
    DOCES: `Uma sobremesa perfeita para depois do ${itemContext}!`,
    CAFES: `Um café combina perfeitamente com ${itemContext}!`,
    MOLHOS: "Nossos molhos especiais vão realçar o sabor!",
    ACOMPANHAMENTOS: "Adicione um acompanhamento ao seu pedido!",
    SOBREMESAS: "Finalize com uma sobremesa irresistível!",
    LANCHES: "Aproveite nossos lanches especiais!",
    PIZZAS: "Que tal adicionar uma pizza ao pedido?",
    PROMOCOES: "Confira nossas promoções imperdíveis!",
  };
  return reasons[target.key] || `Combine com ${target.displayName}!`;
}
