const app = getApp()

Page({
  data: {
    userInfo: {}
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = app.globalData.userInfo || {}
    this.setData({ userInfo })
  },

  navigateToSettings() {
    wx.showToast({ title: '个人设置功能开发中', icon: 'none' })
  },

  navigateToTransactions() {
    wx.showToast({ title: '交易记录功能开发中', icon: 'none' })
  },

  showAbout() {
    wx.showModal({
      title: '关于 InvestTracker',
      content: '个人投资管理系统\n版本: 1.0.0\n\n用于管理A股/基金持仓，查看实时行情，设置价格提醒。',
      showCancel: false
    })
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout()
          wx.redirectTo({ url: '/pages/login/login' })
        }
      }
    })
  }
})
