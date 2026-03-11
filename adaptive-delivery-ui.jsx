import { useState, useMemo, useCallback, useRef } from "react";

// ============================================================
// TYPES & CONSTANTS
// ============================================================
const EVENT_WEIGHTS = { view: 1.0, click: 2.0, search: 3.0, favorite: 4.0, add_to_cart: 5.0 };
const DECAY_FACTOR = 0.85;
const HIGHLIGHT_THRESHOLD = 2.0;

const CATEGORIES = {
  PROMOCOES: { key: "PROMOCOES", displayName: "Promoções", emoji: "🔥", crossSell: [] },
  LANCHES: { key: "LANCHES", displayName: "Lanches", emoji: "🍔", crossSell: ["BEBIDAS", "ACOMPANHAMENTOS"] },
  PIZZAS: { key: "PIZZAS", displayName: "Pizzas", emoji: "🍕", crossSell: ["BEBIDAS", "SOBREMESAS"] },
  BEBIDAS: { key: "BEBIDAS", displayName: "Bebidas", emoji: "🥤", crossSell: ["SALGADOS", "LANCHES"] },
  SALGADOS: { key: "SALGADOS", displayName: "Salgados", emoji: "🥟", crossSell: ["BEBIDAS", "MOLHOS"] },
  DOCES: { key: "DOCES", displayName: "Doces", emoji: "🍬", crossSell: ["BEBIDAS", "CAFES"] },
  SOBREMESAS: { key: "SOBREMESAS", displayName: "Sobremesas", emoji: "🍰", crossSell: ["CAFES", "BEBIDAS"] },
  CAFES: { key: "CAFES", displayName: "Cafés", emoji: "☕", crossSell: ["DOCES", "SALGADOS"] },
  ACOMPANHAMENTOS: { key: "ACOMPANHAMENTOS", displayName: "Acompanhamentos", emoji: "🍟", crossSell: ["LANCHES", "BEBIDAS"] },
  MOLHOS: { key: "MOLHOS", displayName: "Molhos", emoji: "🫙", crossSell: ["SALGADOS", "LANCHES"] },
};

const DEFAULT_ORDER = ["PROMOCOES","LANCHES","PIZZAS","BEBIDAS","SALGADOS","DOCES","SOBREMESAS","CAFES","ACOMPANHAMENTOS","MOLHOS"];

const CROSS_SELL_REASONS = {
  BEBIDAS: (ctx) => `Que tal uma bebida com o seu ${ctx}?`,
  SALGADOS: () => "Complemente com um salgado crocante!",
  DOCES: (ctx) => `Sobremesa perfeita após o ${ctx}!`,
  CAFES: (ctx) => `Um café combina com ${ctx}!`,
  MOLHOS: () => "Nossos molhos realçam o sabor!",
  ACOMPANHAMENTOS: () => "Adicione um acompanhamento!",
  SOBREMESAS: () => "Finalize com uma sobremesa!",
  LANCHES: () => "Aproveite nossos lanches!",
  PIZZAS: () => "Que tal uma pizza?",
  PROMOCOES: () => "Confira promoções imperdíveis!",
};

