// utils/navigate.js

/**
 * 跳转到股票详情页
 */
function navigateToStockDetail(code, market = 'sh') {
  wx.navigateTo({
    url: `/pages/stocks/stock-detail/stock-detail?code=${code}&market=${market || 'sh'}`
  })
}

/**
 * 跳转到编辑持仓页
 */
function navigateToEditHolding(id) {
  wx.navigateTo({
    url: `/pages/holdings/edit-holding/edit-holding?id=${id}`
  })
}

/**
 * 跳转到卖出持仓页
 */
function navigateToSellHolding(id, stockName, quantity, price) {
  wx.navigateTo({
    url: `/pages/holdings/sell-holding/sell-holding?id=${id}&name=${encodeURIComponent(stockName)}&quantity=${encodeURIComponent(quantity)}&price=${encodeURIComponent(price)}`
  })
}

/**
 * 跳转到添加提醒页
 */
function navigateToAddAlert(stockCode, stockName) {
  let url = '/pages/alerts/add-alert/add-alert'
  if (stockCode && stockName) {
    url += `?code=${stockCode}&name=${encodeURIComponent(stockName)}`
  }
  wx.navigateTo({ url })
}

/**
 * 跳转到交易记录页
 */
function navigateToTransactions() {
  wx.navigateTo({
    url: '/pages/transactions/transactions'
  })
}

/**
 * 跳转到设置页
 */
function navigateToSettings() {
  wx.navigateTo({
    url: '/pages/settings/settings'
  })
}

/**
 * 跳转到添加持仓页
 */
function navigateToAddHolding() {
  wx.navigateTo({
    url: '/pages/holdings/add-holding/add-holding'
  })
}

/**
 * 返回上一页
 */
function navigateBack(delta = 1) {
  wx.navigateBack({
    delta: delta
  })
}

/**
 * 切换到 TabBar 页面
 */
function switchTab(url) {
  wx.switchTab({ url })
}

module.exports = {
  navigateToStockDetail,
  navigateToEditHolding,
  navigateToSellHolding,
  navigateToAddAlert,
  navigateToTransactions,
  navigateToSettings,
  navigateToAddHolding,
  navigateBack,
  switchTab
}
