// utils/navigate.js

/**
 * 跳转到股票详情页
 */
function navigateToStockDetail(code, market = 'sh') {
  wx.navigateTo({
    url: `/pages/stocks/stock-detail/stock-detail?code=${code}&market=${market || 'sh'}`
    })
  })
  
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
  function navigateToAddAlert() {
    wx.navigateTo({
      url: '/pages/alerts/add-alert/add-alert'
    })
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
  
  module.exports = {
    navigateToStockDetail,
    navigateToEditHolding
    navigateToSellHolding
    navigateToAddAlert
    navigateToTransactions
    navigateToSettings
  }
