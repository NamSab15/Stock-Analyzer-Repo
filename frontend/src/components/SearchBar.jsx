import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative" role="search">
      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      <input
        aria-label="Search stocks"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search stocks..."
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none transition"
      />
    </div>
  );
}
