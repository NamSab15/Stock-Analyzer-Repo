import { vi, describe, it, expect } from 'vitest';
import * as apiModule from '../services/api.js';

const mockGet = vi.fn();
// Override api instance get method directly to avoid network
apiModule.api.get = mockGet;

describe('API service', () => {
  it('calls stocks endpoint', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true } });
    const res = await apiModule.getStocks();
    expect(mockGet).toHaveBeenCalledWith('/stocks');
    expect(res.success).toBe(true);
  });

  it('calls history endpoint with days', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });
    await apiModule.getHistory('TEST.NS', 15);
    expect(mockGet).toHaveBeenCalledWith('/stocks/TEST.NS/history?days=15');
  });
});
