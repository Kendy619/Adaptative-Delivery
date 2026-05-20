# Adaptive Delivery System – Arquitetura (Next.js + React + Tailwind)

## Visão Geral

Sistema de Delivery Adaptativo **full-stack** que reordena a vitrine de categorias
e gera sugestões de venda cruzada **em tempo real**, reagindo ao clickstream do
usuário durante a sessão ativa.

A arquitetura segue o loop **MAPE-K** (IBM Autonomic Computing) — ver
`architecture-mape-k.drawio` na raiz do repositório para o diagrama completo.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          Next.js Application                            │
│                                                                         │
│  ┌─────────────────────────────┐    ┌────────────────────────────────┐  │
│  │     FRONT-END (React)       │    │     BACK-END (API Routes)      │  │
│  │     Managed Element         │    │     Autonomic Manager          │  │
│  │                             │    │                                │  │
│  │  page.tsx                   │    │  POST /api/session/event       │  │
│  │    ├─ Header                │───▶│    → event-monitor             │  │
│  │    ├─ CategoryPills   ◀─────│────│    → adaptation-engine         │  │
│  │    ├─ CrossSellBanner       │    │    → cross-sell                │  │
│  │    ├─ ProductCard[]         │    │    → session-repository        │  │
│  │    ├─ CartDrawer            │    │                                │  │
│  │    └─ AdaptiveDebugPanel    │    │  GET /api/session/recs         │  │
│  │                             │    │    → adaptation-engine         │  │
│  │  useAdaptiveSession()       │    │    → rankCategories()          │  │
│  │  useCart()                  │    │                                │  │
│  └─────────────────────────────┘    └──────────────┬─────────────────┘  │
│                                                    │                    │
└────────────────────────────────────────────────────┼────────────────────┘
                                                     │
                                              ┌──────▼──────┐
                                              │ PostgreSQL  │
                                              │ session_    │
                                              │ state       │
                                              └─────────────┘
