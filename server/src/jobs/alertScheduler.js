import cron from 'node-cron';
import axios from 'axios';
import Alert from '../models/Alert.js';
import { sendAlertEmail } from '../services/email.service.js';
import { calculateAndUpdateMA } from '../services/marketData.service.js';
import logger from '../utils/logger.js';

const SINA_API_BASE = 'https://hq.sinajs.cn/list=';

const MA_ALERT_TYPES = ['ma5_above', 'ma5_below', 'ma10_above', 'ma10_below', 'ma20_above', 'ma20_below', 'ma60_above', 'ma60_below'];

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

const fetchStockPrice = async (stockCode, market) => {
  const fullCode = `${market}${stockCode}`;
  const url = `${SINA_API_BASE}${fullCode}`;

  try {
    const response = await axios.get(url, { timeout: 5000 });
    const data = response.data;

    const match = data.match(/var hq_str_(.+?)="(.+?)";/);
    if (!match) return null;

    const values = match[2].split(',');
    const currentPrice = parseFloat(values[3]) || 0;
    const changePercent = parseFloat(values[9]) || 0;

    return { currentPrice, changePercent };
  } catch (error) {
    logger.error(`获取股票价格失败: ${stockCode} - ${error.message}`);
    return null;
  }
};

const checkMAAlert = async (alert, currentPrice, maData) => {
  const maType = alert.alertType.split('_')[0].toUpperCase();
  const direction = alert.alertType.split('_')[1];
  const maKey = maType.toLowerCase();
  
  const currentMA = maData[maKey];
  const prevMA = maData[`prev${maType}`];
  const prevPrice = maData.prevClose;
  
  if (currentMA === null || prevMA === null || prevPrice === null) {
    logger.debug(`均线数据不完整: ${alert.stockCode}`);
    return { triggered: false };
  }
  
  let triggered = false;
  
  if (direction === 'above') {
    if (currentPrice >= currentMA && prevPrice < prevMA) {
      triggered = true;
      logger.info(`均线穿越触发: ${alert.stockName} 价格 ${currentPrice} 上穿 ${maType}(${currentMA.toFixed(2)})`);
    }
  } else {
    if (currentPrice <= currentMA && prevPrice > prevMA) {
      triggered = true;
      logger.info(`均线穿越触发: ${alert.stockName} 价格 ${currentPrice} 下破 ${maType}(${currentMA.toFixed(2)})`);
    }
  }
  
  return { triggered };
};

const checkAlert = (alert, currentPrice, changePercent) => {
  switch (alert.alertType) {
    case 'price_above':
      return currentPrice >= alert.targetValue;
    case 'price_below':
      return currentPrice <= alert.targetValue;
    case 'change_above':
      return changePercent >= alert.targetValue;
    case 'change_below':
      return changePercent <= -alert.targetValue;
    default:
      return false;
  }
};

const checkAlerts = async () => {
  if (!isTradingTime()) {
    logger.debug('非交易时间，仅更新价格，不检查触发');
    return;
  }

  try {
    const alerts = await Alert.find({ isActive: true, isTriggered: false })
      .populate('userId', 'email username');

    if (alerts.length === 0) return;

    logger.info(`交易时间，开始检查 ${alerts.length} 个价格提醒`);

    const maAlerts = alerts.filter(a => MA_ALERT_TYPES.includes(a.alertType));
    const priceAlerts = alerts.filter(a => !MA_ALERT_TYPES.includes(a.alertType));

    if (maAlerts.length > 0) {
      logger.info(`${maAlerts.length} 个均线提醒待检查`);
    }

    const stockPriceMap = new Map();
    
    const allAlerts = [...priceAlerts, ...maAlerts];
    const uniqueStocks = new Map();
    
    for (const alert of allAlerts) {
      const key = `${alert.market}-${alert.stockCode}`;
      if (!uniqueStocks.has(key)) {
        uniqueStocks.set(key, {
          stockCode: alert.stockCode,
          market: alert.market,
          hasMAAlert: false,
        });
      }
      
      if (MA_ALERT_TYPES.includes(alert.alertType)) {
        uniqueStocks.get(key).hasMAAlert = true;
      }
    }

    logger.info(`需要检查 ${uniqueStocks.size} 个不同股票，合并API调用`);

    for (const [key, stockInfo] of uniqueStocks) {
      const { stockCode, market, hasMAAlert } = stockInfo;
      
      const priceData = await fetchStockPrice(stockCode, market);
      
      if (!priceData) {
        logger.warn(`无法获取股票 ${stockCode} 的价格，跳过相关提醒`);
        continue;
      }
      
      const { currentPrice, changePercent } = priceData;
      stockPriceMap.set(key, { currentPrice, changePercent });
      
      let maData = null;
      if (hasMAAlert) {
        try {
          maData = await calculateAndUpdateMA(stockCode, market);
          logger.debug(`股票 ${stockCode} 的MA数据: MA5=${maData?.ma5?.toFixed(2)}, MA10=${maData?.ma10?.toFixed(2)}`);
        } catch (error) {
          logger.error(`获取股票 ${stockCode} 的均线数据失败: ${error.message}`);
        }
      }
      
      const stockAlerts = allAlerts.filter(a => 
        a.stockCode === stockCode && a.market === market
      );
      
      for (const alert of stockAlerts) {
        await Alert.findByIdAndUpdate(alert._id, {
          lastCheckedAt: new Date(),
          currentPrice,
        });

        let triggered = false;
        
        if (MA_ALERT_TYPES.includes(alert.alertType)) {
          if (maData) {
            const result = await checkMAAlert(alert, currentPrice, maData);
            triggered = result.triggered;
          }
        } else {
          triggered = checkAlert(alert, currentPrice, changePercent);
        }
        
        if (triggered) {
          logger.info(`触发提醒: ${alert.stockName} (${alert.stockCode}) - ${alert.alertType}`);

          await Alert.findByIdAndUpdate(alert._id, {
            isTriggered: true,
            triggeredAt: new Date(),
          });

          if (alert.userId?.email) {
            let targetValue = alert.targetValue;
            if (MA_ALERT_TYPES.includes(alert.alertType) && maData) {
              const maType = alert.alertType.split('_')[0].toLowerCase();
              targetValue = maData[maType] || 0;
            }

            await sendAlertEmail(alert.userId._id, alert.userId.email, {
              stockName: alert.stockName,
              stockCode: alert.stockCode,
              alertType: alert.alertType,
              targetValue,
              currentPrice,
            });
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    logger.error(`检查提醒失败: ${error.message}`);
  }
};

export const startAlertScheduler = () => {
  cron.schedule('*/5 * * * *', checkAlerts);
  logger.info('价格提醒定时任务已启动 (每5分钟检查一次)');
};

export const stopAlertScheduler = () => {
  cron.getTasks().forEach((task) => task.stop());
  logger.info('价格提醒定时任务已停止');
};
