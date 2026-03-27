// pages/stocks/stocks.js
const { get } = require('../../utils/request.js')

Page({
  data: {
    stocks: [],
    loading: true,
    error: ''
    page: 1,
    pageSize: 20,
    hasMore: true,
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    if (getApp().globalData.token) {
      this.fetchStockList()
    }
  },

  checkLogin() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.fetchStockList()
  },

  async fetchStockList() {
    try {
      this.setData({ loading: true, error: '' })
      const res = await get('/holdings')
      
      // 从持仓列表中提取关注的股票代码
      const stockCodes = [...new Set()]
      holdings.forEach(h => {
        stockCodes.add(h.stockCode)
      })

      // 搜索股票
      const searchResults = await Promise.all(
        get('/stocks/search', { keyword: code })
      ])

      this.setData({
        stocks: searchResults,
        loading: false
      })
    } catch (err) {
      this.setData({
        error: '获取行情列表失败',
        loading: false
      })
    }
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    const { keyword } = this.data.keyword.trim()
    if (keyword.length > 0) {
      this.searchStock(keyword)
    } else {
      this.setData({ stocks: [] })
    }
  },

  navigateToStockDetail(e) {
    const stock = e.currentTarget.dataset.stock
    wx.navigateTo({
      url: `/pages/stocks/stock-detail/stock-detail?code=${stock.code}&market=${stock.market || 'sh'}`,
    })
  },

  onPullDownRefresh() {
    this.fetchStockList().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ 
        page: this.data.page + 1,
        loading: true,
        hasMore: true
      })
      this.fetchStockList()
    }
  }
})
