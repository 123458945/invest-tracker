import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import { sendAlertEmail } from '../src/services/email.service.js';
import { createAlertService } from '../src/services/alerts.service.js';
import Alert from '../src/models/Alert.js';
import User from '../src/models/User.js';
import Setting from '../src/models/Setting.js';
import { calculateAndUpdateMA } from '../src/services/marketData.service.js';
import logger from '../src/utils/logger.js';

dotenv.config();

const SINA_API_BASE = 'https://hq.sinajs.cn/list=';
const SINA_HEADERS = {
  'Referer': 'https://finance.sina.com.cn/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

const fetchStockPrice = async (stockCode, market) => {
  const fullCode = `${market}${stockCode}`;
  const url = `${SINA_API_BASE}${fullCode}`;

  try {
    const response = await axios.get(url, { 
      timeout: 5000,
      headers: SINA_HEADERS,
    });
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

const TEST_EMAIL = '123458945@qq.com';
const TEST_USERNAME = 'test_ma_alert_user';
const TEST_PASSWORD = 'Test123456';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_tracker';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB连接成功');
  } catch (error) {
    logger.error('MongoDB连接失败:', error.message);
    process.exit(1);
  }
};

const createTestUser = async () => {
  try {
    let user = await User.findOne({ email: TEST_EMAIL });
    
    if (!user) {
      logger.info('创建测试用户...');
      const bcrypt = (await import('bcryptjs')).default;
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
      
      user = await User.create({
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        password: hashedPassword,
      });
      logger.info(`测试用户创建成功: ${user.email}`);
    } else {
      logger.info(`测试用户已存在: ${user.email}`);
    }
    
    return user;
  } catch (error) {
    logger.error('创建测试用户失败:', error.message);
    throw error;
  }
};

const setupEmailConfig = async (userId) => {
  try {
    logger.info('配置邮件服务...');
    
    const emailService = process.env.EMAIL_SERVICE || 'smtp.qq.com';
    const emailPort = process.env.EMAIL_PORT || 465;
    const emailUser = process.env.EMAIL_USER || TEST_EMAIL;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailPass) {
      logger.warn('警告: 未设置EMAIL_PASS环境变量，邮件可能无法发送');
      logger.warn('请在.env文件中设置EMAIL_PASS');
    }
    
    const settings = [
      { userId, category: 'email', key: 'email_service', value: emailService },
      { userId, category: 'email', key: 'email_port', value: emailPort.toString() },
      { userId, category: 'email', key: 'email_user', value: emailUser },
    ];
    
    if (emailPass) {
      settings.push({ userId, category: 'email', key: 'email_pass', value: emailPass });
    }
    
    await Setting.deleteMany({ userId, category: 'email' });
    await Setting.insertMany(settings);
    
    logger.info('邮件配置完成');
    return emailPass;
  } catch (error) {
    logger.error('配置邮件服务失败:', error.message);
    throw error;
  }
};

const cleanupOldAlerts = async (userId) => {
  try {
    const result = await Alert.deleteMany({ userId });
    logger.info(`清理了 ${result.deletedCount} 个旧提醒`);
  } catch (error) {
    logger.error('清理旧提醒失败:', error.message);
  }
};

const createMAAlert = async (userId) => {
  try {
    const testStocks = [
      { code: '600519', name: '贵州茅台', market: 'sh' },
      { code: '000858', name: '五粮液', market: 'sz' },
      { code: '600036', name: '招商银行', market: 'sh' },
    ];
    
    const selectedStock = testStocks[0];
    
    logger.info(`创建MA均线提醒: ${selectedStock.name}(${selectedStock.code})`);
    
    const alert = await createAlertService(userId, {
      stockCode: selectedStock.code,
      stockName: selectedStock.name,
      market: selectedStock.market,
      alertType: 'ma5_above',
      targetValue: 0,
      notes: 'MA5均线提醒测试 - 自动生成的测试提醒',
    });
    
    logger.info(`提醒创建成功，ID: ${alert._id}`);
    return alert;
  } catch (error) {
    logger.error('创建提醒失败:', error.message);
    throw error;
  }
};

