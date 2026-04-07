/**
 * marketData.service 直接测试（绕过 HTTP/鉴权）
 * 用法: node test/marketData.test.js
 */
import dotenv from 'dotenv';
dotenv.config();

import {
  identifyCodeType,
  fetchOtcFundQuote,
  fetchFundQuote,
  fetchStockQuote,
  searchStocksService,
  getHistoryClosePriceService,
} from '../src/services/marketData.service.js';

let passed = 0;
let failed = 0;

const assert = (name, condition, detail = '') => {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name} ${detail}`);
    failed++;
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log('\n=== 测试 1: identifyCodeType 基金 004343 ===');
  try {
    const info = await identifyCodeType('004343');
    assert('识别成功', !!info, JSON.stringify(info));
    if (info) {
      assert('type=fund', info.type === 'fund', `type=${info.type}`);
      assert('name=南方创业板ETF联接C', info.name === '南方创业板ETF联接C', `name=${info.name}`);
    }
  } catch (e) {
    assert('identifyCodeType 004343', false, e.message);
  }

  await sleep(300);

  console.log('\n=== 测试 2: identifyCodeType 股票 600519 ===');
  try {
    const info = await identifyCodeType('600519');
    assert('识别成功', !!info, JSON.stringify(info));
    if (info) {
      assert('type=stock', info.type === 'stock', `type=${info.type}`);
      assert('market=sh', info.market === 'sh', `market=${info.market}`);
      assert('name=贵州茅台', info.name === '贵州茅台', `name=${info.name}`);
    }
  } catch (e) {
    assert('identifyCodeType 600519', false, e.message);
  }

  await sleep(300);

  console.log('\n=== 测试 3: fetchOtcFundQuote 004343 ===');
  try {
    const quote = await fetchOtcFundQuote('004343');
    assert('获取估值成功', !!quote, JSON.stringify(quote));
    if (quote) {
      assert('market=fund', quote.market === 'fund', `market=${quote.market}`);
      assert('assetType=fund', quote.assetType === 'fund', `assetType=${quote.assetType}`);
      assert('有价格', quote.currentPrice > 0, `price=${quote.currentPrice}`);
      console.log(`    → ${quote.stockName} ¥${quote.currentPrice} (${quote.changePercent}%)`);
    }
  } catch (e) {
    assert('fetchOtcFundQuote', false, e.message);
  }

  await sleep(300);

  console.log('\n=== 测试 4: fetchStockQuote 600519 sh ===');
  try {
    const quote = await fetchStockQuote('600519', 'sh');
    assert('获取行情成功', !!quote, JSON.stringify(quote));
    if (quote) {
      assert('有价格', quote.currentPrice > 0, `price=${quote.currentPrice}`);
      console.log(`    → ${quote.stockName} ¥${quote.currentPrice} (${quote.changePercent}%)`);
    }
  } catch (e) {
    assert('fetchStockQuote 600519', false, e.message);
  }

  await sleep(300);

  console.log('\n=== 测试 5: searchStocksService 004343 (基金) ===');
  try {
    const results = await searchStocksService('004343');
    assert('搜索有结果', Array.isArray(results) && results.length > 0, `count=${results?.length}`);
    if (results && results.length > 0) {
      const item = results[0];
      assert('market=fund', item.market === 'fund', `market=${item.market}`);
      assert('有价格', item.currentPrice > 0, `price=${item.currentPrice}`);
      console.log(`    → ${item.stockCode} ${item.stockName} ¥${item.currentPrice}`);
    }
  } catch (e) {
    assert('searchStocksService 004343', false, e.message);
  }

  await sleep(300);

  console.log('\n=== 测试 6: searchStocksService 600519 (股票) ===');
  try {
    const results = await searchStocksService('600519');
    assert('搜索有结果', Array.isArray(results) && results.length > 0, `count=${results?.length}`);
    if (results && results.length > 0) {
      const item = results[0];
      assert('assetType=stock', item.assetType === 'stock', `assetType=${item.assetType}`);
      assert('有价格', item.currentPrice > 0, `price=${item.currentPrice}`);
      console.log(`    → ${item.stockCode} ${item.stockName} ¥${item.currentPrice}`);
    }
  } catch (e) {
    assert('searchStocksService 600519', false, e.message);
  }

  await sleep(300);

  console.log('\n=== 测试 7: searchStocksService 中文 茅台 ===');
  try {
    const results = await searchStocksService('茅台');
    assert('搜索有结果', Array.isArray(results) && results.length > 0, `count=${results?.length}`);
    if (results && results.length > 0) {
      const found = results.some(r => r.stockName?.includes('茅台'));
      assert('结果含茅台', found, results.map(r => r.stockName).join(', '));
      console.log(`    → ${results.map(r => `${r.stockName}(${r.stockCode})`).join(', ')}`);
    }
  } catch (e) {
    assert('searchStocksService 茅台', false, e.message);
  }

  await sleep(300);

  console.log('\n=== 测试 8: 基金历史净值 004343 2026-04-03 ===');
  try {
    const data = await getHistoryClosePriceService('004343', 'fund', '2026-04-03');
    assert('返回历史数据', !!data, JSON.stringify(data));
    if (data) {
      assert('有净值', data.closePrice > 0, `closePrice=${data.closePrice}`);
      console.log(`    → ${data.date} 净值 ¥${data.closePrice} (${data.changePercent}%)`);
    }
  } catch (e) {
    assert('基金历史净值', false, e.message);
  }

  await sleep(300);

  console.log('\n=== 测试 9: 股票历史价格 600519 sh 2026-04-03 ===');
  try {
    const data = await getHistoryClosePriceService('600519', 'sh', '2026-04-03');
    assert('返回历史数据', !!data, JSON.stringify(data));
    if (data) {
      assert('有收盘价', data.closePrice > 0, `closePrice=${data.closePrice}`);
      console.log(`    → ${data.date} 收盘 ¥${data.closePrice}`);
    }
  } catch (e) {
    assert('股票历史价格', false, e.message);
  }

  console.log(`\n📊 结果: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('测试异常:', e.message);
  process.exit(1);
});
