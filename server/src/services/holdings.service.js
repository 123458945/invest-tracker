import mongoose from 'mongoose';
import Holding from '../models/Holding.js';
import Transaction from '../models/Transaction.js';

export const getHoldingsService = async (userId) => {
  const holdings = await Holding.find({ userId, quantity: { $gt: 0 } }).sort({ createdAt: -1 });
  return holdings;
};

export const getHoldingByIdService = async (id, userId) => {
  const holding = await Holding.findOne({ _id: id, userId });
  if (!holding) {
    throw new Error('持仓不存在');
  }
  return holding;
};

export const getHoldingByStockCodeService = async (userId, stockCode, market) => {
  const holding = await Holding.findOne({ userId, stockCode, market });
  return holding;
};

export const createHoldingService = async (userId, holdingData) => {
  const { stockCode, stockName, market, assetType, quantity, buyPrice, buyDate, currentPrice, notes } = holdingData;

  const existingHolding = await Holding.findOne({ userId, stockCode, market });

  if (existingHolding) {
    const oldTotalCost = existingHolding.quantity * existingHolding.avgBuyPrice;
    const newTotalCost = quantity * buyPrice;
    const totalQuantity = existingHolding.quantity + quantity;
    const avgBuyPrice = totalQuantity > 0 ? (oldTotalCost + newTotalCost) / totalQuantity : 0;

    existingHolding.quantity = totalQuantity;
    existingHolding.avgBuyPrice = avgBuyPrice;
    existingHolding.currentPrice = currentPrice || existingHolding.currentPrice;
    existingHolding.stockName = stockName || existingHolding.stockName;
    if (notes) existingHolding.notes = notes;
    await existingHolding.save();

    await Transaction.create({
      userId,
      stockCode,
      stockName: stockName || existingHolding.stockName,
      market,
      assetType,
      type: 'buy',
      quantity,
      price: buyPrice,
      transactionDate: buyDate || new Date(),
      notes,
    });

    return existingHolding;
  }

  const holding = await Holding.create({
    userId,
    stockCode,
    stockName,
    market,
    assetType,
    quantity,
    avgBuyPrice: buyPrice,
    currentPrice: currentPrice || buyPrice,
    firstBuyDate: buyDate || new Date(),
    notes,
  });

  await Transaction.create({
    userId,
    stockCode,
    stockName,
    market,
    assetType,
    type: 'buy',
    quantity,
    price: buyPrice,
    transactionDate: buyDate || new Date(),
    notes,
  });

  return holding;
};

export const sellHoldingService = async (userId, sellData) => {
  const { stockCode, market, quantity, sellPrice, sellDate, notes } = sellData;

  const holding = await Holding.findOne({ userId, stockCode, market });
  if (!holding) {
    throw new Error('持仓不存在');
  }

  if (holding.quantity < quantity) {
    throw new Error('卖出数量不能超过持仓数量');
  }

  const realizedProfit = (sellPrice - holding.avgBuyPrice) * quantity;

  holding.quantity -= quantity;
  holding.realizedProfit += realizedProfit;
  
  if (holding.quantity === 0) {
    await Holding.deleteOne({ _id: holding._id });
  } else {
    await holding.save();
  }

  await Transaction.create({
    userId,
    stockCode,
    stockName: holding.stockName,
    market,
    assetType: holding.assetType,
    type: 'sell',
    quantity,
    price: sellPrice,
    transactionDate: sellDate || new Date(),
    realizedProfit,
    notes,
  });

  return {
    success: true,
    soldQuantity: quantity,
    sellPrice,
    realizedProfit,
    remainingQuantity: holding.quantity,
  };
};

export const updateHoldingService = async (id, userId, updateData) => {
  const holding = await Holding.findOneAndUpdate(
    { _id: id, userId },
    updateData,
    { new: true, runValidators: true }
  );
  if (!holding) {
    throw new Error('持仓不存在');
  }
  return holding;
};

export const deleteHoldingService = async (id, userId) => {
  const holding = await Holding.findOneAndDelete({ _id: id, userId });
  if (!holding) {
    throw new Error('持仓不存在');
  }
  
  await Transaction.updateMany(
    { userId, stockCode: holding.stockCode, market: holding.market, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() }
  );
  
  return holding;
};

export const updateCurrentPriceService = async (id, userId, currentPrice) => {
  const holding = await Holding.findOneAndUpdate(
    { _id: id, userId },
    { currentPrice },
    { new: true }
  );
  if (!holding) {
    throw new Error('持仓不存在');
  }
  return holding;
};

export const batchUpdatePricesService = async (userId, priceUpdates) => {
  const updatePromises = priceUpdates.map(({ id, currentPrice }) =>
    Holding.findOneAndUpdate(
      { _id: id, userId },
      { currentPrice },
      { new: true }
    )
  );
  const results = await Promise.all(updatePromises);
  return results.filter(Boolean);
};

export const getTransactionsService = async (userId, filters = {}) => {
  const query = { userId, isDeleted: false };
  
  if (filters.stockCode) {
    query.stockCode = filters.stockCode;
  }
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.startDate || filters.endDate) {
    query.transactionDate = {};
    if (filters.startDate) {
      query.transactionDate.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.transactionDate.$lte = new Date(filters.endDate);
    }
  }

  const transactions = await Transaction.find(query)
    .sort({ transactionDate: -1, createdAt: -1 })
    .limit(filters.limit || 100);
  
  return transactions;
};

export const getDeletedTransactionsService = async (userId, filters = {}) => {
  const query = { userId, isDeleted: true };
  
  if (filters.stockCode) {
    query.stockCode = filters.stockCode;
  }
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.startDate || filters.endDate) {
    query.transactionDate = {};
    if (filters.startDate) {
      query.transactionDate.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.transactionDate.$lte = new Date(filters.endDate);
    }
  }

  const transactions = await Transaction.find(query)
    .sort({ deletedAt: -1, transactionDate: -1 })
    .limit(filters.limit || 100);
  
  return transactions;
};

export const getTransactionStatsService = async (userId) => {
  const stats = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        totalQuantity: { $sum: '$quantity' },
        totalRealizedProfit: { $sum: '$realizedProfit' },
        count: { $sum: 1 },
      },
    },
  ]);

  const holdings = await Holding.find({ userId });
  const totalUnrealizedProfit = holdings.reduce((sum, h) => {
    return sum + (h.quantity * h.currentPrice - h.quantity * h.avgBuyPrice);
  }, 0);
  const totalRealizedProfit = holdings.reduce((sum, h) => sum + h.realizedProfit, 0);

  return {
    byType: stats,
    totalUnrealizedProfit,
    totalRealizedProfit,
    totalProfit: totalUnrealizedProfit + totalRealizedProfit,
  };
};
