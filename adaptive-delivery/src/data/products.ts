import { Product } from "@/lib/types";

/**
 * Catálogo de produtos mock.
 * Em produção, viria de um microserviço de catálogo ou do DynamoDB.
 */
export const PRODUCTS: Product[] = [
  // === SALGADOS ===
  {
    id: "salg_001",
    name: "Coxinha de Frango",
    description: "Crocante por fora, cremosa por dentro. Frango desfiado com catupiry.",
    price: 7.9,
    category: "SALGADOS",
    image: "🥟",
    tags: ["popular", "tradição"],
  },
  {
    id: "salg_002",
    name: "Empada de Palmito",
    description: "Massa folhada artesanal recheada com palmito fresco.",
    price: 6.5,
    category: "SALGADOS",
    image: "🥧",
    tags: ["vegetariano"],
  },
  {
    id: "salg_003",
    name: "Bolinha de Queijo",
    description: "Queijo meia-cura empanado e frito na hora.",
    price: 5.9,
    category: "SALGADOS",
    image: "🧀",
    tags: ["vegetariano", "popular"],
  },
  {
    id: "salg_004",
    name: "Kibe Frito",
    description: "Kibe crocante de carne bovina com temperos árabes.",
    price: 7.5,
    category: "SALGADOS",
    image: "🥩",
    tags: ["tradição"],
  },

  // === BEBIDAS ===
  {
    id: "beb_001",
    name: "Refrigerante Lata",
    description: "Coca-Cola, Guaraná ou Fanta. Bem gelado!",
    price: 5.0,
    category: "BEBIDAS",
    image: "🥤",
    tags: ["popular"],
  },
  {
    id: "beb_002",
    name: "Suco Natural",
    description: "Laranja, limão, maracujá ou abacaxi. Feito na hora.",
    price: 8.9,
    category: "BEBIDAS",
    image: "🧃",
    tags: ["saudável"],
  },
  {
    id: "beb_003",
    name: "Água de Coco",
    description: "Água de coco natural gelada.",
    price: 6.5,
    category: "BEBIDAS",
    image: "🥥",
    tags: ["saudável", "popular"],
  },

  // === LANCHES ===
  {
    id: "lanc_001",
    name: "X-Burguer Artesanal",
    description: "Blend bovino 180g, cheddar, alface, tomate e molho especial.",
    price: 25.9,
    category: "LANCHES",
    image: "🍔",
    tags: ["popular", "destaque"],
  },
  {
    id: "lanc_002",
    name: "Hot Dog Completo",
    description: "Salsicha premium com purê, milho, batata palha e molhos.",
    price: 18.5,
    category: "LANCHES",
    image: "🌭",
    tags: ["popular"],
  },
  {
    id: "lanc_003",
    name: "Wrap de Frango",
    description: "Tortilha integral com frango grelhado, rúcula e cream cheese.",
    price: 19.9,
    category: "LANCHES",
    image: "🌯",
    tags: ["saudável"],
  },

  // === PIZZAS ===
  {
    id: "pizza_001",
    name: "Margherita",
    description: "Molho de tomate San Marzano, muçarela de búfala e manjericão.",
    price: 39.9,
    category: "PIZZAS",
    image: "🍕",
    tags: ["clássica", "popular"],
  },
  {
    id: "pizza_002",
    name: "Calabresa",
    description: "Calabresa fatiada, cebola roxa e azeitonas pretas.",
    price: 35.9,
    category: "PIZZAS",
    image: "🍕",
    tags: ["clássica"],
  },
  {
    id: "pizza_003",
    name: "Quatro Queijos",
    description: "Muçarela, provolone, gorgonzola e parmesão.",
    price: 42.9,
    category: "PIZZAS",
    image: "🍕",
    tags: ["premium"],
  },

  // === DOCES ===
  {
    id: "doce_001",
    name: "Brigadeiro Gourmet",
    description: "Brigadeiro belga com granulado crocante. Caixa com 6.",
    price: 15.9,
    category: "DOCES",
    image: "🍫",
    tags: ["popular", "presente"],
  },
  {
    id: "doce_002",
    name: "Churros Recheado",
    description: "Churros crocante com doce de leite e canela.",
    price: 9.9,
    category: "DOCES",
    image: "🥖",
    tags: ["popular"],
  },

  // === SOBREMESAS ===
  {
    id: "sobre_001",
    name: "Petit Gâteau",
    description: "Bolo de chocolate com centro cremoso, servido com sorvete.",
    price: 22.9,
    category: "SOBREMESAS",
    image: "🍰",
    tags: ["premium"],
  },
  {
    id: "sobre_002",
    name: "Açaí 500ml",
    description: "Açaí batido com banana, granola, leite em pó e mel.",
    price: 19.9,
    category: "SOBREMESAS",
    image: "🫐",
    tags: ["popular", "saudável"],
  },

  // === CAFÉS ===
  {
    id: "cafe_001",
    name: "Espresso Duplo",
    description: "Café especial moído na hora, extração perfeita.",
    price: 8.5,
    category: "CAFES",
    image: "☕",
    tags: ["premium"],
  },
  {
    id: "cafe_002",
    name: "Cappuccino",
    description: "Espresso com leite vaporizado e espuma cremosa.",
    price: 12.9,
    category: "CAFES",
    image: "☕",
    tags: ["popular"],
  },

  // === ACOMPANHAMENTOS ===
  {
    id: "acomp_001",
    name: "Batata Frita",
    description: "Batata rústica crocante com sal e ervas.",
    price: 14.9,
    category: "ACOMPANHAMENTOS",
    image: "🍟",
    tags: ["popular"],
  },
  {
    id: "acomp_002",
    name: "Onion Rings",
    description: "Anéis de cebola empanados e fritos.",
    price: 16.9,
    category: "ACOMPANHAMENTOS",
    image: "🧅",
    tags: [],
  },

  // === MOLHOS ===
  {
    id: "molho_001",
    name: "Molho Barbecue",
    description: "Molho barbecue defumado artesanal.",
    price: 3.5,
    category: "MOLHOS",
    image: "🫙",
    tags: ["popular"],
  },
  {
    id: "molho_002",
    name: "Maionese Temperada",
    description: "Maionese da casa com ervas finas e alho.",
    price: 3.5,
    category: "MOLHOS",
    image: "🫙",
    tags: [],
  },

  // === PROMOÇÕES ===
  {
    id: "promo_001",
    name: "Combo Família",
    description: "2 Lanches + 2 Bebidas + 1 Sobremesa com 20% OFF.",
    price: 69.9,
    category: "PROMOCOES",
    image: "🔥",
    tags: ["destaque", "economia"],
  },
  {
    id: "promo_002",
    name: "Happy Hour Salgados",
    description: "5 salgados sortidos + 1 refrigerante. Válido até 18h.",
    price: 29.9,
    category: "PROMOCOES",
    image: "🔥",
    tags: ["destaque", "economia"],
  },
];