```

---

## Stack Tecnológica

| Camada          | Tecnologia                              |
|-----------------|-----------------------------------------|
| Front-end       | React 18 + Tailwind CSS 3.4 + Framer Motion |
| Back-end        | Next.js 14 (App Router / API Routes)    |
| Banco           | PostgreSQL 16 (driver `pg`)             |
| Linguagem       | TypeScript 5.4                          |
| Containerização | Docker + Docker Compose                 |
| Deploy          | Vercel, AWS Amplify ou Docker           |

---

## Mapeamento MAPE-K → Código

| Fase MAPE-K     | Responsabilidade              | Arquivo principal                  |
|-----------------|-------------------------------|------------------------------------|
| ① Monitor       | Coleta + agregação + persistência | `lib/event-monitor.ts`         |
| ② Analyze       | Ranking + destaque (sem I/O)  | `lib/adaptation-engine.ts`         |
| ③ Plan          | Sugestões de venda cruzada    | `lib/cross-sell.ts`                |
| ④ Execute       | Resposta JSON + reconciliação React | API routes + `useAdaptiveSession.ts` |
| ⑤ Knowledge     | Estado de sessão + regras     | PostgreSQL `session_state` + `lib/types.ts` |

---

## Estrutura de Pastas

```
adaptive-delivery/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── docs/
│   └── ARCHITECTURE.md
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx                 # Layout raiz
│   │   ├── page.tsx                   # Página principal (vitrine)
│   │   └── api/session/
│   │       ├── event/route.ts         # POST – registra clickstream
│   │       └── recommendations/route.ts # GET – consulta recomendações
│   ├── lib/
│   │   ├── types.ts                   # Tipos, enums, constantes (Knowledge)
│   │   ├── db.ts                      # Pool PostgreSQL (singleton) + initDb
│   │   ├── session-repository.ts      # Repositório da tabela session_state
│   │   ├── event-monitor.ts           # ① Monitor — coleta + agregação
│   │   ├── adaptation-engine.ts       # ② Analyze — ranking
│   │   └── cross-sell.ts              # ③ Plan — venda cruzada
│   ├── hooks/
│   │   ├── useAdaptiveSession.ts      # Hook de sessão adaptativa
│   │   └── useCart.ts                 # Carrinho de compras
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── CategoryPills.tsx          # Categorias reordenáveis
│   │   ├── ProductCard.tsx            # Card de produto com rastreio
│   │   ├── CrossSellBanner.tsx        # Banner de venda cruzada
│   │   ├── CartDrawer.tsx             # Drawer do carrinho
│   │   └── AdaptiveDebugPanel.tsx     # Painel de debug acadêmico
│   └── data/
│       └── products.ts                # Catálogo (100 produtos)
```

---

## Estrutura do Banco de Dados (PostgreSQL)

### Tabela: `session_state`

Cada evento gera um novo registro (event sourcing simplificado). A leitura
busca sempre o registro mais recente da sessão.

```sql
CREATE TABLE IF NOT EXISTS session_state (
  id              SERIAL PRIMARY KEY,
  session_id      VARCHAR(255) NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category_scores JSONB NOT NULL DEFAULT '{}',
  last_item_viewed VARCHAR(255),
  last_category   VARCHAR(100),
  event_type      VARCHAR(50),
  event_count     INTEGER DEFAULT 0,
  ttl             BIGINT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_state_session_id
  ON session_state(session_id, event_timestamp DESC);
```

| Coluna             | Tipo         | Papel                                                |
|--------------------|--------------|------------------------------------------------------|
| `id`               | SERIAL       | Chave primária técnica                               |
| `session_id`       | VARCHAR(255) | Identificador da sessão (indexado)                   |
| `event_timestamp`  | TIMESTAMPTZ  | Momento do evento (ordenação cronológica)            |
| `category_scores`  | JSONB        | `{ "SALGADOS": 4.25, "BEBIDAS": 2.0 }`             |
| `last_item_viewed` | VARCHAR(255) | Nome do último item clicado                          |
| `last_category`    | VARCHAR(100) | Categoria do último item                             |
| `event_type`       | VARCHAR(50)  | `view`, `click`, `add_to_cart`, etc.                 |
| `event_count`      | INTEGER      | Total de eventos na sessão                           |
| `ttl`              | BIGINT       | Epoch seconds (expiração lógica 30 min)              |
| `created_at`       | TIMESTAMPTZ  | Auditoria                                            |

> O `initDb()` em `lib/db.ts` cria a tabela e o índice automaticamente na
> primeira operação — não há migração separada.

---

## Algoritmo de Adaptação

```
[Usuário clica] → useAdaptiveSession.sendEvent()
       │
       ▼
POST /api/session/event
       │
       ├─ 1. Buscar último estado (SELECT … ORDER BY event_timestamp DESC LIMIT 1)
       ├─ 2. Aplicar decaimento temporal (scores × 0.85)
       ├─ 3. Incrementar categoria do evento (peso do eventType)
       ├─ 4. Persistir novo estado (INSERT em session_state)
       ├─ 5. Reordenar categorias por score (rankCategories)
       └─ 6. Gerar cross-sell → Retornar AdaptiveResponse
                                       │
                                       ▼
                              [Front-end re-renderiza]
                              CategoryPills reordena
                              CrossSellBanner aparece
```

### Pesos por Tipo de Evento

| EventType    | Peso | Raciocínio                              |
|--------------|------|-----------------------------------------|
| `view`       | 1.0  | Interesse leve                          |
| `click`      | 2.0  | Interesse moderado                      |
| `search`     | 3.0  | Interesse ativo                         |
| `favorite`   | 4.0  | Interesse forte                         |
| `add_to_cart`| 5.0  | Intenção de compra                      |

### Decaimento Temporal

```
score_atualizado = score_anterior × 0.85
```

### Parâmetros do loop

| Constante              | Valor | Origem                          |
|------------------------|-------|----------------------------------|
| `DECAY_FACTOR`         | 0.85  | `lib/event-monitor.ts`           |
| `SESSION_TTL_SECONDS`  | 1800  | `lib/event-monitor.ts`           |
| `HIGHLIGHT_THRESHOLD`  | 2.0   | `lib/adaptation-engine.ts`       |
| `MAX_SUGGESTIONS`      | 4     | `lib/cross-sell.ts`              |

---

## Rastreabilidade das Regras de Negócio

| Regra | Descrição                              | Implementação                             |
|-------|----------------------------------------|-------------------------------------------|
| RN01  | Monitorar navegação tempo real         | `useAdaptiveSession` → `POST /api/session/event` → `event-monitor.ts` |
| RN02  | Identificar interesse imediato         | `processClickEvent()` (pesos + decaimento) |
| RN03  | Ajustar categorias dinamicamente       | `rankCategories()` → `CategoryPills`       |
| RN04  | Venda cruzada baseada no item          | `generateCrossSell()` → `CrossSellBanner`  |
| RN05  | Acesso livre à plataforma              | `buildDefaultResponse()` + vitrine completa|
| RA01  | Adaptação instantânea                  | Resposta síncrona → re-render React        |

---

## Como Executar

### Opção 1 — Docker Compose (recomendado)

```bash
docker-compose up --build
# Acesse http://localhost:3000
```

Sobe o PostgreSQL 16 e a aplicação Next.js em uma única stack.

### Opção 2 — Execução Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com a URL do seu PostgreSQL

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

### Variáveis de ambiente

| Variável                | Padrão                                                              |
|-------------------------|---------------------------------------------------------------------|
| `DATABASE_URL`          | `postgresql://postgres:postgres@localhost:5432/adaptive_delivery`   |
| `NEXT_PUBLIC_APP_NAME`  | `AdaptiveDelivery`                                                  |
| `SESSION_TTL_SECONDS`   | `1800` (30 min)                                                     |
