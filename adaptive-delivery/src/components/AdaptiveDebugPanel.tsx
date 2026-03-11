"use client";

import { useState } from "react";
import type { CategoryRecommendation, CrossSellItem } from "@/lib/types";

interface DebugPanelProps {
  sessionId: string;
  eventCount: number;
  categories: CategoryRecommendation[];
  crossSell: CrossSellItem[];
  lastAdaptation: number | null;
}

export default function AdaptiveDebugPanel({
  sessionId,
  eventCount,
  categories,
  crossSell,
  lastAdaptation,
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const scoredCategories = categories.filter((c) => c.score > 0);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-2xl bg-surface-900 text-white shadow-xl 
                   shadow-surface-900/30 flex items-center justify-center
                   hover:bg-surface-800 transition-all active:scale-95"
        title="Painel do Motor Adaptativo"
      >
        <span className="text-lg">{isOpen ? "✕" : "⚙️"}</span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-80 max-h-[70vh] overflow-y-auto
                      bg-surface-950 text-white rounded-2xl shadow-2xl
                      border border-surface-800 animate-slide-up"
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-surface-300">
                Motor Adaptativo
              </h3>
            </div>

            {/* Session Info */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-surface-500">Session ID</span>
                <span className="font-mono text-surface-300">
                  {sessionId.slice(0, 20)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-surface-500">Eventos processados</span>
                <span className="font-mono text-brand-400 font-bold">
                  {eventCount}
                </span>
              </div>
              {lastAdaptation && (
                <div className="flex justify-between text-xs">
                  <span className="text-surface-500">Última adaptação</span>
                  <span className="font-mono text-surface-300">
                    {new Date(lastAdaptation).toLocaleTimeString("pt-BR")}
                  </span>
                </div>
              )}
            </div>

            <div className="h-px bg-surface-800 mb-4" />

            {/* Category Scores */}
            <div className="mb-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-surface-500 mb-2">
                Scores por Categoria (RN02)
              </h4>
              {scoredCategories.length === 0 ? (
                <p className="text-xs text-surface-600 italic">
                  Nenhuma interação ainda…
                </p>
              ) : (
                <div className="space-y-1.5">
                  {scoredCategories.map((cat) => {
                    const maxScore = Math.max(
                      ...scoredCategories.map((c) => c.score)
                    );
                    const pct =
                      maxScore > 0 ? (cat.score / maxScore) * 100 : 0;

                    return (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-surface-300">
                            {cat.emoji} {cat.displayName}
                          </span>
                          <span className="font-mono text-brand-400 font-semibold">
                            {cat.score.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${pct}%`,
                              background: cat.highlighted
                                ? "linear-gradient(90deg, #f09332, #ec7711)"
                                : "linear-gradient(90deg, #57534e, #78716c)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cross-sell */}
            {crossSell.length > 0 && (
              <>
                <div className="h-px bg-surface-800 mb-4" />
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-surface-500 mb-2">
                    Venda Cruzada Ativa (RN04)
                  </h4>
                  <div className="space-y-1">
                    {crossSell.map((cs) => (
                      <div
                        key={cs.category}
                        className="text-xs text-surface-400"
                      >
                        {cs.emoji} {cs.displayName}{" "}
                        <span className="text-surface-600">→</span>{" "}
                        <span className="text-surface-500 italic">
                          {cs.reason.slice(0, 40)}…
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Regras mapeadas */}
            <div className="h-px bg-surface-800 my-4" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-surface-500 mb-2">
                Regras Ativas
              </h4>
              {[
                { code: "RN01", label: "Monitoramento tempo real", active: eventCount > 0 },
                { code: "RN02", label: "Interesse identificado", active: scoredCategories.length > 0 },
                { code: "RN03", label: "Categorias reordenadas", active: scoredCategories.length > 0 },
                { code: "RN04", label: "Cross-sell ativo", active: crossSell.length > 0 },
                { code: "RN05", label: "Acesso livre mantido", active: true },
                { code: "RA01", label: "Adaptação instantânea", active: lastAdaptation !== null },
              ].map((rule) => (
                <div
                  key={rule.code}
                  className="flex items-center gap-2 text-xs"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      rule.active ? "bg-emerald-400" : "bg-surface-700"
                    }`}
                  />
                  <span className="font-mono text-surface-500 w-10">
                    {rule.code}
                  </span>
                  <span
                    className={
                      rule.active ? "text-surface-300" : "text-surface-600"
                    }
                  >
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
