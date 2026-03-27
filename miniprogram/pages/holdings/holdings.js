// pages/holdings/holdings.js
const { get, post, put, del } = require('../../utils/request.js')

Page({
  data: {
    holdings: [],
    loading: true,
    updating: false,
    error: '',
    totalMarketValue: '¥0.00',
    totalUnrealizedProfit: '¥0.00',
    totalRealizedProfit: '¥0.00',
    totalProfit: '¥0.00'
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    if (getApp().globalData.token) {
      this.fetchHoldings()
    }
  },

  checkLogin() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.fetchHoldings()
  },

  async fetchHoldings() {
    try {
      this.setData({ loading: true, error: '' })
      const res = await get('/holdings')
      
      const holdings = res.data || []
      const totalMarketValue = holdings.reduce((sum, h) => sum + (h.marketValue || 0), 0)
      const totalUnrealizedProfit = holdings.reduce((sum, h) => sum + (h.unrealizedProfit || 0), 0)
      const totalRealizedProfit = holdings.reduce((sum, h) => sum + (h.realizedProfit || 0), 0)
      const totalProfit = totalUnrealizedProfit + totalRealizedProfit

      this.setData({
        holdings,
        totalMarketValue: this.formatCurrency(totalMarketValue),
        totalUnrealizedProfit: this.formatCurrency(totalUnrealizedProfit),
        totalRealizedProfit: this.formatCurrency(totalRealizedProfit),
        totalProfit: this.formatCurrency(totalProfit),
        loading: false
      })
    } catch (err) {
      this.setData({
        error: '获取持仓列表失败',
        loading: false
      })
    }
  },

  async handleUpdatePrices() {
    try {
      this.setData({ updating: true })
      await get('/stocks/update-holdings')
      await this.fetchHoldings()
      wx.showToast({
        title: '价格更新成功',
        icon: 'success'
      })
    } catch (err) {
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    } finally {
      this.setData({ updating: false })
    }
  },

  openAddDialog() {
    wx.navigateTo({ url: '/pages/holdings/add-holding' })
  },

  handleEdit(e) {
    const holding = e.currentTarget.dataset.holding
    wx.navigateTo({
      url: `/pages/holdings/edit-holding?id=${holding._id}`
    })
  },

  handleSell(e) {
    const holding = e.currentTarget.dataset.holding
    wx.navigateTo({
      url: `/pages/holdings/sell-holding?id=${holding._id}&name=${holding.stockName}&quantity=${holding.quantity}&price=${holding.currentPrice}`
    })
  },

  handleDelete(e) {
    const holding = e.currentTarget.dataset.holding
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${holding.stockName} 的持仓吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await del(`/holdings/${holding._id}`)
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            await this.fetchHoldings()
          } catch (err) {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  navigateToTransactions() {
    wx.showToast({
      title: '交易记录功能开发中',
      icon: 'none'
    })
  },

  formatCurrency(value) {
    const prefix = value >= 0 ? '+' : ''
    return prefix + '¥' + Math.abs(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
})
