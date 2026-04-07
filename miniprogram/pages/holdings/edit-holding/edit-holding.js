const { get, put } = require('../../../utils/request.js')

Page({
  data: {
    id: '',
    stockCode: '',
    stockName: '',
    market: 'sh',
    marketIndex: 0,
    markets: [
      { value: 'sh', label: '上海' },
      { value: 'sz', label: '深圳' }
    ],
    assetType: 'stock',
    assetTypeIndex: 0,
    assetTypes: [
      { value: 'stock', label: '股票' },
      { value: 'fund', label: '基金' }
    ],
    quantity: '',
    avgBuyPrice: '',
    buyDate: '',
    today: '',
    loading: true,
    submitting: false,
    error: '',
    estimatedAmount: ''
  },

  onLoad(options) {
    if (!options.id) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const today = new Date()
    const todayStr = this.formatDate(today)
    this.setData({ 
      id: options.id,
      today: todayStr
    })
    
    this.fetchHolding(options.id)
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  async fetchHolding(id) {
    try {
      this.setData({ loading: true, error: '' })
      const res = await get(`/holdings/${id}`)
      
      if (res.success && res.data) {
        const holding = res.data
        const marketIndex = this.data.markets.findIndex(m => m.value === holding.market)
        const assetTypeIndex = this.data.assetTypes.findIndex(a => a.value === holding.assetType)
        
        this.setData({
          stockCode: holding.stockCode,
          stockName: holding.stockName,
          market: holding.market || 'sh',
          marketIndex: marketIndex >= 0 ? marketIndex : 0,
          assetType: holding.assetType || 'stock',
          assetTypeIndex: assetTypeIndex >= 0 ? assetTypeIndex : 0,
          quantity: String(holding.quantity),
          avgBuyPrice: String(holding.avgBuyPrice),
          buyDate: holding.buyDate ? holding.buyDate.split('T')[0] : this.data.today,
          loading: false
        })
        this.updateEstimatedAmount()
      } else {
        this.setData({ 
          error: '获取持仓信息失败',
          loading: false 
        })
      }
    } catch (err) {
      this.setData({
        error: err.message || '获取持仓信息失败',
        loading: false
      })
    }
  },

  onStockCodeInput(e) {
    this.setData({ stockCode: e.detail.value })
  },

  onStockNameInput(e) {
    this.setData({ stockName: e.detail.value })
  },

  onMarketChange(e) {
    const index = e.detail.value
    this.setData({
      marketIndex: index,
      market: this.data.markets[index].value
    })
  },

  onAssetTypeChange(e) {
    const index = e.detail.value
    this.setData({
      assetTypeIndex: index,
      assetType: this.data.assetTypes[index].value
    })
  },

  onQuantityInput(e) {
    this.setData({ quantity: e.detail.value }, () => {
      this.updateEstimatedAmount()
    })
  },

  onBuyPriceInput(e) {
    this.setData({ avgBuyPrice: e.detail.value }, () => {
      this.updateEstimatedAmount()
    })
  },

  onBuyDateChange(e) {
    this.setData({ buyDate: e.detail.value })
  },

  updateEstimatedAmount() {
    const { quantity, avgBuyPrice } = this.data
    if (quantity && avgBuyPrice) {
      const amount = (parseFloat(quantity) * parseFloat(avgBuyPrice)).toFixed(2)
      this.setData({ estimatedAmount: amount })
    } else {
      this.setData({ estimatedAmount: '' })
    }
  },

  validateForm() {
    const { stockCode, stockName, quantity, avgBuyPrice, buyDate } = this.data
    const errors = []

    if (!stockCode || stockCode.length !== 6) {
      errors.push('请输入6位股票代码')
    }

    if (!stockName) {
      errors.push('请输入股票名称')
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      errors.push('请输入有效的持仓数量')
    }

    if (!avgBuyPrice || parseFloat(avgBuyPrice) <= 0) {
      errors.push('请输入有效的买入价格')
    }

    if (!buyDate) {
      errors.push('请选择买入日期')
    }

    return errors
  },

  async handleSubmit() {
    const errors = this.validateForm()
    if (errors.length > 0) {
      this.setData({ error: errors.join('；') })
      return
    }

    try {
      this.setData({ submitting: true, error: '' })

      const { id, stockCode, stockName, market, assetType, quantity, avgBuyPrice, buyDate } = this.data
      
      const res = await put(`/holdings/${id}`, {
        stockCode,
        stockName,
        market,
        assetType,
        quantity: parseFloat(quantity),
        avgBuyPrice: parseFloat(avgBuyPrice),
        buyDate
      })

      if (res.success) {
        wx.showToast({ title: '修改成功', icon: 'success' })
        setTimeout(() => { wx.navigateBack() }, 1500)
      } else {
        this.setData({ error: res.message || '修改失败', submitting: false })
      }
    } catch (err) {
      this.setData({ error: err.message || '修改失败', submitting: false })
    }
  },

  handleCancel() {
    wx.navigateBack()
  }
})
