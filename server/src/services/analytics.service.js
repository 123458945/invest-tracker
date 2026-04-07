import Holding from '../models/Holding.js';

export const getPortfolioSummaryService = async (userId) => {
  const holdings = await Holding.find({ userId });

  const totalMarketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalCostBasis = holdings.reduce((sum, h) => sum + h.costBasis, 0);
  const totalProfitLoss = holdings.reduce((sum, h) => sum + h.profitLoss, 0);
  const totalProfitLossRate = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0;

  const profitHoldings = holdings.filter(h => h.profitLoss > 0);
  const lossHoldings = holdings.filter(h => h.profitLoss < 0);

  return {
    totalHoldings: holdings.length,
    totalMarketValue,
    totalCostBasis,
    totalProfitLoss,
    totalProfitLossRate,
    profitCount: profitHoldings.length,
    lossCount: lossHoldings.length,
    profitAmount: profitHoldings.reduce((sum, h) => sum + h.profitLoss, 0),
    lossAmount: Math.abs(lossHoldings.reduce((sum, h) => sum + h.profitLoss, 0)),
  };
};

export const getAssetAllocationService = async (userId) => {
  const holdings = await Holding.find({ userId });

  if (holdings.length === 0) {
    return [];
  }

  const allocation = {};
  let totalValue = 0;

  holdings.forEach(holding => {
    const marketValue = holding.marketValue || 0;
    totalValue += marketValue;

    const key = holding.stockName;
    if (!allocation[key]) {
      allocation[key] = {
        name: holding.stockName,
        code: holding.stockCode,
        value: 0,
        percentage: 0,
        assetType: holding.assetType,
      };
    }
    allocation[key].value += marketValue;
  });

  const result = Object.values(allocation).map(item => ({
    ...item,
    percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
  }));

  return result.sort((a, b) => b.value - a.value);
};

export const getTopPerformersService = async (userId, limit = 5) => {
  const holdings = await Holding.find({ userId });

  const withProfitRate = holdings.map(h => ({
    ...h.toObject(),
    profitLossRate: h.profitLossRate,
  }));

  const topGainers = [...withProfitRate]
    .filter(h => h.profitLoss > 0)
    .sort((a, b) => b.profitLossRate - a.profitLossRate)
    .slice(0, limit);

  const topLosers = [...withProfitRate]
    .filter(h => h.profitLoss < 0)
    .sort((a, b) => a.profitLossRate - b.profitLossRate)
    .slice(0, limit);

  return {
    topGainers,
    topLosers,
  };
};
