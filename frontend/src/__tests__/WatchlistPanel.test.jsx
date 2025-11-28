import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WatchlistPanel from '../components/WatchlistPanel.jsx';

describe('WatchlistPanel', () => {
  it('renders pinned stocks horizontally', () => {
    const stocks = [
      { symbol: 'TEST1.NS', currentPrice: 100, changePercent: 0.5 },
      { symbol: 'TEST2.NS', currentPrice: 200, changePercent: -1.2 },
    ];
    const watchlist = ['TEST2.NS'];
    render(<WatchlistPanel stocks={stocks} watchlist={watchlist} onSelect={() => {}} onToggleWatchlist={() => {}} />);
    expect(screen.getByText('TEST2')).toBeInTheDocument();
  });
});
