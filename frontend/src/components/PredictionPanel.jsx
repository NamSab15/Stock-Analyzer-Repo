import React, { useState } from 'react';
import { BarChart3, ChevronDown, TrendingUp, AlertCircle, Briefcase } from 'lucide-react';

export default function PredictionPanel({ prediction, loading }) {
  const [expandedAnalysis, setExpandedAnalysis] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState(false);

  if (loading) return (
    <div className="card p-5 dark:bg-slate-800 dark:border-slate-600 text-center">
      <div className="w-8 h-8 border-4 border-brand-500 rounded-full animate-spin mx-auto mb-2" />
      <p className="text-sm text-gray-600 dark:text-slate-300">Generating prediction...</p>
    </div>
  );
  if (!prediction) return null;
  if (!prediction.success) {
    return (
      <div className="card dark:bg-slate-800 dark:border-slate-600">
        <div className="p-5">
          <div className="card-header mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Trading Recommendation</h3>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Unavailable</span>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-200">
            {prediction.error || 'Not enough reliable market or sentiment data to build a trading view right now.'}
          </div>
        </div>
      </div>
    );
  }
  const sig = prediction.prediction || { signal: 'HOLD', confidence: 0, riskLevel: 'UNKNOWN' };
  const analysis = prediction.companyAnalysis;
  
  return (
    <div className="card dark:bg-slate-800 dark:border-slate-600">
      <div className="p-5">
        {/* Header */}
        <div className="card-header mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Trading Recommendation</h3>
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Confidence {sig.confidence}%</span>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className={`metric ${sig.signal.includes('BUY') ? 'bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700' : sig.signal.includes('SELL') ? 'bg-red-50 border-red-300 dark:bg-red-900/30 dark:border-red-700' : 'bg-gray-50 border-gray-300 dark:bg-slate-700 dark:border-slate-600'}`}> 
            <span className="text-xs font-medium">Signal</span>
            <span className="text-lg font-bold">{sig.signal}</span>
          </div>
          <div className="metric bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700">
            <span className="text-xs font-medium">Risk</span>
            <span className="text-lg font-bold">{sig.riskLevel}</span>
          </div>
          <div className="metric bg-purple-50 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700">
            <span className="text-xs font-medium">Confidence</span>
            <span className="text-lg font-bold">{sig.confidence}%</span>
          </div>
        </div>

        {/* Price Targets */}
        {prediction.priceTargets && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            {prediction.priceTargets.target1 && (
              <div className="metric bg-white dark:bg-slate-700 dark:border-slate-600">
                <span className="text-xs font-medium">Target</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">₹{prediction.priceTargets.target1.toFixed(2)}</span>
              </div>
            )}
            {prediction.priceTargets.stopLoss && (
              <div className="metric bg-white dark:bg-slate-700 dark:border-slate-600">
                <span className="text-xs font-medium">Stop Loss</span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">₹{prediction.priceTargets.stopLoss.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Recommendation */}
        <div className="text-sm text-gray-700 dark:text-slate-200 leading-relaxed mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          {prediction.recommendation}
        </div>
        
        {/* Technical Analysis */}
        <button
          onClick={() => setExpandedAnalysis(!expandedAnalysis)}
          className="w-full flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium transition py-2 mb-2"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${expandedAnalysis ? 'rotate-180' : ''}`} />
          <TrendingUp className="w-4 h-4" />
          Technical Analysis
        </button>
        
        {expandedAnalysis && prediction.explanation && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 mb-4">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Key Factors:</h4>
            <ul className="space-y-1">
              {prediction.explanation.slice(0, 5).map((reason, i) => (
                <li key={i} className="text-xs text-gray-700 dark:text-slate-300 flex gap-2">
                  <span className="text-brand-600">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Company Analysis Section */}
        {analysis && (
          <>
            <button
              onClick={() => setExpandedCompany(!expandedCompany)}
              className="w-full flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium transition py-2"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedCompany ? 'rotate-180' : ''}`} />
              <Briefcase className="w-4 h-4" />
              Company Profile & Analysis
            </button>

            {expandedCompany && (
              <div className="mt-3 space-y-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                
                {/* Sector & Key Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-slate-300">Sector:</span>
                    <p className="text-gray-600 dark:text-slate-400">{analysis.sector}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-slate-300">Sub-sector:</span>
                    <p className="text-gray-600 dark:text-slate-400">{analysis.subsector}</p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="bg-white dark:bg-slate-700 rounded p-2">
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Key Metrics</h5>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="text-center p-1 bg-blue-50 dark:bg-blue-900/30 rounded">
                      <div className="font-semibold text-blue-700 dark:text-blue-400">{analysis.keyMetrics.peRatio.toFixed(1)}</div>
                      <div className="text-gray-600 dark:text-slate-400 text-xs">P/E Ratio</div>
                    </div>
                    <div className="text-center p-1 bg-green-50 dark:bg-green-900/30 rounded">
                      <div className="font-semibold text-green-700 dark:text-green-400">{analysis.keyMetrics.roE.toFixed(1)}%</div>
                      <div className="text-gray-600 dark:text-slate-400 text-xs">ROE</div>
                    </div>
                    <div className="text-center p-1 bg-purple-50 dark:bg-purple-900/30 rounded">
                      <div className="font-semibold text-purple-700 dark:text-purple-400">{analysis.keyMetrics.pbRatio.toFixed(1)}</div>
                      <div className="text-gray-600 dark:text-slate-400 text-xs">P/B Ratio</div>
                    </div>
                  </div>
                </div>

                {/* Investment Thesis */}
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Investment Thesis</h5>
                  <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{analysis.investmentThesis}</p>
                </div>

                {/* Business Highlights */}
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Business Highlights</h5>
                  <ul className="space-y-0.5">
                    {analysis.businessHighlights.slice(0, 3).map((highlight, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-slate-300 flex gap-1.5">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Drivers */}
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Key Drivers</h5>
                  <ul className="space-y-0.5">
                    {analysis.keyDrivers.slice(0, 3).map((driver, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-slate-300 flex gap-1.5">
                        <span className="text-blue-600 dark:text-blue-400">→</span>
                        <span>{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    Key Risks
                  </h5>
                  <ul className="space-y-0.5">
                    {analysis.risks.slice(0, 3).map((risk, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-slate-300 flex gap-1.5">
                        <span className="text-red-600 dark:text-red-400">✗</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bullet Points */}
                <div className="flex flex-wrap gap-1.5">
                  {analysis.bulletPoints.map((point, i) => (
                    <span key={i} className={`text-xs px-2 py-1 rounded ${point.includes('✓') ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                      {point.slice(0, 20)}...
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
