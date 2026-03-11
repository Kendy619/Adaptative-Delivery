# Adaptive Delivery System – Arquitetura (Next.js + React + Tailwind)

## Visão Geral

Sistema de Delivery Adaptativo **full-stack** que reordena a vitrine de categorias
e gera sugestões de venda cruzada **em tempo real**, reagindo ao clickstream do
usuário durante a sessão ativa.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          Next.js Application                            │
│                                                                         │
│  ┌─────────────────────────────┐    ┌────────────────────────────────┐  │
│  │     FRONT-END (React)       │    │     BACK-END (API Routes)      │  │
│  │                             │    │                                │  │
│  │  page.tsx                   │    │  POST /api/session/event       │  │
│  │    ├─ Header                │───▶│    → AdaptationEngine          │  │
│  │    ├─ CategoryPills   ◀─────│────│    → CrossSellService          │  │
│  │    ├─ CrossSellBanner       │    │    → DynamoDB (persist)        │  │
│  │    ├─ ProductCard[]         │    │                                │  │
│  │    └─ AdaptiveDebugPanel    │    │  GET /api/session/recs         │  │
│  │                             │    │    → DynamoDB (query)          │  │
│  │  useAdaptiveSession()       │    │    → rankCategories()          │  │
│  │    (hook de clickstream)    │    │                                │  │
│  └─────────────────────────────┘    └──────────────┬─────────────────┘  │
│                                                    │                    │
└────────────────────────────────────────────────────┼────────────────────┘
                                                     │
                                              ┌──────▼──────┐
                                              │  DynamoDB    │
                                              │  (Session    │
                                              │   State)     │
                                              └─────────────┘
```

---

## Stack Tecnológica

| Camada        | Tecnologia                          |
|---------------|-------------------------------------|
| Front-end     | React 18 + Tailwind CSS 3.4         |
| Back-end      | Next.js 14 (API Routes)             |
| Banco         | Amazon DynamoDB (AWS SDK v3)         |
| Linguagem     | TypeScript 5.4                      |
| Deploy        | Vercel, AWS Amplify ou Docker       |

---

## Estrutura de Pastas

```
adaptive-delivery/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
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
│   │   ├── types.ts                   # Tipos, enums, constantes
│   │   ├── dynamo.ts                  # Client DynamoDB (singleton)
│   │   ├── adaptation-engine.ts       # Motor de adaptação (core)
│   │   └── cross-sell.ts              # Lógica de venda cruzada
│   ├── hooks/
│   │   └── useAdaptiveSession.ts      # Hook de sessão adaptativa
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── CategoryPills.tsx          # Categorias reordenáveis
│   │   ├── ProductCard.tsx            # Card de produto com rastreio
│   │   ├── CrossSellBanner.tsx        # Banner de venda cruzada
│   │   └── AdaptiveDebugPanel.tsx     # Painel de debug acadêmico
│   └── data/
│       └── products.ts                # Catálogo mock
```

---

## Estrutura do Banco de Dados (DynamoDB)

### Tabela: `UserSessionState`

| Atributo         | Tipo      | Papel             | Descrição                                     |
|------------------|-----------|--------------------|-----------------------------------------------|
| `sessionId`      | String    | **Partition Key**  | Identificador único da sessão                 |
| `eventTimestamp`  | String    | **Sort Key**       | ISO-8601 — ordenação cronológica              |
| `categoryScores` | Map       | Atributo           | `{ "SALGADOS": 4.25, "BEBIDAS": 2.0 }`      |
| `lastItemViewed` | String    | Atributo           | Último item clicado                           |
| `lastCategory`   | String    | Atributo           | Categoria do último item                      |
| `eventType`      | String    | Atributo           | `view`, `click`, `add_to_cart`, etc.          |
| `eventCount`     | Number    | Atributo           | Total de eventos na sessão                    |
| `ttl`            | Number    | TTL                | Epoch seconds (expiração automática 30 min)   |

---

## Algoritmo de Adaptação

```
[Usuário clica] → useAdaptiveSession.sendEvent()
       │
       ▼
POST /api/session/event
       │
       ├─ 1. Buscar último estado (DynamoDB Query reversa, Limit=1)
       ├─ 2. Aplicar decaimento temporal (scores × 0.85)
       ├─ 3. Incrementar categoria do evento (peso do eventType)
       ├─ 4. Persistir novo estado (DynamoDB PutItem)
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

---

## Rastreabilidade das Regras de Negócio

| Regra | Descrição                              | Implementação                             |
|-------|----------------------------------------|-------------------------------------------|
| RN01  | Monitorar navegação tempo real         | `useAdaptiveSession` → `POST /api/session/event` |
| RN02  | Identificar interesse imediato         | `adaptation-engine.ts` → scores ponderados |
| RN03  | Ajustar categorias dinamicamente       | `rankCategories()` → `CategoryPills`       |
| RN04  | Venda cruzada baseada no item          | `cross-sell.ts` → `CrossSellBanner`        |
| RN05  | Acesso livre à plataforma              | `buildDefaultResponse()` + vitrine completa|
| RA01  | Adaptação instantânea                  | Resposta síncrona → re-render React        |

---

## Como Executar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais AWS

# 3. (Opcional) DynamoDB Local para desenvolvimento
docker run -p 8000:8000 amazon/dynamodb-local
# Descomentar DYNAMODB_ENDPOINT no .env.local

# 4. Rodar em modo de desenvolvimento
npm run dev
# Acesse http://localhost:3000
```
