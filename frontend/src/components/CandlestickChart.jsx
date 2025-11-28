import React, { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function CandlestickChart({ data, loading }) {
  const [timeRange, setTimeRange] = useState('30d');

  if (loading) return (
    <div className="card p-5 dark:bg-slate-800 dark:border-slate-600 text-center">
      <div className="w-8 h-8 border-4 border-brand-500 rounded-full animate-spin mx-auto mb-2" />
      <p className="text-sm text-gray-600 dark:text-slate-300">Loading chart...</p>
    </div>
  );

  if (!data || data.length === 0) return (
    <div className="card p-5 dark:bg-slate-800 dark:border-slate-600 text-center">
      <p className="text-sm text-gray-600 dark:text-slate-300">No data available</p>
    </div>
  );

  // Transform data for candlestick
  const chartData = data.map((item, index) => {
    const open = item.open || 0;
    const close = item.close || 0;
    const high = item.high || 0;
    const low = item.low || 0;
    
    return {
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: item.date,
      open,
      close,
      high,
      low,
      volume: item.volume || 0,
      wickLow: low,
      wickHigh: high,
      body: {
        start: Math.min(open, close),
        end: Math.max(open, close),
        fill: close >= open ? '#10b981' : '#ef4444'
      }
    };
  });

  // Custom candlestick shape
  const CandleShape = (props) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;

    const yScale = height / (Math.max(...chartData.map(d => d.high)) - Math.min(...chartData.map(d => d.low)));
    const xScale = width / chartData.length;
    const minPrice = Math.min(...chartData.map(d => d.low));

    // Wick (high-low line)
    const wickX = x + (xScale * 0.5);
    const wickTop = y + height - ((payload.high - minPrice) * yScale);
    const wickBottom = y + height - ((payload.low - minPrice) * yScale);

    // Body (open-close)
    const bodyTop = y + height - ((Math.max(payload.open, payload.close) - minPrice) * yScale);
    const bodyBottom = y + height - ((Math.min(payload.open, payload.close) - minPrice) * yScale);
    const bodyHeight = bodyBottom - bodyTop;

    return (
      <g>
        {/* Wick */}
        <line
          x1={wickX}
          y1={wickTop}
          x2={wickX}
          y2={wickBottom}
          stroke={payload.body.fill}
          strokeWidth={1}
        />
        {/* Body */}
        <rect
          x={x + (xScale * 0.15)}
          y={bodyTop}
          width={xScale * 0.7}
          height={Math.max(bodyHeight, 2)}
          fill={payload.body.fill}
          stroke={payload.body.fill}
          strokeWidth={1}
        />
      </g>
    );
  };

  return (
    <div className="card dark:bg-slate-800 dark:border-slate-600">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Candlestick Chart</h3>
          </div>
          <div className="flex gap-1">
            {['7d', '30d', '90d', '1y'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 text-xs font-medium rounded transition ${
                  timeRange === range
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Candlestick Chart */}
        <div className="bg-white dark:bg-slate-700 rounded-lg p-3 mb-4 overflow-x-auto">
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  interval={Math.floor(chartData.length / 10)}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                  formatter={(value) => value ? value.toFixed(2) : '0.00'}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="close"
                  fill="#3b82f6"
                  shape={<CandleShape />}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Price Statistics */}
        <div className="grid grid-cols-4 gap-3">
          {chartData.length > 0 && (() => {
            const highs = chartData.map(d => d.high || 0).filter(v => v > 0);
            const lows = chartData.map(d => d.low || 0).filter(v => v > 0);
            const open = chartData[0]?.open;
            const close = chartData[chartData.length - 1]?.close;
            return (
              <>
                {highs.length > 0 && (
                  <div className="metric bg-white dark:bg-slate-700 dark:border-slate-600">
                    <span className="text-xs font-medium">High</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">₹{Math.max(...highs).toFixed(2)}</span>
                  </div>
                )}
                {lows.length > 0 && (
                  <div className="metric bg-white dark:bg-slate-700 dark:border-slate-600">
                    <span className="text-xs font-medium">Low</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">₹{Math.min(...lows).toFixed(2)}</span>
                  </div>
                )}
                <div className="metric bg-white dark:bg-slate-700 dark:border-slate-600">
                  <span className="text-xs font-medium">Open</span>
                  <span className="text-sm font-bold">₹{open != null && open !== 0 ? open.toFixed(2) : 'N/A'}</span>
                </div>
                <div className="metric bg-white dark:bg-slate-700 dark:border-slate-600">
                  <span className="text-xs font-medium">Close</span>
                  <span className="text-sm font-bold">₹{close != null && close !== 0 ? close.toFixed(2) : 'N/A'}</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
