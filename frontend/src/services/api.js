import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || window.__API_URL__ || 'http://localhost:5000/api';

console.log('API: Using base URL:', API_BASE);

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000
});

// Request interceptor to add auth token
api.interceptors.request.use(config => {
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Error setting auth header:', err);
  }
  return config;
});

// Response interceptor for error logging
api.interceptors.response.use(
  response => {
    console.log('API: Response OK:', response.config.url);
    return response;
  },
  error => {
    console.error('API: Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export async function getStocks() {
  try {
    console.log('API: getStocks()');
    const { data } = await api.get('/stocks');
    console.log('API: getStocks() success:', data?.data?.length || 0, 'items');
    return data;
  } catch (err) {
    console.error('API: getStocks() caught:', err?.message);
    throw err;
  }
}
export async function searchStocks(q) {
  const { data } = await api.get(`/stocks/search?q=${encodeURIComponent(q)}`);
  return data;
}
export async function getStock(symbol) {
  const { data } = await api.get(`/stocks/${symbol}`);
  return data;
}
export async function refreshStock(symbol) {
  const { data } = await api.post(`/stocks/refresh/${symbol}`);
  return data;
}
export async function refreshAllStocks() {
  const { data } = await api.post('/stocks/refresh-all');
  return data;
}
export async function getPrediction(symbol) {
  const { data } = await api.get(`/stocks/${symbol}/prediction`);
  return data;
}
export async function getSentiment(symbol, hours = 72) {
  const { data } = await api.get(`/sentiment/${symbol}?hours=${hours}`);
  return data;
}
export async function getSentimentHistory(symbol, days = 14) {
  const params = new URLSearchParams({ days });
  const { data } = await api.get(`/sentiment/${symbol}/history?${params.toString()}`);
  return data;
}
export async function getSentimentNews(symbol, options = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', options.limit);
  if (options.sourceType) params.set('sourceType', options.sourceType);
  if (typeof options.minConfidence === 'number') params.set('minConfidence', options.minConfidence);
  const { data } = await api.get(`/sentiment/${symbol}/news?${params.toString()}`);
  return data;
}
export async function getNews(symbol, limit = 10) {
  const { data } = await api.get(`/stocks/${symbol}/news?limit=${limit}`);
  return data;
}
export async function getHistory(symbol, days = 30) {
  // Align with backend route expecting ?days=NN
  const { data } = await api.get(`/stocks/${symbol}/history?days=${days}`);
  return data;
}

export async function getIntraday(symbol) {
  const { data } = await api.get(`/stocks/${symbol}/intraday`);
  return data;
}

