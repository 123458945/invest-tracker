const { get, post } = require('../../utils/request.js')
const { showToast } = require('../../utils/toast.js')
const { formatRelativeTime } = require('../../utils/util.js')
const { checkLogin, isLoggedIn } = require('../../utils/auth.js')

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
    flatCount: 0, // 平盘数量
    showChart: false,
    todayProfitLoss: '¥0.00',
    todayProfitLossRate: '+0.00%',
    quickActions: [
      { icon: '📝', text: '添加持仓', action: 'navigateToAddHolding' },
      { icon: '🔍', text: '搜索股票', action: 'navigateToStockSearch' }
    ]
  },

  onLoad() {
    if (!checkLogin()) {
      return
    }
    this.fetchData()
  },

  onShow() {
    if (isLoggedIn()) {
      this.fetchData()
    }
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
      
      // 计算今日盈亏（假设有当前价格数据）
      const todayProfitLoss = holdings.reduce((sum, h) => {
        // 计算今日盈亏（如果当日价格存在）
        const todayPrice = h.currentPrice || h.price
        const yesterdayPrice = h.previousPrice || h.avgBuyPrice
        const quantity = h.quantity || 0
        const todayValue = todayPrice * quantity
        const yesterdayValue = yesterdayPrice * quantity
        return todayValue - yesterdayValue
      }, 0)
        
        const todayProfitLoss = holdings.reduce((sum, h) => todayProfitLoss + (h.profitLoss || 0), 0)
      const todayProfitLossRate = totalCostBasis > 0 ? (todayProfitLoss / totalCostBasis) * 100 : 0
      
      const profitCount = holdings.filter(h => h.profitLoss > 0).length
      const lossCount = holdings.filter(h => h.profitLoss < 0).length
      const flatCount = holdings.length - profitCount - lossCount

      
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
        flatCount,
        todayProfitLoss: this.formatCurrency(todayProfitLoss),
        todayProfitLossRate: this.formatPercent(todayProfitLossRate),
        showChart: assetAllocation.length > 0,
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
      showToast('价格更新成功')
    } catch (err) {
      showToast('更新失败')
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

  navigateToAddHolding() {
    wx.navigateTo({ url: '/pages/holdings/add-holding/add-holding' })
  },

  navigateToStockSearch() {
    wx.navigateTo({ url: '/pages/stocks/stocks' })
  },

  onPullDownRefresh() {
    this.fetchData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onShareAppMessage() {
    return {
      title: 'Invest追踪器',
      path: '/pages/index/index',
      imageUrl: '/assets/share-image.png'
    }
  }
})
