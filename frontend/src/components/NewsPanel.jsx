import React from 'react';
import { Newspaper } from 'lucide-react';

export default function NewsPanel({ news, loading, error, filters, sourceOptions = [], onToggleSource, onConfidenceChange }) {
  const activeSources = new Set(filters?.sourceTypes || []);
  return (
    <div className="card p-5 dark:bg-slate-800 dark:border-slate-600" aria-labelledby="news-heading">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-brand-600" aria-hidden="true" />
          <h3 id="news-heading" className="text-sm font-semibold text-gray-900 dark:text-white">Latest News</h3>
        </div>
        <span className="text-xs text-gray-500 dark:text-slate-400">{news.length} articles</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex flex-wrap gap-1">
          {sourceOptions.map(option => {
            const active = activeSources.has(option.key);
            return (
              <button
                key={option.key}
                onClick={() => onToggleSource?.(option.key)}
                className={`px-2 py-1 rounded-full border transition ${active ? 'bg-brand-600 text-white border-brand-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600'}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
          <span className="uppercase tracking-wide text-[10px]">Min confidence</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={filters?.minConfidence ?? 0}
            onChange={(e) => onConfidenceChange?.(e.target.value)}
            className="accent-brand-600"
          />
          <span className="font-semibold text-gray-900 dark:text-white">{Math.round((filters?.minConfidence || 0) * 100)}%</span>
        </label>
      </div>
      {loading && (
        <div className="space-y-3" role="status" aria-label="Loading news">
          {Array.from({ length: 4 }).map((_,i) => (
            <div key={i} className="animate-pulse p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-1" />
              <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}
      {!loading && error && (
        <div className="text-center py-6 text-sm text-red-600 dark:text-red-400" role="alert">{error}</div>
      )}
      {!loading && !error && news.length === 0 && (
        <div className="text-center py-6 text-sm text-gray-500 dark:text-slate-300">No news found.</div>
      )}
      {!loading && !error && news.length > 0 && (
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1" role="list">
          {news.map((n,i) => {
            const score = typeof n.sentimentScore === 'number' ? n.sentimentScore : n.averageScore;
            const confidencePct = n.confidence != null ? Math.round(n.confidence * 100) : null;
            const label = n.sentimentLabel || (score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral');
            const labelClasses = label === 'positive'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
              : label === 'negative'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-200';
            return (
              <a
                aria-label={`News: ${n.title || n.headline}`}
                key={n._id || i}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-brand-400 hover:bg-brand-50/40 dark:hover:bg-slate-800 transition"
              >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900 dark:text-slate-100 group-hover:text-brand-700 dark:group-hover:text-brand-300 line-clamp-2">{n.title || n.headline}</div>
                  {n.description && <div className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2 mt-1">{n.description}</div>}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-gray-500 dark:text-slate-400">
                    <span className="uppercase tracking-wide font-semibold">{(n.provider || n.source || n.sourceType || '').toString()}</span>
                    {n.sourceType && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-[9px] font-semibold text-gray-700 dark:text-slate-200">
                        {n.sourceType}
                      </span>
                    )}
                    <span aria-hidden="true">•</span>
                    <span>{new Date(n.publishedAt || n.timestamp).toLocaleString()}</span>
                    {confidencePct != null && (
                      <>
                        <span aria-hidden="true">•</span>
                        <span className="font-semibold text-gray-800 dark:text-slate-100">{confidencePct}% conf.</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {typeof score === 'number' && (
                    <div className={`text-xs font-bold w-12 text-center ${score > 0.2 ? 'text-green-600' : score < -0.2 ? 'text-red-600' : 'text-gray-600'}`}>
                      {score.toFixed(2)}
                    </div>
                  )}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${labelClasses}`}>
                    {label}
                  </span>
                </div>
              </div>
            </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
