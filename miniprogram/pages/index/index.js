const { get } = require('../../utils/request.js')

let assetChart = null

Page({
  data: {
    holdings: [],
    assetAllocation: [],
    topGainers: [],
    topLosers: [],
    loading: true,
    updating: false,
    error: '',
    totalMarketValue: '¥0.00',
    totalProfitLoss: '¥0.00',
    totalProfitLossRate: '+0.00%',
    profitCount: 0,
    lossCount: 0,
    showChart: false
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    if (getApp().globalData.token) {
      this.fetchData()
    }
  },

  checkLogin() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.fetchData()
  },

  async fetchData() {
    try {
      this.setData({ loading: true, error: '' })
      
      const [holdingsRes, allocationRes, performersRes] = await Promise.all([
        get('/holdings'),
        get('/analytics/asset-allocation'),
        get('/analytics/top-performers', { limit: 5 })
      ])

      const holdings = holdingsRes.data || []
      const assetAllocation = allocationRes.data || []
      const { topGainers = [], topLosers = [] } = performersRes.data || {}

      // 计算统计数据
      const totalMarketValue = holdings.reduce((sum, h) => sum + (h.marketValue || 0), 0)
      const totalCostBasis = holdings.reduce((sum, h) => sum + ((h.quantity || 0) * (h.avgBuyPrice || 0)), 0)
      const totalProfitLoss = totalMarketValue - totalCostBasis
      const totalProfitLossRate = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0
      const profitCount = holdings.filter(h => h.profitLoss > 0).length
      const lossCount = holdings.filter(h => h.profitLoss < 0).length

      this.setData({
        holdings,
        assetAllocation,
        topGainers,
        topLosers,
        totalMarketValue: this.formatCurrency(totalMarketValue),
        totalProfitLoss: this.formatCurrency(totalProfitLoss),
        totalProfitLossRate: this.formatPercent(totalProfitLossRate),
        profitCount,
        lossCount,
        loading: false
      })

    } catch (err) {
      this.setData({ 
        error: '获取数据失败',
        loading: false 
      })
    }
  },

  async handleUpdatePrices() {
    try {
      this.setData({ updating: true })
      await get('/stocks/update-holdings')
      await this.fetchData()
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

  formatCurrency(value) {
    const prefix = value >= 0 ? '' : '-'
    return prefix + '¥' + Math.abs(value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  formatPercent(value) {
    return (value >= 0 ? '+' : '') + (value || 0).toFixed(2) + '%'
  },

  onPullDownRefresh() {
    this.fetchData().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
