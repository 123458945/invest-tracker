const { get, post } = require('../../../utils/request.js')
const { isLoggedIn, withLogin } = require('../../../utils/auth.js')

Page(withLogin({
  data: {
    stockCode: '',
    stockName: '',
    market: 'sh',
    alertType: 'price_above',
    alertTypeIndex: 0,
    alertTypes: [
      { value: 'price_above', label: '价格高于', category: 'price' },
      { value: 'price_below', label: '价格低于', category: 'price' },
      { value: 'change_above', label: '涨幅高于(%)', category: 'change' },
      { value: 'change_below', label: '跌幅低于(%)', category: 'change' },
      { value: 'ma5_above', label: '突破MA5均线', category: 'ma' },
      { value: 'ma5_below', label: '跌破MA5均线', category: 'ma' },
      { value: 'ma10_above', label: '突破MA10均线', category: 'ma' },
      { value: 'ma10_below', label: '跌破MA10均线', category: 'ma' },
      { value: 'ma20_above', label: '突破MA20均线', category: 'ma' },
      { value: 'ma20_below', label: '跌破MA20均线', category: 'ma' },
      { value: 'ma60_above', label: '突破MA60均线', category: 'ma' },
      { value: 'ma60_below', label: '跌破MA60均线', category: 'ma' }
    ],
    targetValue: '',
    submitting: false,
    error: ''
  },

  onStockSelect(e) {
    const stock = e.detail
    if (!stock) return

    this.setData({
      stockCode: stock.code || stock.stockCode || '',
      stockName: stock.name || stock.stockName || '',
      market: stock.market || 'sh'
    })
  },

  onAlertTypeChange(e) {
    const index = e.detail.value
    this.setData({
      alertTypeIndex: index,
      alertType: this.data.alertTypes[index].value,
      targetValue: ''
    })
  },

  onTargetValueInput(e) {
    this.setData({ targetValue: e.detail.value })
  },

  validateForm() {
    const { stockCode, stockName, alertType, targetValue } = this.data
    const errors = []

    if (!stockCode || stockCode.length !== 6) {
      errors.push('请输入6位股票代码')
    }

    if (!stockName) {
      errors.push('请搜索并选择股票')
    }

    if (!targetValue || parseFloat(targetValue) <= 0) {
      const typeLabel = this.data.alertTypes.find(t => t.value === alertType)
      errors.push(`请输入有效的${typeLabel ? typeLabel.label : '目标'}值`)
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

      const { stockCode, stockName, market, alertType, targetValue } = this.data

      const alertData = {
        stockCode,
        stockName,
        market,
        alertType,
        targetValue: parseFloat(targetValue)
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
}))