const PRODUCTS = [
  { id: "s1", name: "Coxinha de Frango", desc: "Crocante por fora, cremosa por dentro com catupiry.", price: 7.9, cat: "SALGADOS", emoji: "🥟", tags: ["popular"] },
  { id: "s2", name: "Empada de Palmito", desc: "Massa folhada artesanal com palmito fresco.", price: 6.5, cat: "SALGADOS", emoji: "🥧", tags: [] },
  { id: "s3", name: "Bolinha de Queijo", desc: "Queijo meia-cura empanado e frito na hora.", price: 5.9, cat: "SALGADOS", emoji: "🧀", tags: ["popular"] },
  { id: "s4", name: "Kibe Frito", desc: "Kibe crocante com temperos árabes.", price: 7.5, cat: "SALGADOS", emoji: "🥩", tags: [] },
  { id: "b1", name: "Refrigerante Lata", desc: "Coca-Cola, Guaraná ou Fanta. Bem gelado!", price: 5.0, cat: "BEBIDAS", emoji: "🥤", tags: ["popular"] },
  { id: "b2", name: "Suco Natural", desc: "Laranja, limão, maracujá ou abacaxi.", price: 8.9, cat: "BEBIDAS", emoji: "🧃", tags: [] },
  { id: "b3", name: "Água de Coco", desc: "Água de coco natural gelada.", price: 6.5, cat: "BEBIDAS", emoji: "🥥", tags: ["popular"] },
  { id: "l1", name: "X-Burguer Artesanal", desc: "Blend 180g, cheddar, alface, tomate e molho especial.", price: 25.9, cat: "LANCHES", emoji: "🍔", tags: ["popular", "destaque"] },
  { id: "l2", name: "Hot Dog Completo", desc: "Salsicha premium com purê, milho e batata palha.", price: 18.5, cat: "LANCHES", emoji: "🌭", tags: ["popular"] },
  { id: "l3", name: "Wrap de Frango", desc: "Tortilha integral com frango grelhado e rúcula.", price: 19.9, cat: "LANCHES", emoji: "🌯", tags: [] },
  { id: "p1", name: "Margherita", desc: "Molho San Marzano, muçarela de búfala e manjericão.", price: 39.9, cat: "PIZZAS", emoji: "🍕", tags: ["popular"] },
  { id: "p2", name: "Calabresa", desc: "Calabresa fatiada, cebola roxa e azeitonas.", price: 35.9, cat: "PIZZAS", emoji: "🍕", tags: [] },
  { id: "p3", name: "Quatro Queijos", desc: "Muçarela, provolone, gorgonzola e parmesão.", price: 42.9, cat: "PIZZAS", emoji: "🍕", tags: ["premium"] },
  { id: "d1", name: "Brigadeiro Gourmet", desc: "Brigadeiro belga com granulado. Caixa com 6.", price: 15.9, cat: "DOCES", emoji: "🍫", tags: ["popular"] },
  { id: "d2", name: "Churros Recheado", desc: "Churros crocante com doce de leite e canela.", price: 9.9, cat: "DOCES", emoji: "🥖", tags: [] },
  { id: "sb1", name: "Petit Gâteau", desc: "Bolo de chocolate cremoso com sorvete.", price: 22.9, cat: "SOBREMESAS", emoji: "🍰", tags: ["premium"] },
  { id: "sb2", name: "Açaí 500ml", desc: "Açaí com banana, granola, leite em pó e mel.", price: 19.9, cat: "SOBREMESAS", emoji: "🫐", tags: ["popular"] },
  { id: "c1", name: "Espresso Duplo", desc: "Café especial moído na hora.", price: 8.5, cat: "CAFES", emoji: "☕", tags: [] },
  { id: "c2", name: "Cappuccino", desc: "Espresso com leite vaporizado e espuma.", price: 12.9, cat: "CAFES", emoji: "☕", tags: ["popular"] },
  { id: "a1", name: "Batata Frita", desc: "Batata rústica crocante com sal e ervas.", price: 14.9, cat: "ACOMPANHAMENTOS", emoji: "🍟", tags: ["popular"] },
  { id: "a2", name: "Onion Rings", desc: "Anéis de cebola empanados e fritos.", price: 16.9, cat: "ACOMPANHAMENTOS", emoji: "🧅", tags: [] },
  { id: "m1", name: "Molho Barbecue", desc: "Molho defumado artesanal.", price: 3.5, cat: "MOLHOS", emoji: "🫙", tags: [] },
  { id: "m2", name: "Maionese Temperada", desc: "Maionese da casa com ervas finas.", price: 3.5, cat: "MOLHOS", emoji: "🫙", tags: [] },
  { id: "pr1", name: "Combo Família", desc: "2 Lanches + 2 Bebidas + Sobremesa com 20% OFF.", price: 69.9, cat: "PROMOCOES", emoji: "🔥", tags: ["destaque"] },
  { id: "pr2", name: "Happy Hour Salgados", desc: "5 salgados + 1 refrigerante.", price: 29.9, cat: "PROMOCOES", emoji: "🔥", tags: ["destaque"] },
];

