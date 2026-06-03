import { PRODUCTS } from "@/data/products";
import { CATEGORIES, type CategoryKey, type Product } from "./types";

/**
 * ── Motor de Upsell do Carrinho (RN04 — nível de produto) ───
 *
 * Enquanto o cross-sell da vitrine sugere CATEGORIAS, este motor
 * sugere PRODUTOS concretos que combinam com o que já está no
 * carrinho do cliente, para serem oferecidos na tela do carrinho.
 *
 * Estratégia:
 * 1. Descobre as categorias presentes no carrinho.
 * 2. Para cada categoria, soma as categorias complementares
 *    (CATEGORIES[cat].crossSell) — quanto mais itens do carrinho
 *    apontarem para uma categoria, mais relevante ela fica.
 * 3. Pontua produtos candidatos (fora do carrinho) por
 *    complementaridade, interesse na sessão, popularidade e preço.
 * 4. Diversifica por categoria e retorna os melhores.
 */

const MAX_UPSELLS = 4;

export interface UpsellSuggestion {
  product: Product;
  reason: string;
}

export function generateCartUpsells(
  cartProductIds: string[],
  sessionScores: Record<string, number> = {}
): UpsellSuggestion[] {
  if (cartProductIds.length === 0) return [];

  const cartIdSet = new Set(cartProductIds);
  const cartProducts = cartProductIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const cartCategories = new Set(cartProducts.map((p) => p.category));

  // Quantas vezes cada categoria é sugerida como complemento pelos itens do carrinho
  const complementScore: Record<string, number> = {};
  for (const cat of cartCategories) {
    for (const related of CATEGORIES[cat].crossSell) {
      complementScore[related] = (complementScore[related] || 0) + 1;
    }
  }

  const scored = PRODUCTS.filter((p) => !cartIdSet.has(p.id))
    .map((product) => {
      let score = 0;

      // Complementaridade com o pedido atual (sinal mais forte)
      score += (complementScore[product.category] || 0) * 4;

      // Interesse recente demonstrado na sessão
      score += (sessionScores[product.category] || 0) * 1.5;

      // Popularidade / destaque do produto
      if (product.tags.includes("popular")) score += 2;
      if (product.tags.includes("destaque")) score += 2;

      // Add-ons baratos entram com mais facilidade no pedido
      if (product.price <= 15) score += 1;

      return { product, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // 1ª passada: diversifica por categoria
  const result: UpsellSuggestion[] = [];
  const usedCategories = new Set<CategoryKey>();
  for (const { product } of scored) {
    if (result.length >= MAX_UPSELLS) break;
    if (usedCategories.has(product.category)) continue;
    usedCategories.add(product.category);
    result.push({
      product,
      reason: buildUpsellReason(product.category, cartProducts),
    });
  }

  // 2ª passada: completa as vagas restantes se a diversificação deixou poucas
  if (result.length < MAX_UPSELLS) {
    const chosen = new Set(result.map((r) => r.product.id));
    for (const { product } of scored) {
      if (result.length >= MAX_UPSELLS) break;
      if (chosen.has(product.id)) continue;
      result.push({
        product,
        reason: buildUpsellReason(product.category, cartProducts),
      });
    }
  }

  return result;
}

function buildUpsellReason(
  target: CategoryKey,
  cartProducts: Product[]
): string {
  const context = cartProducts[0]?.name ?? "seu pedido";

  const reasons: Partial<Record<CategoryKey, string>> = {
    BEBIDAS: `Que tal uma bebida para acompanhar ${context}?`,
    MOLHOS: "Realce o sabor com um molho especial!",
    ACOMPANHAMENTOS: "Um acompanhamento cai super bem!",
    SOBREMESAS: "Finalize com uma sobremesa irresistível!",
    DOCES: "Um docinho para fechar o pedido?",
    CAFES: "Um café combina demais com o seu pedido!",
    SALGADOS: "Adicione um salgado crocante!",
    LANCHES: "Complete o pedido com um lanche!",
    PIZZAS: "Que tal uma pizza para dividir?",
    PROMOCOES: "Aproveite uma promoção do dia!",
  };

  return reasons[target] ?? `Combina com ${context}!`;
}
