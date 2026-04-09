// pages/alerts/alerts.js
const { get, post, put, del } = require('../../utils/request.js')

const { showToast } = require('../../utils/toast.js')
const { isLoggedIn, withLogin } = require('../../utils/auth.js')

Page(withLogin({
  data: {
    alerts: [],
    loading: true,
    error: '',
    activeCount: 0,
    triggeredCount: 0,
    alertTypeNames: {
      'price_above': '价格高于',
      'price_below': '价格低于',
      'change_above': '涨幅高于',
      'change_below': '跌幅低于',
      'ma5_above': '突破MA5',
      'ma5_below': '跌破MA5',
      'ma10_above': '突破MA10',
      'ma10_below': '跌破MA10',
      'ma20_above': '突破MA20',
      'ma20_below': '跌破MA20',
      'ma60_above': '突破MA60',
      'ma60_below': '跌破MA60'
    }
  },

  onLoad() {
  },

  onShow() {
    if (isLoggedIn()) {
      this.fetchAlerts()
    }
  },

  async fetchAlerts() {
    try {
      this.setData({ loading: true, error: '' })
      const res = await get('/alerts')
      const alerts = res.data || []
      const activeCount = alerts.filter(a => a.isActive && !a.isTriggered).length
      const triggeredCount = alerts.filter(a => a.isTriggered).length

      // 为每条提醒附加类型显示文本和目标值格式化
      const alertTypeNames = this.data.alertTypeNames
      const formattedAlerts = alerts.map(a => {
        const typeName = alertTypeNames[a.alertType] || a.alertType
        let targetText = ''
        if (a.alertType && a.alertType.indexOf('change') > -1) {
          targetText = a.targetValue ? `${a.targetValue}%` : ''
        } else if (a.alertType && a.alertType.indexOf('price') > -1) {
          targetText = a.targetValue ? `¥${a.targetValue}` : ''
        }
        return { ...a, typeName, targetText }
      })

      this.setData({
        alerts: formattedAlerts,
        activeCount,
        triggeredCount,
        loading: false
      })
    } catch (err) {
      this.setData({
        error: '获取提醒列表失败',
        loading: false
      })
    }
  },

  openAddDialog() {
    wx.navigateTo({ url: '/pages/alerts/add-alert/add-alert' })
  },

  async handleToggle(e) {
    const alert = e.currentTarget.dataset.alert
    try {
      await put(`/alerts/${alert._id}`, { isActive: !alert.isActive })
      showToast(alert.isActive ? '已暂停' : '已启用')
      await this.fetchAlerts()
    } catch (err) {
      showToast('操作失败', 'none')
    }
  },

  async handleReset(e) {
    const alert = e.currentTarget.dataset.alert
    try {
      await post(`/alerts/${alert._id}/reset`)
      showToast('已重置')
      await this.fetchAlerts()
    } catch (err) {
      showToast('重置失败', 'none')
    }
  },

  handleDelete(e) {
    const alert = e.currentTarget.dataset.alert
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${alert.stockName} 的价格提醒吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await del(`/alerts/${alert._id}`)
            showToast('删除成功')
            await this.fetchAlerts()
          } catch (err) {
            showToast('删除失败', 'none')
          }
        }
      }
    })
  },

  onPullDownRefresh() {
    this.fetchAlerts().then(() => {
      wx.stopPullDownRefresh()
    })
  }
}))
