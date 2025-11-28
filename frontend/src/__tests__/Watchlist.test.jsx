import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Sidebar from '../components/Sidebar.jsx';

const stocks = [
  { symbol: 'AAA.NS', currentPrice: 10, changePercent: 1.0, change: 0.1 },
  { symbol: 'BBB.NS', currentPrice: 11, changePercent: -0.5, change: -0.05 }
];

const sentiment = {};

describe('Watchlist pinning', () => {
  it('toggles pin state', () => {
    let watchlist = [];
    const handleToggle = (sym) => {
      watchlist = watchlist.includes(sym) ? watchlist.filter(s => s !== sym) : [...watchlist, sym];
      rerender(<Sidebar stocks={stocks} selected={null} onSelect={()=>{}} sentiment={sentiment} watchlist={watchlist} onToggleWatchlist={handleToggle} />);
    };
    const { rerender } = render(<Sidebar stocks={stocks} selected={null} onSelect={()=>{}} sentiment={sentiment} watchlist={watchlist} onToggleWatchlist={handleToggle} />);
    const pinBtn = screen.getByRole('button', { name: /Pin AAA.NS/i });
    fireEvent.click(pinBtn);
    expect(screen.getByRole('button', { name: /Unpin AAA.NS/i })).toBeInTheDocument();
  });
});
