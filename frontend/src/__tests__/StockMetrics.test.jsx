import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StockMetrics from '../components/StockMetrics.jsx';

describe('StockMetrics', () => {
  it('displays day high and low', () => {
    const stock = { volume: 12345, dayHigh: 150.5, dayLow: 120.25, previousClose: 130.0 };
    render(<StockMetrics stock={stock} />);
    expect(screen.getByText('Day High')).toBeInTheDocument();
    expect(screen.getByText('Day Low')).toBeInTheDocument();
    expect(screen.getByText('150.50')).toBeInTheDocument();
    expect(screen.getByText('120.25')).toBeInTheDocument();
  });
});
