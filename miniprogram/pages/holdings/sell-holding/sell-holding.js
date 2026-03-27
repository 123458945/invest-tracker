const { get, post } = require('../../../utils/request.js')

Page({
  data: {
    id: '',
    stockName: '',
    totalQuantity: 0,
    currentPrice: 0,
    avgBuyPrice: 0,
    sellQuantity: '',
    sellPrice: '',
    sellDate: '',
    today: '',
    loading: true,
    submitting: false,
    error: '',
    estimatedProfit: '',
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
      stockName: options.name || '',
      totalQuantity: parseFloat(options.quantity) || 0,
      currentPrice: parseFloat(options.price) || 0,
      sellPrice: options.price || '',
      sellDate: todayStr,
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
        this.setData({
          avgBuyPrice: holding.avgBuyPrice || 0,
          loading: false
        })
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

  onSellQuantityInput(e) {
    const value = e.detail.value
    this.setData({ sellQuantity: value }, () => {
      this.calculateProfit()
    })
  },

  onSellPriceInput(e) {
    this.setData({ sellPrice: e.detail.value }, () => {
      this.calculateProfit()
    })
  },

  onSellDateChange(e) {
    this.setData({ sellDate: e.detail.value })
  },

  sellAll() {
    this.setData({ 
      sellQuantity: String(this.data.totalQuantity) 
    }, () => {
      this.calculateProfit()
    })
  },

  calculateProfit() {
    const { sellQuantity, sellPrice, avgBuyPrice } = this.data
    if (sellQuantity && sellPrice) {
      const quantity = parseFloat(sellQuantity)
      const price = parseFloat(sellPrice)
      const amount = quantity * price
      const profit = (price - avgBuyPrice) * quantity
      
      this.setData({
        estimatedAmount: amount.toFixed(2),
        estimatedProfit: profit.toFixed(2)
      })
    } else {
      this.setData({
        estimatedAmount: '',
        estimatedProfit: ''
      })
    }
  },

  validateForm() {
    const { sellQuantity, sellPrice, sellDate, totalQuantity } = this.data
    const errors = []

    if (!sellQuantity || parseFloat(sellQuantity) <= 0) {
      errors.push('请输入有效的卖出数量')
    } else if (parseFloat(sellQuantity) > totalQuantity) {
      errors.push('卖出数量不能超过持仓数量')
    }

    if (!sellPrice || parseFloat(sellPrice) <= 0) {
      errors.push('请输入有效的卖出价格')
    }

    if (!sellDate) {
      errors.push('请选择卖出日期')
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

      const { id, sellQuantity, sellPrice, sellDate } = this.data
      
      const res = await post('/holdings/sell', {
        holdingId: id,
        quantity: parseFloat(sellQuantity),
        sellPrice: parseFloat(sellPrice),
        sellDate
      })

      if (res.success) {
        wx.showToast({ title: '卖出成功', icon: 'success' })
        setTimeout(() => { 
          wx.navigateBack()
        }, 1500)
      } else {
        this.setData({ error: res.message || '卖出失败', submitting: false })
      }
    } catch (err) {
      this.setData({ error: err.message || '卖出失败', submitting: false })
    }
  },

  handleCancel() {
    wx.navigateBack()
  }
})
