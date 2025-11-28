const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const axios = require('axios');
jest.mock('axios');

const { fetchStockData } = require('../services/stockService');

describe('stockService', () => {
  let mongo;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetchFromYahoo returns dayHigh/dayLow', async () => {
    const fakeResponse = {
      data: {
        chart: {
          result: [
            {
              meta: { previousClose: 100, marketCap: 123456, currency: 'INR', marketState: 'REGULAR' },
              timestamp: [1698700000],
              indicators: { quote: [{ close: [101], high: [105], low: [99], volume: [10000] }] }
            }
          ]
        }
      }
    };
    axios.get.mockResolvedValue(fakeResponse);
    const data = await fetchStockData('TEST.NS');
    expect(data.dayHigh).toBe(105);
    expect(data.dayLow).toBe(99);
    expect(data.currentPrice).toBe(101);
  });

});
