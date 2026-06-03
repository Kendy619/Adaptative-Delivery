import type { Order } from "@/lib/types";

/**
 * Histórico de pedidos mockados do cliente.
 * 20 pedidos com perfis variados para gerar um ticket médio realista.
 * Em produção, viria do banco de dados / microserviço de pedidos.
 */
export const ORDER_HISTORY: Order[] = [
  {
    id: "ped_001",
    date: "2026-03-01T12:30:00Z",
    items: [
      { productId: "lanc_001", productName: "X-Burguer Artesanal", category: "LANCHES", quantity: 1, unitPrice: 25.9 },
      { productId: "beb_001", productName: "Refrigerante Lata", category: "BEBIDAS", quantity: 2, unitPrice: 5.0 },
      { productId: "acomp_001", productName: "Batata Frita", category: "ACOMPANHAMENTOS", quantity: 1, unitPrice: 14.9 },
    ],
    total: 50.8,
  },
  {
    id: "ped_002",
    date: "2026-03-03T19:15:00Z",
    items: [
      { productId: "pizza_001", productName: "Margherita", category: "PIZZAS", quantity: 1, unitPrice: 39.9 },
      { productId: "beb_005", productName: "Limonada Suíça", category: "BEBIDAS", quantity: 1, unitPrice: 9.9 },
      { productId: "sobre_003", productName: "Pudim de Leite", category: "SOBREMESAS", quantity: 1, unitPrice: 12.9 },
    ],
    total: 62.7,
  },
  {
    id: "ped_003",
    date: "2026-03-05T13:00:00Z",
    items: [
      { productId: "promo_003", productName: "Combo Lanche + Batata + Bebida", category: "PROMOCOES", quantity: 1, unitPrice: 34.9 },
      { productId: "doce_002", productName: "Churros Recheado", category: "DOCES", quantity: 2, unitPrice: 9.9 },
    ],
    total: 54.7,
  },
  {
    id: "ped_004",
    date: "2026-03-07T20:00:00Z",
    items: [
      { productId: "pizza_006", productName: "Pepperoni", category: "PIZZAS", quantity: 1, unitPrice: 41.9 },
      { productId: "pizza_002", productName: "Calabresa", category: "PIZZAS", quantity: 1, unitPrice: 35.9 },
      { productId: "beb_008", productName: "Refrigerante 2L", category: "BEBIDAS", quantity: 1, unitPrice: 12.9 },
    ],
    total: 90.7,
  },
  {
    id: "ped_005",
    date: "2026-03-09T12:00:00Z",
    items: [
      { productId: "lanc_004", productName: "X-Bacon Duplo", category: "LANCHES", quantity: 1, unitPrice: 32.9 },
      { productId: "acomp_008", productName: "Batata com Cheddar e Bacon", category: "ACOMPANHAMENTOS", quantity: 1, unitPrice: 22.9 },
      { productId: "beb_006", productName: "Milkshake de Chocolate", category: "BEBIDAS", quantity: 1, unitPrice: 14.9 },
    ],
    total: 70.7,
  },
  {
    id: "ped_006",
    date: "2026-03-11T14:30:00Z",
    items: [
      { productId: "salg_001", productName: "Coxinha de Frango", category: "SALGADOS", quantity: 3, unitPrice: 7.9 },
      { productId: "salg_005", productName: "Pastel de Carne", category: "SALGADOS", quantity: 2, unitPrice: 8.9 },
      { productId: "beb_002", productName: "Suco Natural", category: "BEBIDAS", quantity: 1, unitPrice: 8.9 },
    ],
    total: 50.4,
  },
  {
    id: "ped_007",
    date: "2026-03-13T18:45:00Z",
    items: [
      { productId: "lanc_007", productName: "X-Tudo", category: "LANCHES", quantity: 1, unitPrice: 29.9 },
      { productId: "beb_001", productName: "Refrigerante Lata", category: "BEBIDAS", quantity: 1, unitPrice: 5.0 },
      { productId: "molho_001", productName: "Molho Barbecue", category: "MOLHOS", quantity: 1, unitPrice: 3.5 },
    ],
    total: 38.4,
  },
  {
    id: "ped_008",
    date: "2026-03-15T20:30:00Z",
    items: [
      { productId: "promo_001", productName: "Combo Família", category: "PROMOCOES", quantity: 1, unitPrice: 69.9 },
      { productId: "sobre_005", productName: "Cheesecake de Frutas Vermelhas", category: "SOBREMESAS", quantity: 1, unitPrice: 18.9 },
    ],
    total: 88.8,
  },
  {
    id: "ped_009",
    date: "2026-03-17T15:00:00Z",
    items: [
      { productId: "cafe_002", productName: "Cappuccino", category: "CAFES", quantity: 2, unitPrice: 12.9 },
      { productId: "doce_001", productName: "Brigadeiro Gourmet", category: "DOCES", quantity: 1, unitPrice: 15.9 },
      { productId: "doce_003", productName: "Bolo de Cenoura", category: "DOCES", quantity: 1, unitPrice: 10.9 },
    ],
    total: 52.6,
  },
  {
    id: "ped_010",
    date: "2026-03-19T12:15:00Z",
    items: [
      { productId: "lanc_003", productName: "Wrap de Frango", category: "LANCHES", quantity: 1, unitPrice: 19.9 },
      { productId: "beb_003", productName: "Água de Coco", category: "BEBIDAS", quantity: 1, unitPrice: 6.5 },
    ],
    total: 26.4,
  },
  {
    id: "ped_011",
    date: "2026-03-20T19:00:00Z",
    items: [
      { productId: "pizza_008", productName: "Bacon com Cheddar", category: "PIZZAS", quantity: 1, unitPrice: 43.9 },
      { productId: "beb_005", productName: "Limonada Suíça", category: "BEBIDAS", quantity: 2, unitPrice: 9.9 },
      { productId: "sobre_001", productName: "Petit Gâteau", category: "SOBREMESAS", quantity: 1, unitPrice: 22.9 },
    ],
    total: 86.6,
  },
  {
    id: "ped_012",
    date: "2026-03-21T13:30:00Z",
    items: [
      { productId: "promo_007", productName: "Combo Solo", category: "PROMOCOES", quantity: 1, unitPrice: 24.9 },
      { productId: "acomp_003", productName: "Nuggets de Frango", category: "ACOMPANHAMENTOS", quantity: 1, unitPrice: 18.9 },
    ],
    total: 43.8,
  },
  {
    id: "ped_013",
    date: "2026-03-22T20:00:00Z",
    items: [
      { productId: "pizza_004", productName: "Frango com Catupiry", category: "PIZZAS", quantity: 1, unitPrice: 38.9 },
      { productId: "beb_001", productName: "Refrigerante Lata", category: "BEBIDAS", quantity: 2, unitPrice: 5.0 },
      { productId: "molho_008", productName: "Chimichurri", category: "MOLHOS", quantity: 1, unitPrice: 4.9 },
    ],
    total: 53.8,
  },
  {
    id: "ped_014",
    date: "2026-03-23T12:00:00Z",
    items: [
      { productId: "lanc_002", productName: "Hot Dog Completo", category: "LANCHES", quantity: 2, unitPrice: 18.5 },
      { productId: "beb_009", productName: "Vitamina de Banana", category: "BEBIDAS", quantity: 1, unitPrice: 10.9 },
      { productId: "acomp_004", productName: "Mandioca Frita", category: "ACOMPANHAMENTOS", quantity: 1, unitPrice: 13.9 },
    ],
    total: 61.8,
  },
  {
    id: "ped_015",
    date: "2026-03-24T17:00:00Z",
    items: [
      { productId: "promo_005", productName: "Combo Café da Tarde", category: "PROMOCOES", quantity: 1, unitPrice: 14.9 },
      { productId: "doce_005", productName: "Trufa de Maracujá", category: "DOCES", quantity: 1, unitPrice: 13.9 },
    ],
    total: 28.8,
  },
  {
    id: "ped_016",
    date: "2026-03-25T19:30:00Z",
    items: [
      { productId: "lanc_001", productName: "X-Burguer Artesanal", category: "LANCHES", quantity: 2, unitPrice: 25.9 },
      { productId: "acomp_001", productName: "Batata Frita", category: "ACOMPANHAMENTOS", quantity: 2, unitPrice: 14.9 },
      { productId: "beb_008", productName: "Refrigerante 2L", category: "BEBIDAS", quantity: 1, unitPrice: 12.9 },
      { productId: "sobre_006", productName: "Sorvete Artesanal 2 Bolas", category: "SOBREMESAS", quantity: 2, unitPrice: 13.9 },
    ],
    total: 122.3,
  },
  {
    id: "ped_017",
    date: "2026-03-26T13:00:00Z",
    items: [
      { productId: "salg_007", productName: "Risole de Camarão", category: "SALGADOS", quantity: 2, unitPrice: 9.9 },
      { productId: "salg_001", productName: "Coxinha de Frango", category: "SALGADOS", quantity: 2, unitPrice: 7.9 },
      { productId: "beb_004", productName: "Chá Gelado", category: "BEBIDAS", quantity: 1, unitPrice: 6.9 },
      { productId: "molho_006", productName: "Geleia de Pimenta", category: "MOLHOS", quantity: 1, unitPrice: 4.9 },
    ],
    total: 47.4,
  },
  {
    id: "ped_018",
    date: "2026-03-27T20:15:00Z",
    items: [
      { productId: "promo_004", productName: "Festival de Pizzas", category: "PROMOCOES", quantity: 1, unitPrice: 59.9 },
      { productId: "beb_005", productName: "Limonada Suíça", category: "BEBIDAS", quantity: 2, unitPrice: 9.9 },
    ],
    total: 79.7,
  },
  {
    id: "ped_019",
    date: "2026-03-28T14:00:00Z",
    items: [
      { productId: "cafe_004", productName: "Mocha", category: "CAFES", quantity: 1, unitPrice: 14.9 },
      { productId: "sobre_007", productName: "Tiramisu", category: "SOBREMESAS", quantity: 1, unitPrice: 19.9 },
    ],
    total: 34.8,
  },
  {
    id: "ped_020",
    date: "2026-03-30T19:00:00Z",
    items: [
      { productId: "pizza_003", productName: "Quatro Queijos", category: "PIZZAS", quantity: 1, unitPrice: 42.9 },
      { productId: "acomp_007", productName: "Dadinhos de Tapioca", category: "ACOMPANHAMENTOS", quantity: 1, unitPrice: 17.9 },
      { productId: "beb_006", productName: "Milkshake de Chocolate", category: "BEBIDAS", quantity: 1, unitPrice: 14.9 },
      { productId: "sobre_005", productName: "Cheesecake de Frutas Vermelhas", category: "SOBREMESAS", quantity: 1, unitPrice: 18.9 },
    ],
    total: 94.6,
  },
];
