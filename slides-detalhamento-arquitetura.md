# Adaptive Delivery — Detalhamento da Arquitetura

> Slides em markdown. Cada bloco entre `---` corresponde a um slide.
> Cole no PowerPoint / Google Slides / Marp / Slidev.

---

## Slide 1 — Capa

**Adaptive Delivery System**
Detalhamento da arquitetura baseada em **MAPE-K**

Disciplina: Sistemas Distribuídos — 2026
Autor: Kendy Ferreira de Oliveira

---

## Slide 2 — Recapitulando o problema

- Vitrine de delivery **estática** não acompanha a intenção do usuário durante a sessão.
- A cada interação (visualização, clique, busca, favorito, adicionar ao carrinho), o sistema deve:
  1. Reordenar as categorias da vitrine **em tempo real**.
  2. Sugerir **venda cruzada** coerente com o item visto.
- Requisito-chave: **adaptação instantânea** (RA01), sem reload, sem login.

---

## Slide 3 — Por que MAPE-K?

O loop **MAPE-K** (IBM, *Autonomic Computing*) descreve sistemas que se auto-ajustam observando o ambiente:

- **M**onitor — coleta sinais
- **A**nalyze — interpreta os sinais
- **P**lan — decide a próxima configuração
- **E**xecute — aplica a nova configuração
- **K**nowledge — base compartilhada por todas as fases

A vitrine é o **Managed Element** (sistema gerenciado).
O back-end Next.js é o **Autonomic Manager** (sistema gerenciador).

---

## Slide 4 — Visão geral (uma figura, uma página)

> **Diagramas-fonte:** `architecture-mape-k.drawio` contém **5 páginas**:
> (1) visão geral MAPE-K · (2) detalhamento do Monitor · (3) Analisador · (4) Planejador · (5) Executor.
> Cada slide de fase abaixo corresponde a uma página do `.drawio`.


