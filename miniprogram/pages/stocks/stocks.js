const { get } = require('../../utils/request.js')
const { showToast } = require('../../utils/toast.js')
const { isLoggedIn } = require('../../utils/auth.js')

Page({
  data: {
    keyword: '',
    stocks: [],
    searching: false,
    error: ''
  },

  onLoad(options) {
    if (options.message) {
      this.setData({ success: options.message })
    }
  },

  onStockSelect(e) {
    const stock = e.detail
    if (!stock) return
    const code = stock.code || stock.stockCode
    const market = stock.market || 'sh'
    wx.navigateTo({
      url: `/pages/stocks/stock-detail/stock-detail?code=${code}&market=${market}`
    })
  },

  onPullDownRefresh() {
    this.setData({ stocks: [], keyword: '', error: '' })
    wx.stopPullDownRefresh()
  }
})
