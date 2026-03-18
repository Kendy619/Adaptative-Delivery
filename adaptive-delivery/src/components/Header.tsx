"use client";

interface HeaderProps {
  sessionId: string;
  eventCount: number;
  isLoading: boolean;
  cartItemCount: number;
  onCartClick: () => void;
}

export default function Header({
  sessionId,
  eventCount,
  isLoading,
  cartItemCount,
  onCartClick,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200/60">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
            <img 
              src="/assets/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-bold text-surface-900 leading-tight tracking-tight">
              Adaptive<span className="text-brand-500">Delivery</span>
            </h1>
            <p className="text-[10px] text-surface-300 font-medium uppercase tracking-widest">
              vitrine inteligente
            </p>
          </div>
        </div>

        {/* Session status + Cart */}
        <div className="flex items-center gap-3">
          {isLoading && (
            <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          )}
          <div className="text-right">
            <p className="text-[10px] font-mono text-surface-300 leading-none">
              {sessionId.slice(0, 16)}…
            </p>
            <p className="text-xs font-semibold text-surface-800 mt-0.5">
              {eventCount} evento{eventCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Cart button */}
          <button
            onClick={onCartClick}
            className="relative w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center
                       hover:bg-surface-200 transition-all active:scale-95"
            title="Ver carrinho"
          >
            <span className="text-lg">🛒</span>
            {cartItemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white 
                           text-[10px] font-bold rounded-full flex items-center justify-center
                           shadow-md shadow-brand-500/30 animate-bounce-in"
              >
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