```
┌──────────────────────── MANAGED ELEMENT (Vitrine — Next.js/React) ──────────────────────┐
│  CategoryPills · ProductCard · CrossSellBanner · CartDrawer · AdaptiveDebugPanel        │
│       ▲ Effectors (re-render)                              Sensors (eventos) ▼          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
        │                                                                       │
        │ HTTP 200  AdaptiveResponse                  POST /api/session/event   │
        │                                                                       │
┌───────┴─────────────────── AUTONOMIC MANAGER (back-end Next.js) ──────────────┴─────────┐
│  ④ Execute  ◀─  ③ Plan   ◀─  ② Analyze   ◀─  ① Monitor                                 │
│  API/JSON       cross-sell    ranking         event-monitor                             │
│                       ▲              ▲              ▲                                   │
│                       └──────────────┴──────────────┘                                   │
│                                      │                                                  │
│                              ⑤ Knowledge (estado + regras)                              │
│                              session_state (PostgreSQL) + types.ts                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Slide 5 — Stack tecnológica

| Camada            | Tecnologia                              |
|-------------------|-----------------------------------------|
| Front-end         | React 18 + Tailwind CSS 3.4 + Framer Motion |
| Back-end          | Next.js 14 (App Router / API Routes)    |
| Persistência      | PostgreSQL 16                           |
| Linguagem         | TypeScript 5.4                          |
| Containerização   | Docker + Docker Compose                 |
| Deploy            | Vercel / AWS Amplify / Docker           |

Escolha justificada: a mesma aplicação Next.js hospeda **Managed Element** (React) e **Autonomic Manager** (API Routes) — reduz latência do loop MAPE-K e simplifica o deploy.

---

## Slide 6 — Managed Element (sistema gerenciado)

Componente: **Vitrine Adaptativa** (React)

| Componente              | Papel no loop                                            |
|-------------------------|----------------------------------------------------------|
| `page.tsx` (HomePage)   | Composição raiz — orquestra todos os blocos visuais      |
| `CategoryPills.tsx`     | **Effector** — pinta a vitrine na ordem decidida pelo Plan |
| `ProductCard.tsx`       | **Sensor** — emite `view` / `click` / `add_to_cart`      |
| `CrossSellBanner.tsx`   | **Effector** — exibe as sugestões geradas pelo Plan      |
| `CartDrawer.tsx` / `Header.tsx` | UI de suporte (carrinho, busca, marca)           |
| `AdaptiveDebugPanel.tsx`| Observabilidade — mostra scores e ranking em tempo real  |
| `hooks/useAdaptiveSession.ts` | Cola Sensor↔Effector: envia eventos e aplica a resposta |

---

## Slide 7 — Sensors & Effectors

**Sensors (entrada do loop)** — `useAdaptiveSession.sendEvent()`

| Evento        | Peso | Significado            |
|---------------|------|------------------------|
| `view`        | 1.0  | Interesse leve (debounce 300ms) |
| `click`       | 2.0  | Interesse moderado     |
| `search`      | 3.0  | Interesse ativo        |
| `favorite`    | 4.0  | Interesse forte        |
| `add_to_cart` | 5.0  | Intenção de compra     |

**Effectors (saída do loop)**

- Reordenação dos `CategoryPills`
- Sugestões no `CrossSellBanner`
- Destaque visual (`highlighted: true` quando score ≥ 2.0)

---

## Slide 8 — Fase ① Monitor

**Arquivo:** `lib/event-monitor.ts` · **Endpoint:** `POST /api/session/event`
**Diagrama detalhado:** página *"① Monitor — Detalhamento"* do `.drawio`

**Subcomponentes (notação MAPE-K do livro/aula):**

| Subcomponente            | No nosso código                                          |
|--------------------------|----------------------------------------------------------|
| Coletor de Evento        | `useAdaptiveSession.sendEvent()` + `route.ts` (POST)     |
| Normalização             | validação no `route.ts` (`eventType = "view"` default)   |
| Filtro                   | debounce 300 ms em `useAdaptiveSession.ts`               |
| Agregação                | `processClickEvent()`: decay × 0.85 + `EVENT_WEIGHTS`    |
| Gerador de Sintoma       | monta `SessionStateRecord` (scores + lastCategory + …)   |
| Alterar Base             | `session-repository.saveSessionState()` → `INSERT`       |
| Emissor de Sintoma       | `return AdaptiveResponse` → Analisador                   |

**Saída:** `SessionStateRecord` persistido + `AdaptiveResponse` parcial seguindo para o Analisador.

---

## Slide 9 — Fase ② Analyze (Analisador)

**Arquivo:** `lib/adaptation-engine.ts` · função `rankCategories(scores)`
**Diagrama detalhado:** página *"② Analisador — Detalhamento"* do `.drawio`

**Subcomponentes:**

| Subcomponente            | No nosso código                                            |
|--------------------------|------------------------------------------------------------|
| Receptor de Sintoma      | `rankCategories(scores)` / `getRecommendations(sessionId)` |
| Filtro de Resíduos       | `filter([, s]) => s > 0.01` (descarta cauda do decaimento) |
| Ordenador (Ranking)      | `sort([, a], [, b]) => b - a` + atribuição de `rank`       |
| Detector de Destaque     | `highlighted = score ≥ HIGHLIGHT_THRESHOLD (2.0)`          |
| Complementador           | `DEFAULT_CATEGORY_ORDER` para categorias sem score (RN05)  |
| Consultor da Base        | `findLatestSession()` (em modo GET `/recommendations`)     |
| Emissor de Diagnóstico   | `return CategoryRecommendation[]` → Planejador             |

**Saída:** `CategoryRecommendation[]` ordenado, com `rank`, `score` arredondado e flag de destaque.

> Fase **pura** (sem I/O na rota POST): facilita testes unitários e troca futura por um modelo de ML.

---

## Slide 10 — Fase ③ Plan (Planejador)

**Arquivo:** `lib/cross-sell.ts` · função `generateCrossSell(category, item)`
**Diagrama detalhado:** página *"③ Planejador — Detalhamento"* do `.drawio`

**Subcomponentes:**

| Subcomponente            | No nosso código                                            |
|--------------------------|------------------------------------------------------------|
| Receptor de Diagnóstico  | `generateCrossSell(categoryKey, itemName)`                 |
| Consultor de Afinidades  | leitura de `CATEGORIES[categoryKey].crossSell` em `types.ts` |
| Seletor de Sugestões     | `.slice(0, MAX_SUGGESTIONS = 4)`                           |
| Gerador de Justificativa | `buildReason(target, itemContext)` — texto contextualizado |
| Consultor de Regras      | mapa `CATEGORIES` + templates de `reason` (Knowledge)      |
| Montador do Plano        | em `processClickEvent`: combina ranking + cross-sell em `AdaptiveResponse` |
| Emissor do Plano         | `return AdaptiveResponse` → Executor                       |

**Saída:** `CrossSellItem[]` com categoria, displayName, emoji e `reason`.

---

## Slide 11 — Fase ④ Execute (Executor)

**Caminho:** API (servidor) → `useAdaptiveSession` (cliente) → atuadores React
**Diagrama detalhado:** página *"④ Executor — Detalhamento"* do `.drawio`

**Subcomponentes:**

| Subcomponente               | No nosso código                                              |
|-----------------------------|--------------------------------------------------------------|
| Receptor do Plano           | `NextResponse.json(response)` + `fetch().then(res => res.json())` |
| Reconciliador de Estado     | `useAdaptiveSession.fireEvent()`                             |
| Despachante de Setters      | `setCategories` · `setCrossSell` · `setEventCount` · `setLastAdaptation` |
| Emissor de Telemetria       | `console.log('[EventMonitor] Sessão X | Evento #N | … | Yms')` |
| Atuador — categorias        | `CategoryPills.tsx` reordena e destaca (`highlighted`)       |
| Atuador — venda cruzada     | `CrossSellBanner.tsx` renderiza `CrossSellItem[]`            |
| Atuador — produto           | `ProductCard.tsx` aplica destaques e reemite eventos (sensor) |
| Atuador — observabilidade   | `AdaptiveDebugPanel.tsx` mostra scores / ranking / latência  |

**Latência alvo:** < 1 frame perceptível — resposta JSON síncrona + reconciliação React em um único ciclo (RA01).

---

## Slide 12 — Fase ⑤ Knowledge (a base compartilhada)

Todas as fases anteriores leem/escrevem nesta base.

| Origem do conhecimento     | Onde vive                              | O que contém                                  |
|----------------------------|----------------------------------------|-----------------------------------------------|
| **Estado da sessão**       | PostgreSQL — tabela `session_state`    | `categoryScores`, `lastItemViewed`, `lastCategory`, `eventCount`, `ttl` |
| **Regras estáticas**       | `lib/types.ts`                         | `EVENT_WEIGHTS`, `CATEGORIES[*].crossSell`, `DEFAULT_CATEGORY_ORDER` |
| **Parâmetros do loop**     | constantes em `event-monitor.ts` e `adaptation-engine.ts` | `DECAY_FACTOR = 0.85`, `SESSION_TTL_SECONDS = 1800`, `HIGHLIGHT_THRESHOLD = 2.0`, `MAX_SUGGESTIONS = 4` |
| **Catálogo de produtos**   | `data/products.ts`                     | 100 itens em 10 categorias                    |

> Centralizar as regras em `types.ts` permite **ajustar o comportamento sem mexer no fluxo** — chave para futura calibração experimental.

---

## Slide 13 — Esquema de persistência (PostgreSQL)

**Tabela `session_state`** — cada evento gera um novo registro (event sourcing simplificado).

| Coluna             | Tipo      | Papel              |
|--------------------|-----------|--------------------|
| `session_id`       | TEXT      | identificador da sessão (PK lógica) |
| `event_timestamp`  | TEXT      | ISO-8601 — ordenação cronológica    |
| `category_scores`  | JSONB     | mapa `{ "SALGADOS": 4.25, … }`      |
| `last_item_viewed` | TEXT      | nome do último item                 |
| `last_category`    | TEXT      | categoria do último item            |
| `event_type`       | TEXT      | tipo do evento                      |
| `event_count`      | INTEGER   | nº de eventos na sessão             |
| `ttl`              | BIGINT    | epoch s — expiração 30 min          |

Leitura: `SELECT … ORDER BY event_timestamp DESC LIMIT 1` (último estado).
Escrita: `INSERT` (mantém histórico de toda a sessão).

---

## Slide 14 — Contratos da API

**`POST /api/session/event`** — entrada do loop MAPE-K

```json
{
  "sessionId": "sess_xxxx",
  "eventType": "click",
  "itemId": "salg_001",
  "itemName": "Coxinha de Frango",
  "category": "SALGADOS"
}
```

**`GET /api/session/recommendations?sessionId=…`** — leitura idempotente (recarregar a página sem perder o estado adaptativo).

**Resposta (`AdaptiveResponse`)**

```json
{
  "sessionId": "...",
  "adaptedCategories": [{ "category": "SALGADOS", "rank": 1, "score": 4.25, "highlighted": true, ... }],
  "crossSellSuggestions": [{ "category": "BEBIDAS", "reason": "Que tal uma bebida...", ... }],
  "totalEventsProcessed": 7,
  "adaptationTimestampMs": 1716180000000
}
```

---

## Slide 15 — Fluxo end-to-end de uma interação

```
1. Usuário clica numa Coxinha (SALGADOS)
        │
