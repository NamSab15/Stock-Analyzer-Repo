import React from 'react';
import { Star } from 'lucide-react';

export default function Sidebar({ stocks, selected, onSelect, sentiment, watchlist = [], onToggleWatchlist }) {
  return (
    <aside className="space-y-3 h-full" aria-label="Watchlist">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">Watchlist</div>
       <div className="flex flex-col gap-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1" role="listbox" aria-activedescendant={selected?.symbol || undefined}>
        {stocks.map(s => {
          const sent = sentiment[s.symbol];
          const active = selected?.symbol === s.symbol;
          const pinned = watchlist.includes(s.symbol);
          return (
            <button
              key={s.symbol}
              id={s.symbol}
              onClick={() => onSelect(s)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(s); } }}
              role="option"
              aria-selected={active}
              className={`group text-left rounded-xl border px-3 py-2 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400 ${active ? 'border-brand-500 bg-brand-50 dark:bg-slate-800' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-400'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-gray-900 dark:text-slate-100 flex items-center gap-1">
                  {s.symbol.replace('.NS','')}
                  <span
                    role="button"
                    aria-label={pinned ? `Unpin ${s.symbol}` : `Pin ${s.symbol}`}
                    onClick={(e) => { e.stopPropagation(); onToggleWatchlist?.(s.symbol); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onToggleWatchlist?.(s.symbol); } }}
                    tabIndex={0}
                    className={`p-1 rounded ${pinned ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'} focus:outline-none`}
                  >
                    <Star className={`w-3 h-3 ${pinned ? 'fill-yellow-500' : ''}`} aria-hidden="true" />
                  </span>
                </span>
                <span className={`text-xs font-medium ${s.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{s.change >= 0 ? '+' : ''}{s.changePercent?.toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400">
                <span>₹{s.currentPrice > 0 ? s.currentPrice.toFixed(2) : '--'}</span>
                {sent?.dataAvailable && (
                  <div className="flex items-center gap-2">
                    <span className={`${sent.avgSentiment > 0.2 ? 'text-green-600' : sent.avgSentiment < -0.2 ? 'text-red-600' : 'text-gray-500'}`}>{sent.avgSentiment.toFixed(2)}</span>
                    {sent.avgConfidence != null && (
                      <span className="text-[10px] text-gray-500 dark:text-slate-400">{Math.round(sent.avgConfidence * 100)}%</span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
