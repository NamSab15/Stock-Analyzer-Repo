import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PriceChart from '../components/PriceChart.jsx';

const historyData = [
  { date: '2025-11-10', close: 100 },
  { date: '2025-11-11', close: 102 }
];
const intradayData = [
  { time: '09:30', price: 101 },
  { time: '09:35', price: 103 }
];

describe('PriceChart', () => {
  it('renders history by default', () => {
    render(<PriceChart historyData={historyData} intradayData={intradayData} loading={false} />);
    expect(screen.getByRole('heading', { name: /Price History/i })).toBeInTheDocument();
  });

  it('switches to intraday when clicking Intraday button', () => {
    render(<PriceChart historyData={historyData} intradayData={intradayData} loading={false} />);
    const intradayBtn = screen.getByRole('button', { name: /Show intraday price data/i });
    fireEvent.click(intradayBtn);
    expect(screen.getByRole('heading', { name: /Intraday \(5m\)/i })).toBeInTheDocument();
  });

  it('switches to candlestick and does not display emoji labels', async () => {
    render(<PriceChart historyData={historyData} intradayData={intradayData} loading={false} />);
    // The test uses historyData which contains `close` but not OHLC; the button should be present for transformed data
    const candleBtn = screen.queryByRole('button', { name: /Show candlestick chart/i });
    if (candleBtn) {
      fireEvent.click(candleBtn);
      // label should be 'Candlestick' not emoji
      expect(candleBtn.textContent).toContain('Candlestick');
      expect(candleBtn.textContent).not.toContain('🕯');
    }
    fireEvent.click(candleBtn);
    // label should be 'Candlestick' not emoji
    expect(candleBtn.textContent).toContain('Candlestick');
    expect(candleBtn.textContent).not.toContain('🕯');
  });

  it('shows loading state', () => {
    render(<PriceChart historyData={[]} intradayData={[]} loading={true} />);
    expect(screen.getByRole('status', { name: /Loading chart/i })).toBeInTheDocument();
  });
});