2. ProductCard.onClick → useAdaptiveSession.sendEvent("click", ...)
        │
3. POST /api/session/event   ← entra no Autonomic Manager
        │
4. ① MONITOR: findLatestSession → decay×0.85 → +2.0 em SALGADOS → INSERT
        │
5. ② ANALYZE: rankCategories(scores) → SALGADOS no topo, highlighted
        │
6. ③ PLAN: generateCrossSell("SALGADOS", "Coxinha") → BEBIDAS, MOLHOS, ...
        │
7. ④ EXECUTE: HTTP 200 AdaptiveResponse
        │
8. useAdaptiveSession.fireEvent atualiza estado React
        │
9. CategoryPills reordena · CrossSellBanner aparece · DebugPanel atualiza
```

**Tempo total observado:** ~`Date.now() - startMs` ms logado pelo Monitor.

---

## Slide 16 — Separação de responsabilidades (princípio S de SOLID)

| Módulo               | Faz                                | NÃO faz                          |
|----------------------|------------------------------------|----------------------------------|
| `event-monitor.ts`   | coleta + agregação + persistência  | ranking, decisão                 |
| `adaptation-engine.ts` | análise (ranking + destaque)     | I/O, escrita no banco            |
| `cross-sell.ts`      | planejamento (sugestões)           | persistência, ranking            |
| `session-repository.ts` | acesso ao PostgreSQL            | regras de negócio                |
| `useAdaptiveSession.ts` | bridge sensor↔effector no client | qualquer lógica de pontuação     |

> Cada fase do MAPE-K mora num arquivo. Trocar a estratégia de uma fase **não toca** as outras.

---

## Slide 17 — Rastreabilidade: regras de negócio → código

| Regra | Descrição                          | Onde está implementada                                  |
|-------|------------------------------------|---------------------------------------------------------|
| RN01  | Monitorar navegação em tempo real  | `useAdaptiveSession` → `POST /api/session/event` → `event-monitor.ts` |
| RN02  | Identificar interesse imediato     | `processClickEvent` (decay + weights)                   |
| RN03  | Ajustar categorias dinamicamente   | `rankCategories()` → `CategoryPills`                    |
| RN04  | Venda cruzada baseada no item      | `generateCrossSell()` → `CrossSellBanner`               |
| RN05  | Acesso livre (sem login)           | `buildDefaultResponse()` + categorias padrão            |
| RA01  | Adaptação instantânea              | Resposta síncrona + reconciliação React                 |

---

## Slide 18 — Pontos de extensão (futuros trabalhos)

- **Substituir o ranking heurístico por ML** — `rankCategories()` é função pura: basta plugar um modelo treinado nos `categoryScores` históricos.
- **Cross-sell aprendido por dados** — substituir o grafo estático `CATEGORIES[*].crossSell` por co-ocorrência observada em sessões.
- **Janela de decaimento configurável** — expor `DECAY_FACTOR` por experimento (A/B test).
- **Persistência distribuída** — trocar PostgreSQL por DynamoDB / Redis para sessões em escala (a interface `SessionStateRecord` já abstrai).
- **Telemetria** — emitir métricas (`adaptation_latency_ms`, `events_per_session`) para Prometheus/Grafana.

---

## Slide 19 — Resumo (uma linha por fase)

- **Managed Element** — vitrine React com sensores e efetores.
- **① Monitor** — coleta, pondera (`EVENT_WEIGHTS`), aplica decaimento (`0.85`), persiste.
- **② Analyze** — filtra, ordena, destaca (`threshold 2.0`).
- **③ Plan** — sugere via grafo de afinidades + justificativa contextual.
- **④ Execute** — resposta síncrona → re-render React.
- **⑤ Knowledge** — `session_state` (PostgreSQL) + `types.ts` (regras).

**Tudo isso em ~600 linhas de TypeScript, num único deploy Next.js.**

---

## Slide 20 — Obrigado

Repositório: `Kendy619/Adaptative-Delivery`
Diagrama-fonte: `architecture-mape-k.drawio`
Contato: kendy619.kf@gmail.com