// ============================================================
// CLIENT-SIDE ADAPTATION ENGINE (simula a API)
// ============================================================
function useAdaptiveEngine() {
  const [scores, setScores] = useState({});
  const [eventCount, setEventCount] = useState(0);
  const [crossSell, setCrossSell] = useState([]);
  const [eventLog, setEventLog] = useState([]);
  const [lastTs, setLastTs] = useState(null);

  const processEvent = useCallback((eventType, itemId, itemName, category) => {
    const weight = EVENT_WEIGHTS[eventType] || 1.0;

    setScores(prev => {
      const next = {};
      for (const [k, v] of Object.entries(prev)) {
        next[k] = v * DECAY_FACTOR;
      }
      next[category] = (next[category] || 0) + weight;
      return next;
    });

    setEventCount(c => c + 1);
    setLastTs(Date.now());

    // Cross-sell
    const meta = CATEGORIES[category];
    if (meta?.crossSell?.length) {
      const ctx = itemName || meta.displayName;
      setCrossSell(
        meta.crossSell.slice(0, 3).map(k => {
          const r = CATEGORIES[k];
          return {
            category: k,
            displayName: r.displayName,
            emoji: r.emoji,
            reason: CROSS_SELL_REASONS[k]?.(ctx) || `Combine com ${r.displayName}!`
          };
        })
      );
    }

    setEventLog(prev => [
      { time: new Date().toLocaleTimeString("pt-BR"), type: eventType, item: itemName, cat: category, weight },
      ...prev.slice(0, 19)
    ]);
  }, []);

  const categories = useMemo(() => {
    const result = [];
    let rank = 1;
    const scored = Object.entries(scores).filter(([,v]) => v > 0.01).sort(([,a],[,b]) => b - a);
    const scoredKeys = new Set(scored.map(([k]) => k));

    for (const [key, score] of scored) {
      const m = CATEGORIES[key];
      result.push({ category: key, displayName: m?.displayName || key, emoji: m?.emoji || "📦", score: Math.round(score*100)/100, rank: rank++, highlighted: score >= HIGHLIGHT_THRESHOLD });
    }
    for (const k of DEFAULT_ORDER) {
      if (!scoredKeys.has(k)) {
        const m = CATEGORIES[k];
        result.push({ category: k, displayName: m.displayName, emoji: m.emoji, score: 0, rank: rank++, highlighted: false });
      }
    }
    return result;
  }, [scores]);

  return { categories, crossSell, eventCount, lastTs, eventLog, scores, processEvent };
}

// ============================================================
// COMPONENTS
// ============================================================

