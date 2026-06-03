"use client";

import type { CartItem } from "@/hooks/useCart";
import type { UpsellSuggestion } from "@/lib/upsell-engine";
import type { TicketInfo, CategoryKey } from "@/lib/types";

interface CartScreenProps {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  ticketInfo: TicketInfo;
  upsells: UpsellSuggestion[];
  onBack: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onAddUpsell: (
    productId: string,
    productName: string,
    category: CategoryKey
  ) => void;
}

export default function CartScreen({
  items,
  totalItems,
  totalPrice,
  ticketInfo,
  upsells,
  onBack,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAddUpsell,
}: CartScreenProps) {
  const isEmpty = items.length === 0;
  const { averageTicket, gap } = ticketInfo;
  const reachedGoal = gap <= 0 && totalPrice > 0;
  const progressPercent =
    averageTicket > 0 ? Math.min((totalPrice / averageTicket) * 100, 100) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 animate-slide-up">
      {/* Top bar com voltar */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center
                     hover:bg-surface-200 transition-colors text-surface-600 active:scale-95"
          title="Voltar ao cardápio"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🛒</span>
          <h1 className="text-lg font-bold text-surface-900">Seu Carrinho</h1>
          {totalItems > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-brand-500 text-white rounded-full">
              {totalItems}
            </span>
          )}
        </div>
      </div>

      {isEmpty ? (
        /* Estado vazio */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-6xl mb-4">🛒</span>
          <h3 className="text-lg font-bold text-surface-900 mb-1">
            Seu carrinho está vazio
          </h3>
          <p className="text-sm text-surface-400 mb-6">
            Explore o cardápio e adicione itens deliciosos!
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-semibold
                       hover:bg-brand-600 transition-colors text-sm active:scale-95"
          >
            Explorar Cardápio
          </button>
        </div>
      ) : (
        <>
          {/* Lista de itens */}
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 bg-white rounded-2xl p-3
                           border border-surface-200/60 shadow-sm"
              >
                <div
                  className="w-14 h-14 rounded-xl bg-surface-50 border border-surface-200/60
                             flex items-center justify-center text-2xl flex-shrink-0"
                >
                  {item.product.image}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-surface-900 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-surface-400">
                    R$ {item.product.price.toFixed(2).replace(".", ",")} un.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="w-7 h-7 rounded-lg bg-surface-50 border border-surface-200
                               flex items-center justify-center text-surface-500
                               hover:bg-surface-100 transition-colors text-sm font-bold"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-surface-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.product.id, item.quantity + 1)
                    }
                    className="w-7 h-7 rounded-lg bg-surface-50 border border-surface-200
                               flex items-center justify-center text-surface-500
                               hover:bg-surface-100 transition-colors text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-surface-900">
                    R${" "}
                    {(item.product.price * item.quantity)
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-[10px] text-red-400 hover:text-red-500
                               transition-colors font-medium"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={onClearCart}
              className="w-full text-center text-xs text-surface-400 hover:text-red-400
                         transition-colors py-1"
            >
              Limpar carrinho
            </button>
          </div>

          {/* Progresso de ticket médio (RN06) */}
          {averageTicket > 0 && (
            <div
              className={`rounded-2xl border p-4 mb-6 ${
                reachedGoal
                  ? "bg-green-50 border-green-200/60"
                  : "bg-amber-50 border-amber-200/60"
              }`}
            >
              <div className="flex justify-between text-[11px] text-surface-500 mb-1.5">
                <span>
                  Carrinho:{" "}
                  <strong className="text-surface-800">
                    R${totalPrice.toFixed(2)}
                  </strong>
                </span>
                <span>
                  Ticket médio:{" "}
                  <strong className="text-surface-800">
                    R${averageTicket.toFixed(2)}
                  </strong>
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
              <p className="text-[11px] mt-1.5">
                {reachedGoal ? (
                  <span className="text-green-600 font-medium">
                    🎯 Seu pedido atingiu o valor ideal. Bom apetite!
                  </span>
                ) : (
                  <span className="text-surface-400">
                    Faltam{" "}
                    <strong className="text-amber-600">
                      R${gap.toFixed(2)}
                    </strong>{" "}
                    para o ticket médio dos seus pedidos.
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Upsells — produtos que combinam com o pedido (RN04) */}
          {upsells.length > 0 && (
            <div className="mb-24">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">✨</span>
                <h2 className="text-xs font-bold text-brand-700 uppercase tracking-widest">
                  Que tal adicionar ao seu pedido?
                </h2>
                <div className="flex-1 h-px bg-surface-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {upsells.map(({ product, reason }) => (
                  <div
                    key={product.id}
                    className="flex flex-col bg-white rounded-2xl border border-surface-200/80
                               overflow-hidden hover:border-brand-300/50 hover:shadow-md
                               hover:shadow-brand-500/5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div
                        className="w-12 h-12 rounded-xl bg-surface-50 border border-surface-200/60
                                   flex items-center justify-center text-2xl flex-shrink-0"
                      >
                        {product.image}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-surface-900 leading-tight truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm font-bold text-surface-900 mt-0.5">
                          <span className="text-xs font-normal text-surface-400">
                            R$
                          </span>{" "}
                          {product.price.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>

                    <p className="px-3 text-[11px] text-surface-400 leading-snug line-clamp-2">
                      {reason}
                    </p>

                    <button
                      onClick={() =>
                        onAddUpsell(product.id, product.name, product.category)
                      }
                      className="mt-2 mx-3 mb-3 py-2 bg-surface-900 text-white rounded-xl
                                 text-xs font-semibold hover:bg-brand-500 transition-colors
                                 active:scale-[0.98]"
                    >
                      + Adicionar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Barra fixa de total + finalizar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200/60 z-40">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[11px] text-surface-400">Total</span>
                <span className="text-xl font-bold text-surface-900 leading-none">
                  R$ {totalPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <button
                className="flex-1 py-3.5 bg-brand-500 text-white rounded-2xl font-bold
                           hover:bg-brand-600 transition-all active:scale-[0.98] text-sm
                           shadow-lg shadow-brand-500/20"
              >
                Finalizar Pedido
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
