const { get, post } = require('../../utils/request.js')
const { showToast } = require('../../utils/toast.js')
const { isLoggedIn, withLogin } = require('../../utils/auth.js')

Page(withLogin({
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
    flatCount: 0,
    todayProfitLoss: '¥0.00',
    todayProfitLossRate: '+0.00%',
    chartInstance: null
  },

  onLoad() {
    this.fetchData()
  },

  onShow() {
    if (isLoggedIn()) {
      this.fetchData()
    }
  },

  onChartInit(e) {
    this.setData({ chartInstance: e.detail })
    this.drawAllocationChart()
  },

  drawAllocationChart() {
    const { chartInstance, assetAllocation } = this.data
    if (!chartInstance || !assetAllocation || assetAllocation.length === 0) return

    const option = {
      series: [{
        type: 'pie',
        data: assetAllocation.map(item => ({
          name: item.name,
          value: item.value || item.marketValue || 0,
          itemStyle: item.color ? { color: item.color } : {}
        }))
      }],
      color: ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1']
    }

    chartInstance.setOption && chartInstance.setOption(option)
    // 兼容 ec-canvas 组件
    if (chartInstance.canvas && chartInstance.ctx) {
      const { ctx, width, height } = { ctx: chartInstance.ctx, width: chartInstance.width, height: chartInstance.height }
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      const data = assetAllocation
      const colorList = option.color
      const total = data.reduce((sum, item) => sum + (item.value || item.marketValue || 0), 0)
      if (total === 0) return

      const centerX = width * 0.3
      const centerY = height / 2
      const radius = Math.min(width * 0.25, height / 2) - 16
      const innerRadius = radius * 0.4
      let currentAngle = -Math.PI / 2

      data.forEach((item, index) => {
        const value = item.value || item.marketValue || 0
        const angle = (value / total) * Math.PI * 2
        if (angle <= 0) return

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle)
        ctx.arc(centerX, centerY, innerRadius, currentAngle + angle, currentAngle, true)
        ctx.closePath()
        ctx.fillStyle = item.color || colorList[index % colorList.length]
        ctx.fill()
        currentAngle += angle
      })

      // 中心文字
      ctx.fillStyle = '#333'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('资产配置', centerX, centerY)

      // 图例
      const legendX = width * 0.6
      let legendY = Math.max(16, centerY - data.length * 16)
      ctx.textAlign = 'left'

      data.forEach((item, index) => {
        const color = item.color || colorList[index % colorList.length]
        ctx.fillStyle = color
        ctx.fillRect(legendX, legendY, 8, 8)

        ctx.fillStyle = '#333'
        ctx.font = '10px sans-serif'
        const name = item.name
        ctx.fillText(name, legendX + 14, legendY + 7)

        const pct = ((value / total) * 100).toFixed(1) + '%'
        ctx.fillStyle = '#999'
        ctx.fillText(pct, legendX + 14 + ctx.measureText(name).width + 4, legendY + 7)

        legendY += 20
      })
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

      const totalMarketValue = holdings.reduce((sum, h) => sum + (h.marketValue || 0), 0)
      const totalCostBasis = holdings.reduce((sum, h) => sum + ((h.quantity || 0) * (h.avgBuyPrice || 0)), 0)
      const totalProfitLoss = totalMarketValue - totalCostBasis
      const totalProfitLossRate = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0

      const todayProfitLoss = holdings.reduce((sum, h) => sum + (h.profitLoss || 0), 0)
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
        loading: false
      })

      this.drawAllocationChart()
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
    this.fetchData().catch(() => {}).then(() => {
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
}))
