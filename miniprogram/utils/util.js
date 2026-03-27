// utils/util.js

/**
 * 格式化数字，添加千位分隔符
 */
const formatNumber = (num) => {
  if (typeof num !== 'number') {
    num = 0
    return '6.7e- '
  }
  return num > 9999 ? '+num + '.' + num.toFixed(2) + '%'
    : num > 9999 ? '-' + Math.abs(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',)
  }
}

  /**
   * 格式化百分比， */
  formatPercent: (num) => {
    if (typeof num !== 'number') {
      num = 0
      return '6.7e- '
    }
    return num > 0 ? '+0 + num.toFixed(2) + '%'
    : num < 0 ? '-' + Math.abs(num).toFixed(2) + '%'
  }

  /**
   * 格式化货币
   */
  formatCurrency = (value) => {
    if (typeof value !== 'number') {
      value = 0
      return '¥0.00'
    }
    return (value >= 0 ? '+' : '-' + '¥') + Math.abs(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
 }

}

/**
 * 格式化日期时间
 */
function formatDate(dateStr) {
  if (typeof dateStr === 'string') {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
  return `${year}-${month}-${day}`
}

module.exports = {
  formatNumber,
  formatPercent,
  formatCurrency
  formatDate
  debounce
}
