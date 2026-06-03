import { ORDER_HISTORY } from "@/data/orders";
import { PRODUCTS } from "@/data/products";
import type {
  CategoryKey,
  TicketInfo,
  TicketRecommendation,
} from "./types";

const MAX_RECOMMENDATIONS = 4;

/**
 * Calcula o ticket médio a partir do histórico de pedidos.
 */
export function calculateAverageTicket(): number {
  if (ORDER_HISTORY.length === 0) return 0;
  const sum = ORDER_HISTORY.reduce((acc, order) => acc + order.total, 0);
  return Math.round((sum / ORDER_HISTORY.length) * 100) / 100;
}

/**
 * Analisa as categorias mais compradas no histórico para entender
 * o perfil de consumo do cliente.
 */
function getCategoryFrequency(): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const order of ORDER_HISTORY) {
    for (const item of order.items) {
      freq[item.category] = (freq[item.category] || 0) + item.quantity;
    }
  }
  return freq;
}

/**
 * Gera recomendações inteligentes de produtos para que o valor
 * do carrinho atual atinja (ou se aproxime) do ticket médio.
 *
 * Estratégia:
 * 1. Calcula o gap (ticket médio - valor atual do carrinho)
 * 2. Se o gap <= 0, não recomenda (já atingiu)
 * 3. Filtra produtos que cabem no gap (preço <= gap)
 * 4. Prioriza:
 *    a) Categorias com alta afinidade no histórico do cliente
 *    b) Categorias com score alto na sessão atual (interesse recente)
 *    c) Produtos complementares ao que já está no carrinho
 * 5. Ordena por relevância e retorna até MAX_RECOMMENDATIONS
 */
export function generateTicketRecommendations(
  currentCartTotal: number,
  cartProductIds: string[],
  sessionScores: Record<string, number> = {}
): TicketInfo {
  const averageTicket = calculateAverageTicket();
  const gap = Math.round((averageTicket - currentCartTotal) * 100) / 100;

  // Se já atingiu ou ultrapassou o ticket médio
  if (gap <= 0) {
    return {
      averageTicket,
      currentCartTotal,
      gap: 0,
      recommendations: [],
    };
  }

  const categoryFreq = getCategoryFrequency();
  const cartCategories = new Set(
    cartProductIds
      .map((id) => PRODUCTS.find((p) => p.id === id)?.category)
      .filter(Boolean) as CategoryKey[]
  );

  // Produtos candidatos: não estão no carrinho e cabem no gap
  const candidates = PRODUCTS.filter(
    (p) => !cartProductIds.includes(p.id) && p.price <= gap && p.price > 0
  );

  // Pontua cada candidato
  const scored = candidates.map((product) => {
    let score = 0;

    // Afinidade histórica: categorias que o cliente mais compra
    const histFreq = categoryFreq[product.category] || 0;
    score += histFreq * 2;

    // Interesse na sessão atual
    const sessionScore = sessionScores[product.category] || 0;
    score += sessionScore * 3;

    // Complementaridade: se a categoria NÃO está no carrinho, é complementar
    if (!cartCategories.has(product.category)) {
      score += 5;
    }

    // Produtos com preço que mais se aproxima do gap (melhor uso do valor)
    const priceRatio = product.price / gap;
    score += priceRatio * 4;

    // Boost para produtos populares/destaque
    if (product.tags.includes("popular")) score += 2;
    if (product.tags.includes("destaque")) score += 3;

    return { product, score };
  });

  // Ordena por score decrescente
  scored.sort((a, b) => b.score - a.score);

  // Seleciona os melhores, sem repetir categorias para diversificar
  const recommendations: TicketRecommendation[] = [];
  const usedCategories = new Set<CategoryKey>();

  for (const { product } of scored) {
    if (recommendations.length >= MAX_RECOMMENDATIONS) break;

    // Diversifica categorias nas recomendações
    if (usedCategories.has(product.category) && recommendations.length < MAX_RECOMMENDATIONS - 1) {
      continue;
    }

    usedCategories.add(product.category);
    recommendations.push({
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: product.category,
      emoji: product.image,
      reason: buildTicketReason(product.price, gap, product.category),
    });
  }

  return {
    averageTicket,
    currentCartTotal,
    gap,
    recommendations,
  };
}

function buildTicketReason(
  price: number,
  gap: number,
  category: CategoryKey
): string {
  const percentage = Math.round((price / gap) * 100);

  if (percentage >= 80) {
    return `Completa seu pedido! Faltam apenas R$${gap.toFixed(2)} para o ticket ideal.`;
  }
  if (percentage >= 50) {
    return `Adicione por R$${price.toFixed(2)} e chegue mais perto do seu pedido ideal!`;
  }
  return `Por apenas R$${price.toFixed(2)} — combina perfeitamente com seu pedido!`;
}
