import React, { useState } from 'react';
import { LineChart, Line, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import CandlestickChart from './CandlestickChart.jsx';

export default function PriceChart({ historyData, intradayData, loading }) {
  const [mode, setMode] = useState('history'); // 'history' | 'intraday'
  const [chartType, setChartType] = useState('line'); // 'line' | 'candlestick'
  const activeData = mode === 'intraday' ? intradayData : historyData;

  // Note: CandlestickChart component handles transforming incoming data

  const hasOHLC = Array.isArray(activeData) && activeData.some(d => d.open != null && d.high != null && d.low != null && d.close != null);
  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-64 flex items-center justify-center" role="status" aria-label="Loading chart">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!activeData || activeData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-center text-sm text-gray-500 dark:text-slate-300">
          No data available.
        </div>
      );
    }

    if (chartType === 'candlestick') {
      // Use the more sophisticated CandlestickChart component (if available)
      return <CandlestickChart data={activeData} loading={loading} />;
    }

    // Line chart (default)
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height={256}>
          <LineChart data={activeData.map(d => ({
            time: d.time || d.date || d.timestamp,
            price: Number(d.close || d.price || d.currentPrice || 0)
          }))} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="time" hide={true} />
            <YAxis domain={['auto','auto']} stroke="#64748b" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ fontSize: '12px' }} formatter={(v) => [`₹${Number(v || 0).toFixed(2)}`, 'Price']} />
            <Line type="monotone" dataKey="price" stroke="#2f5dff" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="card p-5 dark:bg-slate-800 dark:border-slate-600">
      <div className="card-header mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {mode === 'intraday' ? 'Intraday (5m)' : 'Price History'} - {chartType === 'line' ? 'Line Chart' : 'Candlestick'}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 border-r border-gray-300 dark:border-slate-600 pr-2">
            <button
              onClick={() => setMode('history')}
              aria-label="Show historical price data"
              className={`px-2 py-1 rounded text-xs font-medium transition ${mode==='history'? 'bg-brand-600 text-white dark:bg-brand-500' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'}`}
            >History</button>
            <button
              onClick={() => setMode('intraday')}
              aria-label="Show intraday price data"
              className={`px-2 py-1 rounded text-xs font-medium transition ${mode==='intraday'? 'bg-brand-600 text-white dark:bg-brand-500' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'}`}
            >Intraday</button>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setChartType('line')}
              aria-label="Show line chart"
              className={`px-2 py-1 rounded text-xs font-medium transition ${chartType==='line'? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'}`}
            >Line</button>
            {hasOHLC && (
              <button
                onClick={() => setChartType('candlestick')}
                aria-label="Show candlestick chart"
                className={`px-2 py-1 rounded text-xs font-medium transition ${chartType==='candlestick'? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'}`}
              >Candlestick</button>
            )}
          </div>
        </div>
      </div>
      {renderChart()}
    </div>
  );
}

