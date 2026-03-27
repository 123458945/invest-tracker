const { get, post, put, del } = require('../../utils/request.js')

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
    wx.showToast({ title: '添加提醒功能开发中', icon: 'none' })
  },

  async handleToggle(e) {
    const alert = e.currentTarget.dataset.alert
    try {
      await put(`/alerts/${alert._id}`, { isActive: !alert.isActive })
      wx.showToast({
        title: alert.isActive ? '已暂停' : '已启用',
        icon: 'success'
      })
      await this.fetchAlerts()
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async handleReset(e) {
    const alert = e.currentTarget.dataset.alert
    try {
      await post(`/alerts/${alert._id}/reset`)
      wx.showToast({ title: '已重置', icon: 'success' })
      await this.fetchAlerts()
    } catch (err) {
      wx.showToast({ title: '重置失败', icon: 'none' })
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
            wx.showToast({ title: '删除成功', icon: 'success' })
            await this.fetchAlerts()
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }
})
