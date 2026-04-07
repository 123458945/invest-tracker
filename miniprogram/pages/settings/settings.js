const { get, put } = require('../../utils/request.js')

Page({
  data: {
    userInfo: null,
    settings: {
      notifyByEmail: true,
      notifyByApp: true,
      dailyReport: false
    },
    loading: true,
    submitting: false,
    error: '',
    showPasswordModal: false,
    passwordForm: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    if (getApp().globalData.token) {
      this.fetchSettings()
    }
  },

  checkLogin() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
  },

  async fetchSettings() {
    try {
      this.setData({ loading: true, error: '' })
      const res = await get('/user/settings')
      
      if (res.success && res.data) {
        this.setData({
          userInfo: res.data.user || null,
          settings: res.data.settings || this.data.settings,
          loading: false
        })
      } else {
        this.setData({ loading: false })
      }
    } catch (err) {
      this.setData({
        error: '获取设置失败',
        loading: false
      })
    }
  },

  onSettingChange(e) {
    const key = e.currentTarget.dataset.key
    const value = e.detail.value
    this.setData({
      [`settings.${key}`]: value
    })
    this.saveSettings()
  },

  async saveSettings() {
    try {
      await put('/user/settings', this.data.settings)
      wx.showToast({ title: '已保存', icon: 'success' })
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  showChangePassword() {
    this.setData({
      showPasswordModal: true,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    })
  },

  hidePasswordModal() {
    this.setData({ showPasswordModal: false })
  },

  onOldPasswordInput(e) {
    this.setData({ 'passwordForm.oldPassword': e.detail.value })
  },

  onNewPasswordInput(e) {
    this.setData({ 'passwordForm.newPassword': e.detail.value })
  },

  onConfirmPasswordInput(e) {
    this.setData({ 'passwordForm.confirmPassword': e.detail.value })
  },

  async handleChangePassword() {
    const { oldPassword, newPassword, confirmPassword } = this.data.passwordForm
    
    if (!oldPassword) {
      wx.showToast({ title: '请输入旧密码', icon: 'none' })
      return
    }

    if (!newPassword || newPassword.length < 6) {
      wx.showToast({ title: '新密码至少6位', icon: 'none' })
      return
    }

    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }

    try {
      this.setData({ submitting: true })
      const res = await put('/user/password', {
        oldPassword,
        newPassword
      })

      if (res.success) {
        wx.showToast({ title: '密码修改成功', icon: 'success' })
        this.hidePasswordModal()
      } else {
        wx.showToast({ title: res.message || '修改失败', icon: 'none' })
      }
    } catch (err) {
      wx.showToast({ title: err.message || '修改失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          app.logout()
          wx.redirectTo({ url: '/pages/login/login' })
        }
      }
    })
  },

  navigateToTransactions() {
    wx.navigateTo({ url: '/pages/transactions/transactions' })
  }
})
