import React from 'react';
import { Star } from 'lucide-react';

export default function WatchlistPanel({ stocks = [], watchlist = [], onSelect = () => {}, onToggleWatchlist = () => {} }) {
  const pinned = watchlist.map(sym => stocks.find(s => s.symbol === sym)).filter(Boolean);
  if (!pinned.length) return null;
  return (
    <div className="card p-4 mb-6 dark:bg-slate-800 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Watchlist</h4>
        <span className="text-xs text-gray-500">Favorites · {pinned.length}</span>
      </div>
      <div className="flex gap-3 overflow-x-auto py-1">
        {pinned.map(s => (
          <button key={s.symbol} onClick={() => onSelect(s)} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm text-left min-w-[160px]">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{s.symbol.replace('.NS','')}</div>
              <span role="button" onClick={(e) => { e.stopPropagation(); onToggleWatchlist?.(s.symbol); }} tabIndex={0} className="text-gray-400 hover:text-yellow-500 focus:outline-none">
                <Star className="w-4 h-4" />
              </span>
            </div>
            <div className="text-xs mt-1 text-gray-600 dark:text-slate-300">₹{s.currentPrice?.toFixed(2) ?? '--'} · {s.changePercent?.toFixed(2)}%</div>
          </button>
        ))}
      </div>
    </div>
  );
}
