import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { ArrowUp, ArrowDown } from 'lucide-react';
import Header from './components/Header.jsx';
import SearchBar from './components/SearchBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import WatchlistPanel from './components/WatchlistPanel.jsx';
import StockMetrics from './components/StockMetrics.jsx';
import SentimentPanel from './components/SentimentPanel.jsx';
import PredictionPanel from './components/PredictionPanel.jsx';
import NewsPanel from './components/NewsPanel.jsx';
import PriceChart from './components/PriceChart.jsx';
import { getStocks, searchStocks, getSentiment, getPrediction, getSentimentHistory, getSentimentNews, getHistory, getIntraday, getStock, refreshStock, refreshAllStocks } from './services/api.js';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
const SENTIMENT_SOURCE_OPTIONS = [
  { key: 'news', label: 'News' },
  { key: 'social', label: 'Social' },
];
const DEFAULT_SENTIMENT_SOURCES = SENTIMENT_SOURCE_OPTIONS.map(opt => opt.key);

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sentiment, setSentiment] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [news, setNews] = useState([]);
  const [history, setHistory] = useState([]);
  const [intraday, setIntraday] = useState([]);
  const [sentimentHistory, setSentimentHistory] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [errorNews, setErrorNews] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [search, setSearch] = useState('');
  const [dark, setDark] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const { user, addToWatchlist: addToWatchlistServer, removeFromWatchlist: removeFromWatchlistServer } = useAuth();
  const [sentimentFilters, setSentimentFilters] = useState({
    sourceTypes: DEFAULT_SENTIMENT_SOURCES,
    minConfidence: 0.4,
  });
  const wsRef = useRef(null);
  const searchRef = useRef(null);

  const sentimentFilterKey = useMemo(() => {
    const sortedSources = [...sentimentFilters.sourceTypes].sort().join(',');
    return `${sortedSources}|${sentimentFilters.minConfidence}`;
  }, [sentimentFilters]);

  // Theme toggle effect + persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        setDark(true);
        document.documentElement.classList.add('dark');
      }
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  // Initial load + watchlist restore
  useEffect(() => { 
    loadInitial(); 
    try {
      const saved = JSON.parse(localStorage.getItem('watchlist') || '[]');
      if (Array.isArray(saved)) setWatchlist(saved);
      // If user is authenticated and has server watchlist, use that instead
      if (user?.watchlist && Array.isArray(user.watchlist) && user.watchlist.length > 0) {
        setWatchlist(user.watchlist);
      }
    } catch {}
  }, []);

  // Keep watchlist in sync with authenticated user (if any)
  useEffect(() => {
    try {
      if (user?.watchlist && Array.isArray(user.watchlist)) {
        setWatchlist(user.watchlist);
      }
    } catch {}
  }, [user]);

  async function loadInitial() {
    try {
      console.log('App: loadInitial() started');
      const data = await getStocks();
      console.log('App: getStocks() response:', data);
      if (data && data.success) {
        console.log('App: Setting stocks:', data.data?.length || 0, 'items');
        setStocks(data.data);
      } else {
        console.warn('App: getStocks() returned non-success:', data);
      }
    } catch (e) { 
      console.error('App: loadInitial() failed:', e?.message || e); 
    }
  }

  async function handleRefreshAll() {
    try {
      await refreshAllStocks();
    } catch (e) {
      console.error('Refresh all failed', e);
    } finally {
      loadInitial();
    }
  }

  // WebSocket connection
  useEffect(() => {
    console.log('App: WebSocket useEffect starting');
    connectWS();
    return () => {
      console.log('App: WebSocket cleanup');
      wsRef.current?.close();
    };
  }, []);

  function connectWS() {
    console.log('App: connectWS() called, WS_URL:', WS_URL);
    try {
      wsRef.current = new WebSocket(WS_URL);
      wsRef.current.onopen = () => console.log('App: WebSocket connected');
      wsRef.current.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'stock_update') {
            const updates = msg.data;
            if (Array.isArray(updates)) {
              setStocks(prev => {
                try {
                  const map = new Map(prev.map(s => [s.symbol, s]));
                  updates.forEach(u => {
                    if (u?.stock?.symbol) {
                      const prevVal = map.get(u.stock.symbol) || {};
                      map.set(u.stock.symbol, { ...prevVal, ...u.stock });
                    }
                  });
                  return Array.from(map.values());
                } catch (mergeErr) {
                  console.error('WS merge error', mergeErr);
                  return prev;
                }
              });
              updates.forEach(u => {
                if (u?.sentiment && u?.stock?.symbol) {
                  setSentiment(prev => ({ ...prev, [u.stock.symbol]: u.sentiment }));
                }
              });
            }
          }
        } catch (err) { console.error('WS parse error', err); }
      };
      wsRef.current.onclose = () => {
        console.log('App: WebSocket closed, reconnecting in 5s');
        setTimeout(connectWS, 5000);
      };
      wsRef.current.onerror = (err) => {
        console.error('App: WebSocket error:', err);
      };
    } catch (err) {
      console.error('App: connectWS() failed:', err);
    }
  }

  // Search debounce
  useEffect(() => {
    if (!search) {
      loadInitial();
      return;
    }
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(async () => {
      try {
        const res = await searchStocks(search);
        if (res.success) setStocks(res.data);
      } catch (e) { console.error(e); }
    }, 350);
    
    return () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    };
  }, [search]);

  async function handleSelect(stock) {
    setSelected(stock);
    setPrediction(null);
    setNews([]);
    setHistory([]);
    setIntraday([]);
    setSentimentHistory([]);
    setErrorNews(null);
    try {
      // Ensure we have full stock details from DB (or refresh)
      try {
        const st = await getStock(stock.symbol);
        if (st.success && st.data) setSelected(st.data);
      } catch (e) {
        const ref = await refreshStock(stock.symbol);
        if (ref.success && ref.data) setSelected(ref.data);
      }

      const sRes = await getSentiment(stock.symbol);
      if (sRes.success && sRes.data) setSentiment(prev => ({ ...prev, [stock.symbol]: sRes.data }));
      const histRes = await getSentimentHistory(stock.symbol);
      if (histRes.success) setSentimentHistory(histRes.data || []);
    } catch (e) {}
    try {
      setLoadingPrediction(true);
      const pRes = await getPrediction(stock.symbol);
      setPrediction(pRes);
    } catch (e) { console.error(e); }
    finally { setLoadingPrediction(false); }
    try {
      setLoadingChart(true);
      const hRes = await getHistory(stock.symbol);
      if (hRes.success) setHistory(hRes.data);
      const iRes = await getIntraday(stock.symbol);
      if (iRes.success) setIntraday(iRes.data);
    } catch (e) { console.error(e); }
    finally { setLoadingChart(false); }
  }

  useEffect(() => {
    if (!selected?.symbol) return;
    let cancelled = false;
    async function loadSentimentNews() {
      setLoadingNews(true);
      setErrorNews(null);
      try {
        const response = await getSentimentNews(selected.symbol, {
          limit: 20,
          sourceType: sentimentFilters.sourceTypes.join(','),
          minConfidence: sentimentFilters.minConfidence,
        });
        if (!cancelled) {
          if (response.success) {
            setNews(response.data || []);
          } else {
            setErrorNews('Failed to load sentiment news');
          }
        }
      } catch (error) {
        if (!cancelled) setErrorNews('Failed to load sentiment news');
      } finally {
        if (!cancelled) setLoadingNews(false);
      }
    }
    loadSentimentNews();
    return () => {
      cancelled = true;
    };
  }, [selected?.symbol, sentimentFilterKey]);

  function handleToggleSentimentSource(sourceKey) {
    setSentimentFilters(prev => {
      const exists = prev.sourceTypes.includes(sourceKey);
      let nextSources = exists
        ? prev.sourceTypes.filter(s => s !== sourceKey)
        : [...prev.sourceTypes, sourceKey];
      if (nextSources.length === 0) {
        nextSources = [...DEFAULT_SENTIMENT_SOURCES];
      }
      return { ...prev, sourceTypes: nextSources };
    });
  }

  function handleConfidenceFilterChange(value) {
    setSentimentFilters(prev => ({ ...prev, minConfidence: Number(value) }));
  }

  function toggleWatchlist(symbol) {
    setWatchlist(prev => {
      const next = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      try { localStorage.setItem('watchlist', JSON.stringify(next)); } catch {}
      // also try persisting to server for authenticated users
      try {
        if (user && addToWatchlistServer && removeFromWatchlistServer) {
          if (next.includes(symbol)) {
            addToWatchlistServer(symbol).catch(() => {});
          } else {
            removeFromWatchlistServer(symbol).catch(() => {});
          }
        }
      } catch (err) {}
      return next;
    });
  }

  const orderedStocks = (() => {
    if (watchlist.length === 0) return stocks.slice(0,80);
    const map = new Map(stocks.map(s => [s.symbol, s]));
    const pinned = watchlist.map(sym => map.get(sym)).filter(Boolean);
    const rest = stocks.filter(s => !watchlist.includes(s.symbol));
    return [...pinned, ...rest].slice(0, 120);
  })();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      <Header wsConnected={!!wsRef.current && wsRef.current.readyState === 1} onRefresh={handleRefreshAll} dark={dark} toggleDark={() => setDark(d => !d)} />
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6">
        <WatchlistPanel stocks={stocks} watchlist={watchlist} onSelect={handleSelect} onToggleWatchlist={toggleWatchlist} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <SearchBar value={search} onChange={setSearch} />
            <Sidebar 
              stocks={orderedStocks} 
              selected={selected} 
              onSelect={handleSelect} 
              sentiment={sentiment}
              watchlist={watchlist}
              onToggleWatchlist={toggleWatchlist}
            />
          </div>
          <div className="md:col-span-3 space-y-6">
            {!selected && (
              <div className="card p-10 flex flex-col items-center justify-center dark:bg-slate-800 dark:border-slate-700 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-100 to-brand-300 flex items-center justify-center mb-4">
                  <span className="text-brand-700 font-bold text-xl">IS</span>
                </div>
                <h2 className="text-xl font-semibold mb-2">Select a stock</h2>
                <p className="text-sm text-gray-600 dark:text-slate-300 max-w-md">Use the watchlist to explore real-time prices, AI predictions, sentiment analytics and news coverage for Indian stocks.</p>
              </div>
            )}
            {selected && (
              <div className="space-y-6">
                <div className="card p-6 dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">{selected.name}</h2>
                      <p className="text-sm text-gray-600 dark:text-slate-300">{selected.symbol} • {selected.exchange}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">₹{selected.currentPrice > 0 ? selected.currentPrice.toFixed(2) : '--'}</div>
                      <div className={`text-sm font-semibold inline-flex items-center gap-1 px-2 py-1 rounded-full mt-2 ${selected.change >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                        {selected.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />} {selected.change?.toFixed(2)} ({Math.abs(selected.changePercent || 0).toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                  <StockMetrics stock={selected} />
                </div>
                <PriceChart historyData={history} intradayData={intraday} loading={loadingChart} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <PredictionPanel prediction={prediction} loading={loadingPrediction} />
                    <SentimentPanel data={sentiment[selected.symbol]} history={sentimentHistory} />
                  </div>
                  <NewsPanel
                    news={news}
                    loading={loadingNews}
                    error={errorNews}
                    filters={sentimentFilters}
                    sourceOptions={SENTIMENT_SOURCE_OPTIONS}
                    onToggleSource={handleToggleSentimentSource}
                    onConfidenceChange={handleConfidenceFilterChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <footer className="pt-4 pb-10 text-xs text-gray-500 dark:text-slate-400 text-center">Data is for educational purposes. © {new Date().getFullYear()} Indian Stocks Dashboard.</footer>
      </main>
    </div>
  );
}
