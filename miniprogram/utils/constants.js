// utils/constants.js

/**
 * 市场类型
 */
const MARKET_TYPES = {
  SH: 'sh',  // 上海
  SZ: 'sz'   // 深圳
}

/**
 * 市场名称映射
 */
const MARKET_NAMES = {
  [MARKET_TYPES.SH]: '上海证券交易所',
  [MARKET_TYPES.SZ]: '深圳证券交易所'
}

/**
 * 资产类型
 */
const ASSET_TYPES = {
  STOCK: 'stock',           // 股票
  FUND: 'fund',             // 基金
  BOND: 'bond',             // 债券
  FUTURES: 'futures',       // 期货
  OPTIONS: 'options'        // 期权
}

/**
 * 资产类型名称
 */
const ASSET_TYPE_NAMES = {
  [ASSET_TYPES.STOCK]: '股票',
  [ASSET_TYPES.FUND]: '基金',
  [ASSET_TYPES.BOND]: '债券',
  [ASSET_TYPES.FUTURES]: '期货',
  [ASSET_TYPES.OPTIONS]: '期权'
}

/**
 * 提醒类型
 */
const ALERT_TYPES = {
  PRICE_ABOVE: 'price_above',       // 价格高于
  PRICE_BELOW: 'price_below',       // 价格低于
  MA5_CROSS_UP: 'ma5_cross_up',     // 5日均线上穿
  MA5_CROSS_DOWN: 'ma5_cross_down', // 5日均线下穿
  MA10_CROSS_UP: 'ma10_cross_up',   // 10日均线上穿
  MA10_CROSS_DOWN: 'ma10_cross_down', // 10日均线下穿
  MA20_CROSS_UP: 'ma20_cross_up',   // 20日均线上穿
  MA20_CROSS_DOWN: 'ma20_cross_down', // 20日均线下穿
  PROFIT_TARGET: 'profit_target',   // 盈利目标
  LOSS_LIMIT: 'loss_limit'          // 止损提醒
}

/**
 * 提醒类型名称
 */
const ALERT_TYPE_NAMES = {
  [ALERT_TYPES.PRICE_ABOVE]: '价格高于',
  [ALERT_TYPES.PRICE_BELOW]: '价格低于',
  [ALERT_TYPES.MA5_CROSS_UP]: '5日均线上穿',
  [ALERT_TYPES.MA5_CROSS_DOWN]: '5日均线下穿',
  [ALERT_TYPES.MA10_CROSS_UP]: '10日均线上穿',
  [ALERT_TYPES.MA10_CROSS_DOWN]: '10日均线下穿',
  [ALERT_TYPES.MA20_CROSS_UP]: '20日均线上穿',
  [ALERT_TYPES.MA20_CROSS_DOWN]: '20日均线下穿',
  [ALERT_TYPES.PROFIT_TARGET]: '盈利目标',
  [ALERT_TYPES.LOSS_LIMIT]: '止损提醒'
}

/**
 * 提醒状态
 */
const ALERT_STATUS = {
  ACTIVE: 'active',       // 监控中
  TRIGGERED: 'triggered', // 已触发
  PAUSED: 'paused'        // 已暂停
}

/**
 * 提醒状态名称
 */
const ALERT_STATUS_NAMES = {
  [ALERT_STATUS.ACTIVE]: '监控中',
  [ALERT_STATUS.TRIGGERED]: '已触发',
  [ALERT_STATUS.PAUSED]: '已暂停'
}

/**
 * 交易类型
 */
const TRANSACTION_TYPES = {
  BUY: 'buy',   // 买入
  SELL: 'sell'  // 卖出
}

/**
 * 交易类型名称
 */
const TRANSACTION_TYPE_NAMES = {
  [TRANSACTION_TYPES.BUY]: '买入',
  [TRANSACTION_TYPES.SELL]: '卖出'
}

/**
 * API 错误码映射
 */
const API_ERROR_CODES = {
  // 通用错误
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '没有权限访问',
  404: '请求的资源不存在',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂不可用',
  504: '网关超时',
  
  // 自定义错误码
  10001: '用户不存在',
  10002: '密码错误',
  10003: '用户已被禁用',
  10004: 'Token已过期',
  10005: 'Token无效',
  
  20001: '股票不存在',
  20002: '股票代码格式错误',
  20003: '无法获取股票数据',
  
  30001: '持仓不存在',
  30002: '持仓数量不足',
  30003: '持仓已全部卖出',
  
  40001: '提醒不存在',
  40002: '提醒已存在',
  40003: '提醒数量已达上限'
}

/**
 * 网络错误消息
 */
const NETWORK_ERRORS = {
  TIMEOUT: '请求超时，请检查网络',
  NO_NETWORK: '网络不可用，请检查网络设置',
  SERVER_ERROR: '服务器错误，请稍后重试',
  PARSE_ERROR: '数据解析错误'
}

/**
 * 分页配置
 */
const PAGINATION = {
  PAGE_SIZE: 20,         // 每页数据条数
  MAX_PAGE_SIZE: 100     // 最大每页数据条数
}

/**
 * 时间格式
 */
const DATE_FORMATS = {
  FULL: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  SHORT: 'MM-DD HH:mm'
}

/**
 * 本地存储键名
 */
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  SEARCH_HISTORY: 'searchHistory',
  WATCHLIST: 'watchlist',
  SETTINGS: 'settings'
}

/**
 * 默认设置
 */
const DEFAULT_SETTINGS = {
  enableNotification: true,
  enablePriceAlert: true,
  enableMAAlert: true,
  priceUpdateInterval: 60,  // 价格更新间隔（秒）
  theme: 'light'
}

/**
 * 颜色常量
 */
const COLORS = {
  SUCCESS: '#10b981',    // 绿色 - 盈利
  DANGER: '#ef4444',     // 红色 - 亏损
  WARNING: '#f59e0b',    // 橙色 - 警告
  PRIMARY: '#1976d2',    // 蓝色 - 主色
  SECONDARY: '#64748b',  // 灰色 - 次要
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY: '#f5f5f5',
  BORDER: '#e5e7eb'
}

/**
 * 均线周期
 */
const MA_PERIODS = [5, 10, 20, 60]

/**
 * K线周期
 */
const KLINE_PERIODS = {
  DAY: 'day',           // 日K
  WEEK: 'week',         // 周K
  MONTH: 'month'        // 月K
}

/**
 * 图表颜色
 */
const CHART_COLORS = [
  '#1976d2',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899'
]

/**
 * 快捷数量选项
 */
const QUICK_QUANTITIES = [100, 500, 1000, 5000, 10000]

/**
 * 最大搜索历史记录数
 */
const MAX_SEARCH_HISTORY = 20

module.exports = {
  MARKET_TYPES,
  MARKET_NAMES,
  ASSET_TYPES,
  ASSET_TYPE_NAMES,
  ALERT_TYPES,
  ALERT_TYPE_NAMES,
  ALERT_STATUS,
  ALERT_STATUS_NAMES,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_NAMES,
  API_ERROR_CODES,
  NETWORK_ERRORS,
  PAGINATION,
  DATE_FORMATS,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  COLORS,
  MA_PERIODS,
  KLINE_PERIODS,
  CHART_COLORS,
  QUICK_QUANTITIES,
  MAX_SEARCH_HISTORY
}
