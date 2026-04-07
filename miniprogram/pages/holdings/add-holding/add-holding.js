const { get, post } = require('../../../utils/request.js')

Page({
  data: {
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
    buyPrice: '',
    buyDate: '',
    today: '',
    stockInfo: null,
    searching: false,
    submitting: false,
    error: '',
    estimatedAmount: ''
  },

  onLoad() {
    const today = new Date()
    const todayStr = this.formatDate(today)
    this.setData({ 
      buyDate: todayStr,
      today: todayStr
    })
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  onStockCodeInput(e) {
    const value = e.detail.value.replace(/\D/g, '').slice(0, 6)
    this.setData({ 
      stockCode: value,
      stockInfo: null,
      error: ''
    }, () => {
      if (value.length === 6) {
        this.searchStock(value)
      }
    })
  },

  onStockNameInput(e) {
    this.setData({ stockName: e.detail.value })
  },

  async searchStock(code) {
    if (this.data.searching) return
    
    try {
      this.setData({ searching: true, error: '' })
      const res = await get('/stocks/search', { keyword: code })
      
      if (res.success && res.data && res.data.length > 0) {
        const stock = res.data[0]
        this.setData({
          stockName: stock.stockName || stock.name || '',
          stockInfo: {
            currentPrice: stock.currentPrice || stock.price || 0,
            stockName: stock.stockName || stock.name || ''
          },
          buyPrice: String(stock.currentPrice || stock.price || ''),
          searching: false
        })
        this.updateEstimatedAmount()
      } else {
        this.setData({ searching: false, stockInfo: null })
      }
    } catch (err) {
      this.setData({ searching: false, stockInfo: null })
    }
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
    this.setData({ buyPrice: e.detail.value }, () => {
      this.updateEstimatedAmount()
    })
  },

  onBuyDateChange(e) {
    this.setData({ buyDate: e.detail.value })
  },

  updateEstimatedAmount() {
    const { quantity, buyPrice } = this.data
    if (quantity && buyPrice) {
      const amount = (parseFloat(quantity) * parseFloat(buyPrice)).toFixed(2)
      this.setData({ estimatedAmount: amount })
    } else {
      this.setData({ estimatedAmount: '' })
    }
  },

  validateForm() {
    const { stockCode, stockName, quantity, buyPrice, buyDate } = this.data
    const errors = []

    if (!stockCode || stockCode.length !== 6) {
      errors.push('请输入6位股票代码')
    }

    if (!stockName) {
      errors.push('请输入股票名称')
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      errors.push('请输入有效的买入数量')
    }

    if (!buyPrice || parseFloat(buyPrice) <= 0) {
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

      const { stockCode, stockName, market, assetType, quantity, buyPrice, buyDate } = this.data
      
      const res = await post('/holdings', {
        stockCode,
        stockName,
        market,
        assetType,
        quantity: parseFloat(quantity),
        avgBuyPrice: parseFloat(buyPrice),
        buyDate
      })

      if (res.success) {
        wx.showToast({ title: '添加成功', icon: 'success' })
        setTimeout(() => { wx.navigateBack() }, 1500)
      } else {
        this.setData({ error: res.message || '添加失败', submitting: false })
      }
    } catch (err) {
      this.setData({ error: err.message || '添加失败', submitting: false })
    }
  },

  handleCancel() {
    wx.navigateBack()
  }
})
