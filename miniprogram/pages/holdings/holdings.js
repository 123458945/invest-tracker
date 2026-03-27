const { get, del } = require('../../utils/request.js')
const { showToast, showConfirm } = require('../../utils/toast.js')
const { groupBy } = require('../../utils/util.js')
const { checkLogin, isLoggedIn } = require('../../utils/auth.js')

Page({
  data: {
    holdings: [],
    groupedHoldings: [],
    loading: true,
    updating: false,
    error: '',
    totalMarketValue: '¥0.00',
    totalProfitLoss: '¥0.00',
    totalProfitLossRate: '+0.00%',
    summaryBar: false,
    showAddDialog: false
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
      
      const res = await get('/holdings')
      const holdings = res.data || []
      
      if (holdings.length === 0) {
        this.setData({
          holdings: [],
          groupedHoldings: [],
          totalMarketValue: '¥0.00',
          totalProfitLoss: '¥0.00',
          totalProfitLossRate: '+0.00%',
          summaryBar: false,
          loading: false
        })
        return
      }

      
      // 按市场分组
      const grouped = groupBy(holdings, 'market')
      
      // 计算每组的统计数据
      const groupedHoldings = Object.keys(grouped).map(market => {
        const items = grouped[market]
        const totalMarketValue = items.reduce((sum, item) => sum + (item.marketValue || 0), 0)
        const totalCostBasis = items.reduce((sum, item) => sum + (item.quantity * item.avgBuyPrice), 0)
        const totalProfitLoss = items.reduce((sum, item) => sum + (item.profitLoss || 0), 0)
        
        return {
          key: market,
          items,
          summary: {
            totalMarketValue: this.formatCurrency(totalMarketValue),
            totalProfitLoss: this.formatCurrency(totalProfitLoss),
            totalMarketLossRate: totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0
          }
        }
      })
      
      // 计算总计
      const totalMarketValue = holdings.reduce((sum, h) => sum + (h.marketValue || 0), 0)
      const totalCostBasis = holdings.reduce((sum, h) => sum + (h.quantity * h.avgBuyPrice), 0)
      const totalProfitLoss = totalMarketValue - totalCostBasis
      const totalProfitLossRate = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0
      
      this.setData({
        holdings,
        groupedHoldings,
        totalMarketValue: this.formatCurrency(totalMarketValue),
        totalProfitLoss: this.formatCurrency(totalProfitLoss),
        totalProfitLossRate: this.formatPercent(totalProfitLossRate),
        summaryBar: true,
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

  handleEdit(e) {
    const id = e.currentTarget.dataset.id
 wx.navigateTo({
      url: `/pages/holdings/edit-holding/edit-holding?id=${id}`
    })
  },

  handleSell(e) {
    const { id, name, quantity, price } = e.currentTarget.dataset
 wx.navigateTo({
      url: `/pages/holdings/sell-holding/sell-holding?id=${id}&name=${encodeURIComponent(name)}&quantity=${quantity}&price=${price}`
    })
  },

  async handleDelete(e) {
    const { id, name } = e.currentTarget.dataset
 const res = await showConfirm(`确定要删除 ${name} 吗？`)

    if (res) {
      try {
        await del(`/holdings/${id}`)
        showToast('删除成功')
        this.fetchData()
      } catch (err) {
        showToast('删除失败')
      }
    }
  },

  navigateToTransactions() {
    this.setData({ showAddDialog: false })
    wx.navigateTo({
      url: '/pages/transactions/transactions'
    })
  },

  openAddDialog() {
    this.setData({ showAddDialog: true })
  },

  closeAddDialog() {
    this.setData({ showAddDialog: false })
  },

  onConfirmAdd() {
    this.setData({ showAddDialog: false })
  },

  onCancelAdd() {
    this.setData({ showAddDialog: false })
  }
})