const testMAAlert = async (alert, userId, emailConfigured) => {
  try {
    logger.info('='.repeat(50));
    logger.info('开始测试MA均线提醒功能');
    logger.info('='.repeat(50));
    
    const { stockCode, stockName, market } = alert;
    
    logger.info(`步骤1: 获取股票 ${stockName}(${stockCode}) 的当前价格...`);
    const priceData = await fetchStockPrice(stockCode, market);
    
    if (!priceData) {
      logger.error('无法获取股票价格数据');
      return false;
    }
    
    logger.info(`当前价格: ${priceData.currentPrice}, 涨跌幅: ${priceData.changePercent}%`);
    
    logger.info(`步骤2: 计算并更新均线数据...`);
    const maData = await calculateAndUpdateMA(stockCode, market);
    
    if (!maData) {
      logger.error('无法获取均线数据');
      return false;
    }
    
    logger.info(`MA5: ${maData.ma5?.toFixed(2)}`);
    logger.info(`MA10: ${maData.ma10?.toFixed(2)}`);
    logger.info(`MA20: ${maData.ma20?.toFixed(2)}`);
    logger.info(`MA60: ${maData.ma60?.toFixed(2)}`);
    logger.info(`前一日收盘价: ${maData.prevClose?.toFixed(2)}`);
    logger.info(`前一日MA5: ${maData.prevMa5?.toFixed(2)}`);
    
    logger.info(`步骤3: 检查MA提醒条件...`);
    const maType = alert.alertType.split('_')[0].toUpperCase();
    const direction = alert.alertType.split('_')[1];
    const currentMA = maData[maType.toLowerCase()];
    const prevMA = maData[`prev${maType}`];
    const prevPrice = maData.prevClose;
    const currentPrice = priceData.currentPrice;
    
    logger.info(`检查条件: ${direction === 'above' ? '价格上穿' : '价格下破'} ${maType}`);
    logger.info(`当前价格: ${currentPrice}, 当前${maType}: ${currentMA?.toFixed(2)}`);
    logger.info(`前一日价格: ${prevPrice}, 前一日${maType}: ${prevMA?.toFixed(2)}`);
    
    let triggered = false;
    
    if (direction === 'above') {
      triggered = currentPrice >= currentMA && prevPrice < prevMA;
      logger.info(`条件判断: ${currentPrice} >= ${currentMA?.toFixed(2)} && ${prevPrice} < ${prevMA?.toFixed(2)} = ${triggered}`);
    } else {
      triggered = currentPrice <= currentMA && prevPrice > prevMA;
      logger.info(`条件判断: ${currentPrice} <= ${currentMA?.toFixed(2)} && ${prevPrice} > ${prevMA?.toFixed(2)} = ${triggered}`);
    }
    
    if (triggered) {
      logger.info(`✓ MA提醒条件已触发!`);
    } else {
      logger.info(`✗ MA提醒条件未触发 (这是正常的，需要等待价格穿越均线)`);
    }
    
    logger.info(`步骤4: ${emailConfigured ? '发送' : '模拟'}提醒邮件...`);
    
    const alertData = {
      stockName: alert.stockName,
      stockCode: alert.stockCode,
      alertType: alert.alertType,
      targetValue: maData[maType.toLowerCase()] || 0,
      currentPrice: priceData.currentPrice,
    };
    
    if (emailConfigured) {
      const emailResult = await sendAlertEmail(userId, TEST_EMAIL, alertData);
      
      if (emailResult.success) {
        logger.info(`✓ 测试邮件已成功发送到: ${TEST_EMAIL}`);
        logger.info(`请检查您的邮箱收件箱(可能在垃圾邮件文件夹中)`);
      } else {
        logger.error(`✗ 邮件发送失败: ${emailResult.message}`);
      }
    } else {
      logger.info(`邮件配置不完整，模拟邮件发送:`);
      logger.info(`收件人: ${TEST_EMAIL}`);
      logger.info(`邮件主题: [InvestTracker] ${alert.stockName}(${alert.stockCode}) 价格提醒`);
      logger.info(`提醒类型: 价格上穿MA5`);
      logger.info(`目标值: ${alertData.targetValue.toFixed(2)}`);
      logger.info(`当前价格: ${alertData.currentPrice.toFixed(2)}`);
    }
    
    logger.info('='.repeat(50));
    logger.info('MA均线提醒测试完成');
    logger.info('='.repeat(50));
    
    return triggered;
  } catch (error) {
    logger.error('测试失败:', error.message);
    throw error;
  }
};

const runTest = async () => {
  try {
    logger.info('开始执行MA均线提醒测试用例...');
    
    await connectDB();
    
    const user = await createTestUser();
    const emailConfigured = await setupEmailConfig(user._id);
    
    await cleanupOldAlerts(user._id);
    
    const alert = await createMAAlert(user._id);
    
    await testMAAlert(alert, user._id, !!emailConfigured);
    
    logger.info('测试用例执行完毕');
    
    process.exit(0);
  } catch (error) {
    logger.error('测试执行失败:', error);
    process.exit(1);
  }
};

runTest();
