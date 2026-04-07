import axios from 'axios';
import Stock from '../models/Stock.js';
import Holding from '../models/Holding.js';

const EM_QUOTE_API = 'https://push2.eastmoney.com/api/qt/stock/get';
const EM_BATCH_API = 'https://push2.eastmoney.com/api/qt/clist/get';
const EASTMONEY_KLINE_API = 'https://push2his.eastmoney.com/api/qt/stock/kline/get';

const EM_HEADERS = {
  'Referer': 'https://quote.eastmoney.com/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

const isTradingTime = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();

  if (day === 0 || day === 6) return false;

  if (hour < 9 || (hour === 9 && minute < 30)) return false;
  if (hour >= 15) return false;

  return true;
};

const getCacheDuration = () => {
  return isTradingTime() ? 2 * 60 * 1000 : 60 * 60 * 1000;
};

export const fetchFundQuote = async (fundCode) => {
  // 基金在东方财富的 secid: 0.代码(深市) 或 1.代码(沪市)
  // 尝试两个市场
  for (const secid of [`0.${fundCode}`, `1.${fundCode}`]) {
    try {
      const response = await axios.get(EM_QUOTE_API, {
        params: { secid, fields: 'f43,f44,f45,f46,f57,f58,f60,f170' },
        timeout: 5000,
        headers: EM_HEADERS,
      });
      const d = response.data?.data;
      if (d && d.f43) {
        return {
          stockCode: fundCode,
          market: 'fund',
          stockName: d.f58,
          currentPrice: d.f43 / 100,
          changePercent: d.f170 / 100,
          assetType: 'fund',
        };
      }
    } catch (e) {
      continue;
    }
  }
  return null;
};

export const fetchStockQuote = async (stockCode, market) => {
  const secid = market === 'sh' ? `1.${stockCode}` : `0.${stockCode}`;

  try {
    const response = await axios.get(EM_QUOTE_API, {
      params: { secid, fields: 'f43,f44,f45,f46,f47,f48,f57,f58,f60,f170' },
      timeout: 5000,
      headers: EM_HEADERS,
    });

    const d = response.data?.data;
    if (!d || !d.f43) {
      throw new Error('未获取到行情数据');
    }

    const currentPrice = d.f43 / 100;
    const prevClose = (d.f60 || d.f46) / 100;
    const changePercent = prevClose > 0 ? ((currentPrice - prevClose) / prevClose) * 100 : (d.f170 / 100);

    return {
      stockCode,
      market,
      stockName: d.f58,
      openPrice: d.f46 / 100,
      currentPrice,
      highPrice: d.f44 / 100,
      lowPrice: d.f45 / 100,
      closePrice: prevClose,
      changePercent,
      volume: d.f47 || 0,
      turnover: d.f48 || 0,
    };
  } catch (error) {
    throw new Error(`获取行情失败: ${error.message}`);
  }
};

export const getStockQuoteService = async (stockCode, market) => {
  const cachedStock = await Stock.findOne({ stockCode });

  const cacheDuration = getCacheDuration();
  const now = new Date();

  if (cachedStock && (now - cachedStock.lastFetchedAt) < cacheDuration) {
    return cachedStock;
  }

  const quote = await fetchStockQuote(stockCode, market);

  const stockData = {
    stockCode: quote.stockCode,
    stockName: quote.stockName,
    currentPrice: quote.currentPrice,
    openPrice: quote.openPrice,
    highPrice: quote.highPrice,
    lowPrice: quote.lowPrice,
    closePrice: quote.closePrice,
    changePercent: quote.changePercent,
    volume: quote.volume,
    turnover: quote.turnover,
    lastFetchedAt: now,
  };

  if (cachedStock) {
    await Stock.findByIdAndUpdate(cachedStock._id, stockData);
  } else {
    await Stock.create(stockData);
  }

  return await Stock.findOne({ stockCode });
};