function Header({ eventCount, isProcessing }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid #e7e5e4", padding: "12px 16px",
    }}>
      <div style={{ maxWidth: 540, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: "linear-gradient(135deg, #f09332, #dd5d07)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(240,147,50,0.25)",
            fontSize: 18,
          }}>🛵</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", letterSpacing: "-0.02em" }}>
              Adaptive<span style={{ color: "#ec7711" }}>Delivery</span>
            </div>
            <div style={{ fontSize: 9, color: "#a8a29e", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              vitrine inteligente
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isProcessing && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f09332", animation: "pulse 1.5s infinite" }} />}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#292524" }}>
              {eventCount} evento{eventCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function CategoryPills({ categories, active, onSelect }) {
  return (
    <div style={{
      position: "sticky", top: 60, zIndex: 40,
      background: "rgba(250,250,249,0.92)", backdropFilter: "blur(16px)",
    }}>
      <div style={{
        maxWidth: 540, margin: "0 auto", display: "flex", gap: 8,
        padding: "10px 16px", overflowX: "auto",
      }}>
        {categories.map((cat) => {
          const isActive = active === cat.category;
          const isHl = cat.highlighted;
          return (
            <button
              key={cat.category}
              onClick={() => onSelect(cat.category)}
              style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                border: isActive ? "none" : isHl ? "1.5px solid #f9d6a5" : "1px solid #e7e5e4",
                background: isActive ? "#1c1917" : isHl ? "#fef7ee" : "white",
                color: isActive ? "white" : isHl ? "#b74409" : "#57534e",
                cursor: "pointer",
                boxShadow: isActive ? "0 4px 16px rgba(28,25,23,0.18)" : isHl ? "0 2px 8px rgba(240,147,50,0.1)" : "none",
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                transform: isActive ? "scale(1.03)" : "scale(1)",
              }}
            >
              <span style={{ fontSize: 15 }}>{cat.emoji}</span>
              <span>{cat.displayName}</span>
              {isHl && !isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ec7711", animation: "pulse 2s infinite" }} />}
              {cat.score > 0 && (
                <span style={{ fontSize: 10, fontFamily: "monospace", opacity: 0.5, marginLeft: 2 }}>
                  {cat.score.toFixed(1)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CrossSellBanner({ suggestions, onSelect }) {
  if (!suggestions.length) return null;
  return (
    <div style={{ maxWidth: 540, margin: "0 auto 12px", padding: "0 16px" }}>
      <div style={{
        background: "linear-gradient(90deg, #fef7ee, white, #fef7ee)",
        borderRadius: 16, border: "1.5px solid rgba(249,214,165,0.6)",
        padding: 16, boxShadow: "0 2px 8px rgba(240,147,50,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span>💡</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#b74409", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Você também pode gostar
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(249,214,165,0.5)" }} />
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {suggestions.map(s => (
            <button
              key={s.category}
              onClick={() => onSelect(s.category)}
              style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", background: "white", borderRadius: 12,
                border: "1px solid rgba(249,214,165,0.4)", cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#f5b86d"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(240,147,50,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(249,214,165,0.4)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <span style={{ fontSize: 22 }}>{s.emoji}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#292524" }}>{s.displayName}</div>
                <div style={{ fontSize: 11, color: "#a8a29e", maxWidth: 180, lineHeight: 1.3 }}>{s.reason}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onEvent }) {
  const [added, setAdded] = useState(false);

  return (
    <div
      onClick={() => onEvent("click", product.id, product.name, product.cat)}
      style={{
        background: "white", borderRadius: 16,
        border: "1px solid rgba(231,229,228,0.8)",
        cursor: "pointer", overflow: "hidden",
        transition: "all 0.3s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(240,147,50,0.3)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(240,147,50,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(231,229,228,0.8)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{
        height: 100, background: "linear-gradient(135deg, #f5f5f4, #fafaf9)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <span style={{ fontSize: 40, transition: "transform 0.3s" }}>{product.emoji}</span>
        {product.tags.includes("popular") && (
          <span style={{
            position: "absolute", top: 8, left: 8,
            padding: "2px 8px", fontSize: 9, fontWeight: 800,
            background: "#ec7711", color: "white", borderRadius: 999,
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>Popular</span>
        )}
        {product.tags.includes("destaque") && (
          <span style={{
            position: "absolute", top: 8, left: product.tags.includes("popular") ? 66 : 8,
            padding: "2px 8px", fontSize: 9, fontWeight: 800,
            background: "#ef4444", color: "white", borderRadius: 999,
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>Destaque</span>
        )}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ fontSize: 11, color: "#a8a29e", marginTop: 4, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.desc}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <div>
            <span style={{ fontSize: 11, color: "#a8a29e" }}>R$ </span>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#1c1917" }}>
              {product.price.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              onEvent("add_to_cart", product.id, product.name, product.cat);
              setAdded(true);
              setTimeout(() => setAdded(false), 1200);
            }}
            style={{
              padding: "6px 12px", borderRadius: 12, fontSize: 11, fontWeight: 700,
              border: "none", cursor: "pointer",
              background: added ? "#22c55e" : "#1c1917", color: "white",
              transition: "all 0.3s", transform: added ? "scale(0.95)" : "scale(1)",
            }}
          >
            {added ? "✓ Adicionado" : "+ Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DebugPanel({ eventCount, categories, crossSell, lastTs, eventLog, scores }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("scores");
  const scored = categories.filter(c => c.score > 0);
  const maxScore = Math.max(...scored.map(c => c.score), 1);

  return (
    <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 50 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 48, height: 48, borderRadius: 16,
          background: "#1c1917", color: "white", border: "none",
          boxShadow: "0 8px 24px rgba(28,25,23,0.3)",
          cursor: "pointer", fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}
      >{open ? "✕" : "⚙️"}</button>

      {open && (
        <div style={{
          position: "absolute", bottom: 60, right: 0, width: 320, maxHeight: "70vh",
          background: "#0c0a09", color: "white", borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)", border: "1px solid #292524",
          overflow: "hidden", display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #292524" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: "#78716c", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Motor Adaptativo — Debug
              </span>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              <div><span style={{ fontSize: 10, color: "#57534e" }}>Eventos</span><div style={{ fontSize: 18, fontWeight: 800, color: "#f09332" }}>{eventCount}</div></div>
              <div><span style={{ fontSize: 10, color: "#57534e" }}>Categorias ativas</span><div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{scored.length}</div></div>
              <div><span style={{ fontSize: 10, color: "#57534e" }}>Cross-sell</span><div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{crossSell.length}</div></div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #292524" }}>
            {["scores", "log", "regras"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "8px 0", fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em",
                border: "none", cursor: "pointer",
                background: tab === t ? "#292524" : "transparent",
                color: tab === t ? "#f09332" : "#57534e",
                borderBottom: tab === t ? "2px solid #f09332" : "2px solid transparent",
              }}>{t}</button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>
            {tab === "scores" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {scored.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#57534e", fontStyle: "italic" }}>
                    Interaja com os produtos para ver os scores…
                  </p>
                ) : scored.map(cat => (
                  <div key={cat.category}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "#d6d3d1" }}>{cat.emoji} {cat.displayName}</span>
                      <span style={{ fontFamily: "monospace", color: "#f09332", fontWeight: 700 }}>{cat.score.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 6, background: "#292524", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 3,
                        width: `${(cat.score / maxScore) * 100}%`,
                        background: cat.highlighted ? "linear-gradient(90deg, #f09332, #ec7711)" : "linear-gradient(90deg, #57534e, #78716c)",
                        transition: "width 0.5s ease-out",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "log" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {eventLog.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#57534e", fontStyle: "italic" }}>Nenhum evento registrado…</p>
                ) : eventLog.map((ev, i) => (
                  <div key={i} style={{ fontSize: 11, fontFamily: "monospace", color: "#a8a29e", display: "flex", gap: 8 }}>
                    <span style={{ color: "#57534e", flexShrink: 0 }}>{ev.time}</span>
                    <span style={{
                      color: ev.type === "add_to_cart" ? "#22c55e" : ev.type === "click" ? "#f09332" : "#78716c",
                      fontWeight: 700, width: 72, flexShrink: 0,
                    }}>{ev.type}</span>
                    <span style={{ color: "#d6d3d1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ev.item}
                    </span>
                    <span style={{ color: "#57534e", marginLeft: "auto", flexShrink: 0 }}>+{ev.weight}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === "regras" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { code: "RN01", label: "Monitoramento tempo real", active: eventCount > 0 },
                  { code: "RN02", label: "Interesse identificado", active: scored.length > 0 },
                  { code: "RN03", label: "Categorias reordenadas", active: scored.length > 0 },
                  { code: "RN04", label: "Cross-sell ativo", active: crossSell.length > 0 },
                  { code: "RN05", label: "Acesso livre mantido", active: true },
                  { code: "RA01", label: "Adaptação instantânea", active: lastTs !== null },
                ].map(r => (
                  <div key={r.code} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: r.active ? "#22c55e" : "#292524",
                      boxShadow: r.active ? "0 0 6px rgba(34,197,94,0.4)" : "none",
                    }} />
                    <span style={{ fontFamily: "monospace", color: "#57534e", width: 36 }}>{r.code}</span>
                    <span style={{ color: r.active ? "#d6d3d1" : "#57534e" }}>{r.label}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: "#292524", margin: "8px 0" }} />
                <div style={{ fontSize: 10, color: "#57534e", lineHeight: 1.5 }}>
                  <strong style={{ color: "#78716c" }}>Decaimento:</strong> score × {DECAY_FACTOR} a cada evento<br/>
                  <strong style={{ color: "#78716c" }}>Destaque:</strong> score ≥ {HIGHLIGHT_THRESHOLD}<br/>
                  <strong style={{ color: "#78716c" }}>Pesos:</strong> view=1 | click=2 | search=3 | fav=4 | cart=5
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function AdaptiveDeliveryApp() {
  const { categories, crossSell, eventCount, lastTs, eventLog, scores, processEvent } = useAdaptiveEngine();
  const [activeCat, setActiveCat] = useState(null);

  const handleCatSelect = (cat) => {
    const deselecting = activeCat === cat;
    setActiveCat(deselecting ? null : cat);
    if (!deselecting) processEvent("click", `cat_${cat}`, cat, cat);
  };

  const handleCrossSellSelect = (cat) => {
    setActiveCat(cat);
    processEvent("click", `xs_${cat}`, cat, cat);
  };

  const groupedProducts = useMemo(() => {
    const order = categories.map(c => c.category);
    if (activeCat) {
      return [{ cat: activeCat, products: PRODUCTS.filter(p => p.cat === activeCat) }];
    }
    return order.map(k => ({ cat: k, products: PRODUCTS.filter(p => p.cat === k) })).filter(g => g.products.length > 0);
  }, [activeCat, categories]);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif", background: "#fafaf9", minHeight: "100vh", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 2px; }
        button:active { transform: scale(0.97) !important; }
      `}</style>

      <Header eventCount={eventCount} isProcessing={false} />
      <CategoryPills categories={categories} active={activeCat} onSelect={handleCatSelect} />
      <CrossSellBanner suggestions={crossSell} onSelect={handleCrossSellSelect} />

      <main style={{ maxWidth: 540, margin: "0 auto", padding: "12px 16px" }}>
        {groupedProducts.map(({ cat, products }) => {
          const meta = categories.find(c => c.category === cat);
          return (
            <section key={cat} style={{ marginBottom: 28 }}>
              {!activeCat && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>{meta?.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#1c1917", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {meta?.displayName || cat}
                  </span>
                  {meta?.highlighted && (
                    <span style={{
                      padding: "2px 10px", fontSize: 10, fontWeight: 800,
                      background: "#fef7ee", color: "#b74409", borderRadius: 999,
                    }}>Em alta para você</span>
                  )}
                  <div style={{ flex: 1, height: 1, background: "#e7e5e4" }} />
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {products.map(p => (
                  <ProductCard key={p.id} product={p} onEvent={processEvent} />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <DebugPanel
        eventCount={eventCount}
        categories={categories}
        crossSell={crossSell}
        lastTs={lastTs}
        eventLog={eventLog}
        scores={scores}
      />
    </div>
  );
}
