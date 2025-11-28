import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const sentimentColor = (score) => {
  if (score > 0.2) return 'text-green-600 dark:text-green-300';
  if (score < -0.2) return 'text-red-600 dark:text-red-300';
  return 'text-gray-600 dark:text-slate-300';
};

const trendBadgeClasses = (score) => {
  if (score > 0.2) return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
  if (score < -0.2) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  return 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300';
};

function SentimentSparkline({ history = [] }) {
  if (!history.length) return (
    <div className="h-24 flex items-center justify-center text-xs text-gray-500 dark:text-slate-400">
      Not enough history
    </div>
  );

  const chartData = history.map(item => {
    const numericSentiment = Number(item.sentiment ?? item.avgSentiment ?? 0) || 0;
    return {
      time: typeof item.timestamp === 'string' ? item.timestamp : new Date(item.timestamp).toISOString(),
      sentiment: Number(numericSentiment.toFixed(3)),
    };
  });

  return (
    <div className="h-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="80%" stopColor="#6366f1" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="sentiment" stroke="#10b981" strokeWidth={2} fill="url(#sentimentGradient)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function SentimentPanel({ data, history }) {
  if (!data?.dataAvailable) return null;
  const confidencePct = Math.round((data.avgConfidence || 0) * 100);
  const freshness = data.freshnessMinutes != null ? `${data.freshnessMinutes}m ago` : 'Unknown';
  const sourceBreakdown = Object.entries(data.sourceBreakdown || {});
  const latestSignals = Array.isArray(data.latestSignals) ? data.latestSignals.slice(0, 3) : [];

  return (
    <div className="card p-5 dark:bg-slate-800 dark:border-slate-600">
      <div className="card-header">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Sentiment (72h)</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trendBadgeClasses(data.avgSentiment)}`}>
          {data.sentimentTrend.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-lg border bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
          <div className="text-xs font-medium text-green-700 dark:text-green-300">Positive</div>
          <div className="text-lg font-bold text-green-700 dark:text-green-300">{data.positiveCount}</div>
          <div className="text-xs text-green-600 dark:text-green-400">{data.positivePercentage}%</div>
        </div>
        <div className="p-3 rounded-lg border bg-gray-50 border-gray-200 dark:bg-slate-700 dark:border-slate-600">
          <div className="text-xs font-medium text-gray-700 dark:text-slate-200">Neutral</div>
          <div className="text-lg font-bold text-gray-700 dark:text-slate-200">{data.neutralCount}</div>
          <div className="text-xs text-gray-600 dark:text-slate-300">{data.neutralPercentage}%</div>
        </div>
        <div className="p-3 rounded-lg border bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700">
          <div className="text-xs font-medium text-red-700 dark:text-red-300">Negative</div>
          <div className="text-lg font-bold text-red-700 dark:text-red-300">{data.negativeCount}</div>
          <div className="text-xs text-red-600 dark:text-red-400">{data.negativePercentage}%</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xs text-gray-600 dark:text-slate-400">Average sentiment</div>
          <div className={`text-2xl font-bold tracking-tight ${sentimentColor(data.avgSentiment)}`}>
            {data.avgSentiment.toFixed(3)}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400">
            <span>Confidence</span>
            <span className="font-semibold text-gray-900 dark:text-white">{confidencePct}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-500"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">{data.totalMentions} mentions • {freshness}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-slate-400 mb-2">Source mix</div>
          <div className="flex flex-wrap gap-1">
            {sourceBreakdown.length === 0 && <span className="text-xs text-gray-500">N/A</span>}
            {sourceBreakdown.map(([source, count]) => (
              <span key={source} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200">
                {source} • {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <SentimentSparkline history={history} />
      </div>

      {latestSignals.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-gray-600 dark:text-slate-400 mb-2">Fresh signals</div>
          <div className="space-y-2">
            {latestSignals.map((signal, idx) => (
              <div key={`${signal.description}-${idx}`} className="flex items-center justify-between rounded-md border border-gray-200 dark:border-slate-600 px-3 py-2 text-xs">
                <div className="font-medium text-gray-800 dark:text-slate-100">{signal.description}</div>
                {signal.strength != null && (
                  <div className="font-semibold text-indigo-600 dark:text-indigo-300">{Math.round((signal.strength || 0) * 100)}%</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
