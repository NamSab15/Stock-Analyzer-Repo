import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Sidebar from '../components/Sidebar.jsx';

const stocks = [
  { symbol: 'TEST1.NS', currentPrice: 10, changePercent: 1.2, change: 0.12 },
  { symbol: 'TEST2.NS', currentPrice: 11, changePercent: -0.5, change: -0.05 }
];

const sentiment = {};

describe('Sidebar', () => {
  it('renders stocks and supports keyboard selection', () => {
    const handleSelect = vi.fn();
    render(<Sidebar stocks={stocks} selected={null} onSelect={handleSelect} sentiment={sentiment} />);
    const first = screen.getByRole('option', { name: /TEST1/i });
    first.focus();
    fireEvent.keyDown(first, { key: 'Enter' });
    expect(handleSelect).toHaveBeenCalled();
  });
});