export const searchStocksService = async (keyword, userId = null) => {
  const isCodePattern = /^\d{6}$/.test(keyword);
  
  let userHoldings = [];
  if (userId) {
    userHoldings = await Holding.find({ userId }).lean();
  }
  
  if (isCodePattern) {
    const results = [];
    
    const fundQuote = await fetchFundQuote(keyword);
    if (fundQuote) {
      const holding = userHoldings.find(h => h.stockCode === keyword && h.market === 'fund');
      results.push({
        ...fundQuote,
        isHeld: !!holding,
        holdingQuantity: holding?.quantity || 0,
      });
    }
    
    const markets = ['sh', 'sz'];
    for (const market of markets) {
      try {
        const quote = await fetchStockQuote(keyword, market);
        if (quote && quote.stockName) {
          const holding = userHoldings.find(h => h.stockCode === keyword && h.market === market);
          results.push({
            stockCode: quote.stockCode,
            stockName: quote.stockName,
            market,
            currentPrice: quote.currentPrice,
            changePercent: quote.changePercent,
            assetType: 'stock',
            isHeld: !!holding,
            holdingQuantity: holding?.quantity || 0,
          });
        }
      } catch (error) {
        continue;
      }
    }
    
    return results;
  }
  
  const stocks = await Stock.find({
    $or: [
      { stockCode: { $regex: keyword, $options: 'i' } },
      { stockName: { $regex: keyword, $options: 'i' } },
    ],
  }).limit(20).lean();

  return stocks.map(stock => {
    const holding = userHoldings.find(h => h.stockCode === stock.stockCode);
    return {
      ...stock,
      isHeld: !!holding,
      holdingQuantity: holding?.quantity || 0,
    };
  });
};

export const getStockMAService = async (stockCode) => {
  const stock = await Stock.findOne({ stockCode });
  if (!stock) {
    throw new Error('股票不存在');
  }

  return {
    ma5: stock.ma5,
    ma10: stock.ma10,
    ma20: stock.ma20,
    ma60: stock.ma60,
  };
};

const calculateMA = (closePrices, period) => {
  if (closePrices.length < period) return null;
  const sum = closePrices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
};

