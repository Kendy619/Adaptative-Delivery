"use client";

import type { TicketInfo, CategoryKey } from "@/lib/types";

interface TicketRecommendationBannerProps {
  ticketInfo: TicketInfo;
  onAddToCart: (productId: string) => void;
  onProductClick: (
    productId: string,
    productName: string,
    category: CategoryKey
  ) => void;
}

export default function TicketRecommendationBanner({
  ticketInfo,
  onAddToCart,
  onProductClick,
}: TicketRecommendationBannerProps) {
  const { averageTicket, currentCartTotal, gap, recommendations } = ticketInfo;

  // Não mostra se o carrinho estiver vazio ou já atingiu o ticket
  if (currentCartTotal === 0) return null;

  const progressPercent = Math.min(
    (currentCartTotal / averageTicket) * 100,
    100
  );
  const reachedGoal = gap <= 0;

  return (
    <div className="max-w-2xl mx-auto px-4 mb-4 animate-slide-up">
      <div
        className={`rounded-2xl border p-4 shadow-sm ${
          reachedGoal
            ? "bg-gradient-to-r from-green-50 via-white to-green-50 border-green-200/60"
            : "bg-gradient-to-r from-amber-50 via-white to-amber-50 border-amber-200/60"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">{reachedGoal ? "🎯" : "📊"}</span>
          <h3
            className={`text-xs font-bold uppercase tracking-widest ${
              reachedGoal ? "text-green-700" : "text-amber-700"
            }`}
          >
            {reachedGoal
              ? "Ticket ideal atingido!"
              : "Complete seu pedido"}
          </h3>
          <div
            className={`flex-1 h-px ${
              reachedGoal ? "bg-green-200/50" : "bg-amber-200/50"
            }`}
          />
        </div>

        {/* Barra de progresso */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-surface-500 mb-1">
            <span>
              Carrinho: <strong className="text-surface-800">R${currentCartTotal.toFixed(2)}</strong>
            </span>
            <span>
              Ticket médio: <strong className="text-surface-800">R${averageTicket.toFixed(2)}</strong>
            </span>
          </div>
          <div className="w-full h-2 bg-surface-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                reachedGoal
                  ? "bg-gradient-to-r from-green-400 to-green-500"
                  : "bg-gradient-to-r from-amber-400 to-amber-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {!reachedGoal && (
            <p className="text-[11px] text-surface-400 mt-1">
              Faltam <strong className="text-amber-600">R${gap.toFixed(2)}</strong> para atingir o ticket médio dos seus pedidos
            </p>
          )}
        </div>

        {/* Recomendações */}
        {!reachedGoal && recommendations.length > 0 && (
          <>
            <p className="text-[11px] text-surface-500 font-medium mb-2">
              Sugestões para completar seu pedido:
            </p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {recommendations.map((rec) => (
                <button
                  key={rec.productId}
                  onClick={() => {
                    onProductClick(rec.productId, rec.productName, rec.category);
                    onAddToCart(rec.productId);
                  }}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white
                             rounded-xl border border-amber-200/40 hover:border-amber-300
                             hover:shadow-md hover:shadow-amber-500/10
                             transition-all duration-200 group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    {rec.emoji}
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-surface-800 whitespace-nowrap">
                      {rec.productName}
                    </p>
                    <p className="text-[11px] text-amber-600 font-bold">
                      R${rec.price.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-surface-400 leading-tight max-w-[160px]">
                      {rec.reason}
                    </p>
                  </div>
                  <span className="text-[10px] text-amber-500 font-bold ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    + Adicionar
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Mensagem de sucesso */}
        {reachedGoal && (
          <p className="text-xs text-green-600 text-center mt-1">
            Seu pedido atingiu o valor ideal com base no seu histórico. Bom apetite!
          </p>
        )}
      </div>
    </div>
  );
}
