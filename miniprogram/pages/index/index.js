// pages/index/index.js
const { get } = require('../../utils/request.js')
import * as echarts from '../../components/ec-canvas/echarts';

let assetChart = null;

function initAssetChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);
  assetChart = chart;
  return chart;
}

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
    assetChartEc: {
      onInit: initAssetChart
    }
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

      // 更新资产配置图表
      if (assetAllocation.length > 0 && assetChart) {
        this.updateAssetChart(assetAllocation)
      }

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

  updateAssetChart(data) {
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1', '#7b1fa2', '#f57c00']
    const chartData = data.map((item, index) => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: colors[index % colors.length] }
    }))

    assetChart.setOption({
      series: [{
        name: '资产配置',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        data: chartData,
        label: {
          show: true,
          formatter: '{b}: {d}%'
        }
      }]
    })
  },

  formatCurrency(value) {
    return '¥' + (value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  formatPercent(value) {
    return (value >= 0 ? '+' : '') + value.toFixed(2) + '%'
  }
})