export const fetchKLineData = async (stockCode, market, count = 70) => {
  const secid = market === 'sh' ? `1.${stockCode}` : market === 'sz' ? `0.${stockCode}` : null;
  
  if (!secid) {
    return null;
  }

  const today = new Date();
  const endDate = today.toISOString().split('T')[0].replace(/-/g, '');
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - count * 2);
  const begDate = startDate.toISOString().split('T')[0].replace(/-/g, '');

  try {
    const response = await axios.get(EASTMONEY_KLINE_API, {
      params: {
        secid,
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
        klt: 101,
        fqt: 1,
        beg: begDate,
        end: endDate,
      },
      timeout: 10000,
      headers: {
        'Referer': 'https://quote.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.data?.data?.klines) {
      return null;
    }

    const klines = response.data.data.klines;
    const result = [];
    
    for (const kline of klines.slice(-count)) {
      const parts = kline.split(',');
      result.push({
        date: parts[0],
        open: parseFloat(parts[1]) || 0,
        close: parseFloat(parts[2]) || 0,
        high: parseFloat(parts[3]) || 0,
        low: parseFloat(parts[4]) || 0,
        volume: parseInt(parts[5]) || 0,
      });
    }

    return result;
  } catch (error) {
    console.error(`获取K线数据失败: ${stockCode} - ${error.message}`);
    return null;
  }
};

export const calculateAndUpdateMA = async (stockCode, market) => {
  const klines = await fetchKLineData(stockCode, market, 70);
  
  if (!klines || klines.length < 5) {
    return null;
  }

  const closePrices = klines.map(k => k.close);
  
  const ma5 = calculateMA(closePrices, 5);
  const ma10 = calculateMA(closePrices, 10);
  const ma20 = calculateMA(closePrices, 20);
  const ma60 = calculateMA(closePrices, 60);

  const prevClose = closePrices.length >= 2 ? closePrices[closePrices.length - 2] : null;
  const prevMa5 = closePrices.length >= 6 ? calculateMA(closePrices.slice(0, -1), 5) : null;
  const prevMa10 = closePrices.length >= 11 ? calculateMA(closePrices.slice(0, -1), 10) : null;
  const prevMa20 = closePrices.length >= 21 ? calculateMA(closePrices.slice(0, -1), 20) : null;
  const prevMa60 = closePrices.length >= 61 ? calculateMA(closePrices.slice(0, -1), 60) : null;

  await Stock.findOneAndUpdate(
    { stockCode },
    { ma5, ma10, ma20, ma60 },
    { upsert: true }
  );

  return {
    currentPrice: closePrices[closePrices.length - 1],
    ma5,
    ma10,
    ma20,
    ma60,
    prevClose,
    prevMa5,
    prevMa10,
    prevMa20,
    prevMa60,
  };
};

export const getHistoryClosePriceService = async (stockCode, market, date) => {
  const secid = market === 'sh' ? `1.${stockCode}` : market === 'sz' ? `0.${stockCode}` : null;
  
  if (!secid) {
    if (market === 'fund') {
      return await getFundHistoryPriceService(stockCode, date);
    }
    throw new Error('不支持的市场类型');
  }

  const dateStr = date.replace(/-/g, '');
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 7);
  const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');

  console.log(`获取历史价格: stockCode=${stockCode}, market=${market}, date=${date}, secid=${secid}`);

  try {
    const response = await axios.get(EASTMONEY_KLINE_API, {
      params: {
        secid,
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
        klt: 101,
        fqt: 1,
        beg: dateStr,
        end: endDateStr,
      },
      timeout: 10000,
      headers: {
        'Referer': 'https://quote.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    console.log('东方财富API响应:', response.data ? '有数据' : '无数据');

    if (response.data && response.data.data && response.data.data.klines) {
      const klines = response.data.data.klines;
      console.log('K线数据条数:', klines.length);
      
      for (const kline of klines) {
        const parts = kline.split(',');
        console.log('检查K线:', parts[0], '目标日期:', date);
        if (parts[0] === date) {
          const result = {
            date,
            closePrice: parseFloat(parts[2]) || 0,
            openPrice: parseFloat(parts[1]) || 0,
            highPrice: parseFloat(parts[3]) || 0,
            lowPrice: parseFloat(parts[4]) || 0,
          };
          console.log('找到匹配数据:', result);
          return result;
        }
      }
    }

    throw new Error('未找到该日期的历史数据（可能为非交易日）');
  } catch (error) {
    if (error.message.includes('未找到该日期')) {
      throw error;
    }
    console.error('获取历史价格失败:', error.message);
    throw new Error(`获取历史价格失败: ${error.message}`);
  }
};

const getFundHistoryPriceService = async (fundCode, date) => {
  const url = `https://fundf10.eastmoney.com/F10DataApi.aspx`;
  
  const dateObj = new Date(date);
  const startDate = new Date(dateObj);
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date(dateObj);
  endDate.setDate(endDate.getDate() + 7);
  
  const formatDate = (d) => d.toISOString().split('T')[0];
  
  try {
    const response = await axios.get(url, {
      params: {
        type: 'lsjz',
        code: fundCode,
        page: 1,
        per: 40,
        sdate: formatDate(startDate),
        edate: formatDate(endDate),
      },
      timeout: 10000,
      headers: {
        'Referer': 'https://fundf10.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const data = response.data;
    const contentMatch = data.match(/content:"([^"]+)"/);
    if (!contentMatch) {
      throw new Error('未找到基金净值数据');
    }
    
    const html = contentMatch[1];
    const rowRegex = new RegExp(`<td>${date}</td>\\s*<td[^>]*>(\\d+\\.\\d+)</td>`, 'i');
    const match = html.match(rowRegex);
    
    if (match) {
      return {
        date,
        closePrice: parseFloat(match[1]) || 0,
      };
    }

    throw new Error('未找到该日期的基金净值数据（可能为非交易日）');
  } catch (error) {
    if (error.message.includes('未找到')) {
      throw error;
    }
    console.error('获取基金历史净值失败:', error.message);
    throw new Error(`获取基金历史净值失败: ${error.message}`);
  }
};

export const updateHoldingPricesService = async (userId) => {
  const Holding = (await import('../models/Holding.js')).default;
  const holdings = await Holding.find({ userId });

  if (holdings.length === 0) return [];

  const stockHoldings = holdings.filter((h) => h.market === 'sh' || h.market === 'sz');
  const fundHoldings = holdings.filter((h) => h.market === 'fund');

  const updates = [];

  if (stockHoldings.length > 0) {
    for (const holding of stockHoldings) {
      try {
        const quote = await fetchStockQuote(holding.stockCode, holding.market);
        if (quote && quote.currentPrice > 0) {
          await Holding.findByIdAndUpdate(holding._id, { 
            currentPrice: quote.currentPrice,
            stockName: quote.stockName 
          });
          
          updates.push({
            id: holding._id,
            stockCode: holding.stockCode,
            stockName: quote.stockName,
            currentPrice: quote.currentPrice,
            changePercent: quote.changePercent,
          });
        }
      } catch (error) {
        console.error(`更新股票 ${holding.stockCode} 价格失败:`, error.message);
      }
    }
  }

  if (fundHoldings.length > 0) {
    for (const holding of fundHoldings) {
      try {
        const fundData = await fetchFundQuote(holding.stockCode);
        if (fundData && fundData.currentPrice > 0) {
          await Holding.findByIdAndUpdate(holding._id, { 
            currentPrice: fundData.currentPrice,
            stockName: fundData.stockName 
          });
          
          updates.push({
            id: holding._id,
            stockCode: holding.stockCode,
            stockName: fundData.stockName,
            currentPrice: fundData.currentPrice,
            changePercent: fundData.changePercent,
          });
        }
      } catch (error) {
        console.error(`更新基金 ${holding.stockCode} 价格失败:`, error.message);
      }
    }
  }

  return updates;
};
