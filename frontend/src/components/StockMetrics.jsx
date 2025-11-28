import React from 'react';

export default function StockMetrics({ stock }) {
  if (!stock) return null;
  const metrics = [
    { label: 'Volume', value: stock.volume ? (stock.volume/1e6).toFixed(2)+'M' : '--' },
    // Only show Day High/Day Low if we have valid (non-zero) values
    ...(stock.dayHigh && stock.dayHigh > 0 ? [{ label: 'Day High', value: stock.dayHigh.toFixed(2) }] : []),
    ...(stock.dayLow && stock.dayLow > 0 ? [{ label: 'Day Low', value: stock.dayLow.toFixed(2) }] : []),
    { label: 'Prev Close', value: stock.previousClose?.toFixed(2) ?? '--' }
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map(m => (
        <div key={m.label} className="metric bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 border-gray-200 dark:border-slate-600">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{m.label}</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{m.value}</span>
        </div>
      ))}
    </div>
  );
}
