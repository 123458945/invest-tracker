// utils/util.js

/**
 * 格式化数字，添加千位分隔符
 */
const formatNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) {
    num = 0
  }
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化百分比
 */
const formatPercent = (num) => {
  if (typeof num !== 'number' || isNaN(num)) {
    num = 0
  }
  const prefix = num >= 0 ? '+' : ''
  return prefix + num.toFixed(2) + '%'
}

/**
 * 格式化货币
 */
const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    value = 0
  }
  const prefix = value >= 0 ? '¥' : '-¥'
  return prefix + Math.abs(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化日期时间
 */
function formatDate(dateStr, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  if (format === 'YYYY-MM-DD') {
    return \`\${year}-\${month}-\${day}\`
  } else if (format === 'MM-DD HH:mm') {
    return \`\${month}-\${day} \${hours}:\${minutes}\`
  } else if (format === 'HH:mm:ss') {
    return \`\${hours}:\${minutes}:\${seconds}\`
  }
  
  return \`\${year}-\${month}-\${day} \${hours}:\${minutes}:\${seconds}\`
}

/**
 * 格式化相对时间（如"3分钟前"、"昨天"）
 */
function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  
  const now = new Date()
  const diff = now - date
  const diffMinutes = Math.floor(diff / 60000)
  const diffHours = Math.floor(diff / 3600000)
  const diffDays = Math.floor(diff / 86400000)
  
  if (diffMinutes < 1) {
    return '刚刚'
  } else if (diffMinutes < 60) {
    return \`\${diffMinutes}分钟前\`
  } else if (diffHours < 24) {
    return \`\${diffHours}小时前\`
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays === 2) {
    return '前天'
  } else if (diffDays < 7) {
    return \`\${diffDays}天前\`
  } else if (diffDays < 30) {
    return \`\${Math.floor(diffDays / 7)}周前\`
  } else if (diffDays < 365) {
    return \`\${Math.floor(diffDays / 30)}个月前\`
  } else {
    return \`\${Math.floor(diffDays / 365)}年前\`
  }
}

/**
 * 格式化股票代码（自动补零和添加后缀）
 * @param {string} code 股票代码
 * @param {string} market 市场代码（sh/sz）
 */
function formatStockCode(code, market) {
  if (!code) return ''
  
  // 移除可能的空格和特殊字符
  code = String(code).trim()
  
  // 如果已经有后缀，直接返回
  if (code.includes('.SH') || code.includes('.SZ')) {
    return code
  }
  
  // 补零到6位
  while (code.length < 6) {
    code = '0' + code
  }
  
  // 自动判断市场
  if (!market) {
    if (code.startsWith('6')) {
      market = 'sh'
    } else if (code.startsWith('0') || code.startsWith('3')) {
      market = 'sz'
    } else {
      market = 'sh' // 默认上海
    }
  }
  
  return code + '.' + market.toUpperCase()
}

/**
 * 从股票代码中提取市场
 */
function getMarketFromCode(code) {
  if (!code) return 'sh'
  
  if (code.includes('.SH')) return 'sh'
  if (code.includes('.SZ')) return 'sz'
  
  code = code.trim()
  if (code.startsWith('6')) return 'sh'
  if (code.startsWith('0') || code.startsWith('3')) return 'sz'
  
  return 'sh'
}

/**
 * 从股票代码中提取纯代码（去掉后缀）
 */
function getPureCode(code) {
  if (!code) return ''
  return code.split('.')[0]
}

/**
 * 防抖函数
 */
function debounce(func, wait = 500) {
  let timeout
  return function(...args) {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * 节流函数
 */
function throttle(func, wait = 500) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

/**
 * 深拷贝
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  
  const clonedObj = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }
  return clonedObj
}

/**
 * 生成UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 检查是否为空对象
 */
function isEmptyObject(obj) {
  if (!obj) return true
  return Object.keys(obj).length === 0
}

/**
 * 对象数组按字段分组
 */
function groupBy(array, key) {
  if (!Array.isArray(array)) return {}
  return array.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {})
}

module.exports = {
  formatNumber,
  formatPercent,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatStockCode,
  getMarketFromCode,
  getPureCode,
  debounce,
  throttle,
  deepClone,
  generateUUID,
  isEmptyObject,
  groupBy
}
