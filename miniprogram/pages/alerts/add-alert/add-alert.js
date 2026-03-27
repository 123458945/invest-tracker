const { get, post } = require('../../../utils/request.js')

Page({
  data: {
    stockCode: '',
    stockName: '',
    market: 'sh',
    alertType: 'price_up',
    alertTypeIndex: 0,
    alertTypes: [
      { value: 'price_up', label: '价格突破上界' },
      { value: 'price_down', label: '价格突破下界' },
      { value: 'ma_golden_cross', label: '均线金叉' },
      { value: 'ma_dead_cross', label: '均线死叉' }
    ],
    targetPrice: '',
    maPeriod1: '5',
    maPeriod2: '10',
    notifyMethods: ['app', 'email'],
    submitting: false,
    error: '',
    searching: false
  },

  onStockCodeInput(e) {
    const value = e.detail.value.replace(/\D/g, '').slice(0, 6)
    this.setData({ 
      stockCode: value,
      stockName: '',
      error: ''
    }, () => {
      if (value.length === 6) {
        this.searchStock(value)
      }
    })
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
          market: stock.market || 'sh',
          searching: false
        })
      } else {
        this.setData({ 
          searching: false,
          error: '未找到该股票'
        })
      }
    } catch (err) {
      this.setData({ 
        searching: false,
        error: err.message || '搜索失败'
      })
    }
  },

  onAlertTypeChange(e) {
    const index = e.detail.value
    this.setData({
      alertTypeIndex: index,
      alertType: this.data.alertTypes[index].value
    })
  },

  onTargetPriceInput(e) {
    this.setData({ targetPrice: e.detail.value })
  },

  onMAPeriod1Input(e) {
    this.setData({ maPeriod1: e.detail.value })
  },

  onMAPeriod2Input(e) {
    this.setData({ maPeriod2: e.detail.value })
  },

  onNotifyMethodChange(e) {
    const values = e.detail.value
    this.setData({ notifyMethods: values })
  },

  validateForm() {
    const { stockCode, stockName, alertType, targetPrice, maPeriod1, maPeriod2 } = this.data
    const errors = []

    if (!stockCode || stockCode.length !== 6) {
      errors.push('请输入6位股票代码')
    }

    if (!stockName) {
      errors.push('请搜索并选择股票')
    }

    if (alertType === 'price_up' || alertType === 'price_down') {
      if (!targetPrice || parseFloat(targetPrice) <= 0) {
        errors.push('请输入有效的目标价格')
      }
    } else {
      if (!maPeriod1 || !maPeriod2) {
        errors.push('请设置均线周期')
      }
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

      const { stockCode, stockName, market, alertType, targetPrice, maPeriod1, maPeriod2, notifyMethods } = this.data
      
      const alertData = {
        stockCode,
        stockName,
        market,
        type: alertType,
        notifyMethods
      }

      if (alertType === 'price_up' || alertType === 'price_down') {
        alertData.targetPrice = parseFloat(targetPrice)
      } else {
        alertData.maConfig = {
          period1: parseInt(maPeriod1),
          period2: parseInt(maPeriod2)
        }
      }

      const res = await post('/alerts', alertData)

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
