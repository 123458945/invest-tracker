import Alert from '../models/Alert.js';
import { fetchStockQuote, fetchFundQuote } from './marketData.service.js';
import { calculateAndUpdateMA } from './marketData.service.js';

const checkPriceAlertTrigger = (alertType, currentPrice, changePercent, targetValue) => {
  switch (alertType) {
    case 'price_above':
      return currentPrice >= targetValue;
    case 'price_below':
      return currentPrice <= targetValue;
    case 'change_above':
      return changePercent >= targetValue;
    case 'change_below':
      return changePercent <= -targetValue;
    default:
      return false;
  }
};

const checkMAAlertTrigger = async (alert, currentPrice) => {
  const maType = alert.alertType.split('_')[0].toUpperCase();
  const direction = alert.alertType.split('_')[1];
  const maKey = maType.toLowerCase();
  
  try {
    const maData = await calculateAndUpdateMA(alert.stockCode, alert.market);
    
    if (!maData) {
      return { triggered: false };
    }
    
    const currentMA = maData[maKey];
    const prevMA = maData[`prev${maType}`];
    const prevPrice = maData.prevClose;
    
    if (currentMA === null || prevMA === null || prevPrice === null) {
      return { triggered: false, maData };
    }
    
    let triggered = false;
    
    if (direction === 'above') {
      triggered = currentPrice >= currentMA && prevPrice < prevMA;
    } else {
      triggered = currentPrice <= currentMA && prevPrice > prevMA;
    }
    
    return { triggered, maData };
  } catch (error) {
    return { triggered: false };
  }
};

export const getAlertsService = async (userId) => {
  const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });
  
  const alertsUpdated = [];
  
  for (const alert of alerts) {
    try {
      let quote;
      
      if (alert.market === 'fund') {
        quote = await fetchFundQuote(alert.stockCode);
      } else {
        quote = await fetchStockQuote(alert.stockCode, alert.market);
      }
      
      if (quote) {
        await Alert.findByIdAndUpdate(alert._id, {
          currentPrice: quote.currentPrice,
          lastCheckedAt: new Date(),
        });
        alert.currentPrice = quote.currentPrice;
      }
      alertsUpdated.push(alert);
    } catch (error) {
      alertsUpdated.push(alert);
    }
  }
  
  return alertsUpdated;
};

export const getAlertByIdService = async (id, userId) => {
  const alert = await Alert.findOne({ _id: id, userId });
  if (!alert) {
    throw new Error('提醒不存在');
  }
  return alert;
};

export const createAlertService = async (userId, alertData) => {
  const { stockCode, market, alertType, targetValue, stockName } = alertData;

  let quote;
  if (market === 'fund') {
    quote = await fetchFundQuote(stockCode);
  } else {
    quote = await fetchStockQuote(stockCode, market);
  }

  let isTriggered = false;
  let currentPrice = 0;

  if (quote) {
    currentPrice = quote.currentPrice;

    if (alertType.includes('ma')) {
      const result = await checkMAAlertTrigger({ stockCode, market, alertType }, currentPrice);
      isTriggered = result.triggered;
    } else {
      isTriggered = checkPriceAlertTrigger(
        alertType,
        currentPrice,
        quote.changePercent,
        targetValue
      );
    }
  }

  const alert = await Alert.create({
    userId,
    ...alertData,
    currentPrice,
    isTriggered,
    triggeredAt: isTriggered ? new Date() : null,
    lastCheckedAt: new Date(),
  });

  // 如果创建时触发，立即发送邮件
  if (isTriggered) {
    try {
      const { sendAlertEmail } = await import('./email.service.js');

      // 获取用户邮箱
      const User = await import('../models/User.js').then(m => m.default);
      const user = await User.findById(userId);

      if (user?.email) {
        let emailTargetValue = targetValue;
        if (alertType.includes('ma') && quote) {
          const maType = alertType.split('_')[0].toLowerCase();
          // 需要获取MA数据来确定触发值
          const maData = await calculateAndUpdateMA(stockCode, market);
          emailTargetValue = maData?.[maType] || 0;
        }

        await sendAlertEmail(userId, user.email, {
          stockName,
          stockCode,
          alertType,
          targetValue: emailTargetValue,
          currentPrice,
        });
      }
    } catch (error) {
      console.error(`发送提醒邮件失败: ${error.message}`);
    }
  }

  return alert;
};

export const updateAlertService = async (id, userId, updateData) => {
  const alert = await Alert.findOneAndUpdate(
    { _id: id, userId },
    updateData,
    { new: true, runValidators: true }
  );
  if (!alert) {
    throw new Error('提醒不存在');
  }
  return alert;
};

export const deleteAlertService = async (id, userId) => {
  const alert = await Alert.findOneAndDelete({ _id: id, userId });
  if (!alert) {
    throw new Error('提醒不存在');
  }
  return alert;
};

export const resetAlertService = async (id, userId) => {
  const alert = await Alert.findOneAndUpdate(
    { _id: id, userId },
    { isTriggered: false, triggeredAt: null },
    { new: true }
  );
  if (!alert) {
    throw new Error('提醒不存在');
  }
  return alert;
};

export const getActiveAlertsService = async () => {
  const alerts = await Alert.find({ isActive: true, isTriggered: false })
    .populate('userId', 'email username');
  return alerts;
};

export const triggerAlertService = async (id, currentPrice) => {
  const alert = await Alert.findByIdAndUpdate(
    id,
    {
      isTriggered: true,
      triggeredAt: new Date(),
      currentPrice,
      lastCheckedAt: new Date(),
    },
    { new: true }
  );
  return alert;
};

export const updateLastCheckedService = async (id, currentPrice) => {
  await Alert.findByIdAndUpdate(id, {
    lastCheckedAt: new Date(),
    currentPrice,
  });
};
