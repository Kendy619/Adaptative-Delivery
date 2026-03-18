<p align="center">
  <h1 align="center">🛵 Adaptive Delivery System</h1>
  <p align="center">
    <strong>Vitrine inteligente que se adapta em tempo real ao comportamento do usuário</strong>
  </p>
  <p align="center">
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-000?logo=nextdotjs&logoColor=white" />
    <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white" />
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" />
    <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" />
    <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" />
  </p>
</p>

---

## 📋 Sobre o Projeto

O **Adaptive Delivery** é um sistema de delivery que **reordena a vitrine de categorias e gera sugestões de venda cruzada em tempo real**, com base no clickstream do usuário durante a sessão ativa.

Enquanto o usuário navega pela interface, o sistema:

1. **Monitora** cada interação (visualização, clique, busca, favorito, adicionar ao carrinho)
2. **Calcula scores** ponderados por tipo de evento com decaimento temporal
3. **Reordena** as categorias da vitrine para priorizar interesses detectados
4. **Sugere** produtos complementares via venda cruzada inteligente

> 💡 Projeto desenvolvido para fins acadêmicos, demonstrando conceitos de personalização em tempo real aplicados a plataformas de delivery.

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🔄 **Vitrine Adaptativa** | Categorias reordenadas dinamicamente com base no comportamento |
| 🛒 **Venda Cruzada** | Sugestões automáticas de produtos complementares |
| 📊 **Clickstream** | Captura de eventos em tempo real (view, click, search, favorite, add_to_cart) |
| ⚡ **Adaptação Instantânea** | Re-renderização imediata após cada interação |
| 🐛 **Painel de Debug** | Visualização dos scores e ranking em tempo real (para avaliação acadêmica) |
| 📦 **Catálogo Rico** | 100 produtos distribuídos em 10 categorias |

---

## 🏗️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Front-end** | React 18 + Tailwind CSS 3.4 + Framer Motion |
| **Back-end** | Next.js 14 (API Routes) |
| **Banco de Dados** | PostgreSQL 16 |
| **Linguagem** | TypeScript 5.4 |
| **Containerização** | Docker + Docker Compose |
| **Deploy** | Vercel, AWS Amplify ou Docker |

---

## 📂 Estrutura de Pastas

```
adaptive-delivery/
├── docker-compose.yml        # Orquestração: PostgreSQL + App
├── Dockerfile                # Build multi-stage da aplicação
├── package.json
├── next.config.js
├── tailwind.config.js
├── .env.example              # Variáveis de ambiente
└── src/
    ├── app/
    │   ├── layout.tsx        # Layout raiz
    │   ├── page.tsx          # Página principal (vitrine)
    │   ├── globals.css
    │   └── api/session/
    │       ├── event/route.ts          # POST – registra evento
    │       └── recommendations/route.ts # GET – consulta recomendações
    ├── lib/
    │   ├── types.ts              # Tipos, enums, constantes
    │   ├── db.ts                 # Client PostgreSQL (singleton)
    │   ├── session-repository.ts # Repositório de sessão
    │   ├── adaptation-engine.ts  # Motor de adaptação (core)
    │   └── cross-sell.ts         # Lógica de venda cruzada
    ├── hooks/
    │   └── useAdaptiveSession.ts # Hook de sessão adaptativa
    ├── components/
    │   ├── Header.tsx
    │   ├── CategoryPills.tsx     # Categorias reordenáveis
    │   ├── ProductCard.tsx       # Card de produto com rastreio
    │   ├── CrossSellBanner.tsx   # Banner de venda cruzada
    │   └── AdaptiveDebugPanel.tsx# Painel de debug acadêmico
    └── data/
        └── products.ts          # Catálogo de 100 produtos
```

---

## 🚀 Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [Docker](https://www.docker.com/) e Docker Compose (opcional)
- [PostgreSQL](https://www.postgresql.org/) 16 (se não usar Docker)

### Opção 1: Docker Compose (recomendado)

```bash
# Subir toda a stack (PostgreSQL + App)
docker-compose up --build

# Acesse http://localhost:3000
```

### Opção 2: Execução Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com a URL do seu PostgreSQL

# 3. (Opcional) Subir apenas o PostgreSQL via Docker
docker run -d \
  --name pg-adaptive \
  -e POSTGRES_DB=adaptive_delivery \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine

# 4. Rodar em modo de desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

---

## ⚙️ Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://postgres:postgres@localhost:5432/adaptive_delivery` |
| `NEXT_PUBLIC_APP_NAME` | Nome exibido no header | `AdaptiveDelivery` |
| `SESSION_TTL_SECONDS` | Tempo de vida da sessão (segundos) | `1800` (30 min) |

---

## 🔌 API Endpoints

### `POST /api/session/event`

Registra um evento de clickstream e retorna a vitrine adaptada.

**Body (JSON):**
```json
{
  "sessionId": "uuid-da-sessao",
  "eventType": "click",
  "itemId": "salg_001",
  "itemName": "Coxinha de Frango",
  "category": "SALGADOS"
}
```

**Tipos de evento:** `view` (1.0) · `click` (2.0) · `search` (3.0) · `favorite` (4.0) · `add_to_cart` (5.0)

### `GET /api/session/recommendations?sessionId=uuid`

Consulta as recomendações atuais da sessão sem registrar novo evento.

---

## 🧠 Algoritmo de Adaptação

```
Evento → Decaimento (scores × 0.85) → Incremento (+ peso do evento) → Ranking → Cross-sell
```

1. **Captura**: cada interação gera um evento com tipo e categoria
2. **Decaimento**: scores anteriores são multiplicados por `0.85` (prioriza comportamento recente)
3. **Incremento**: a categoria do evento recebe o peso correspondente ao tipo
4. **Persistência**: o novo estado é salvo no PostgreSQL
5. **Ranking**: categorias são reordenadas por score decrescente
6. **Cross-sell**: sugestões baseadas no mapa de relações entre categorias

---

## 🍽️ Categorias do Catálogo

| Emoji | Categoria | Cross-sell sugerido |
|---|---|---|
| 🥟 | Salgados | Bebidas, Molhos |
| 🍬 | Doces | Bebidas, Cafés |
| 🥤 | Bebidas | Salgados, Lanches |
| 🍔 | Lanches | Bebidas, Acompanhamentos |
| 🍕 | Pizzas | Bebidas, Sobremesas |
| 🍰 | Sobremesas | Cafés, Bebidas |
| ☕ | Cafés | Doces, Salgados |
| 🍟 | Acompanhamentos | Lanches, Bebidas |
| 🫙 | Molhos | Salgados, Lanches |
| 🔥 | Promoções | — |

---

## 📄 Licença

Este projeto é de uso acadêmico. Consulte o autor para condições de uso.

---

<p align="center">
  Feito para disciplina de sistemas distribuídos - 2026.
</p>
