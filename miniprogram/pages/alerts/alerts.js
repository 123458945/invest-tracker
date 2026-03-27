// pages/alerts/alerts.js
const { get, post, put, del } = require('../../utils/request.js')

const { showToast } = require('../../utils/toast.js')

Page({
  data: {
    alerts: [],
    loading: true,
    error: '',
    activeCount: 0,
    triggeredCount: 0
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    if (getApp().globalData.token) {
      this.fetchAlerts()
    }
  },

  checkLogin() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.fetchAlerts()
  },

  async fetchAlerts() {
    try {
      this.setData({ loading: true, error: '' })
      const res = await get('/alerts')
      const alerts = res.data || []
      const activeCount = alerts.filter(a => a.isActive && !a.isTriggered).length
      const triggeredCount = alerts.filter(a => a.isTriggered).length

      this.setData({
        alerts,
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
})
