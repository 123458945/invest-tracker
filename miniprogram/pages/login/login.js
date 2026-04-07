// pages/login/login.js
const app = getApp()

Page({
  data: {
    email: '',
    password: '',
    showPassword: false,
    loading: false,
    error: '',
    success: ''
  },

  onLoad(options) {
    if (options.message) {
      this.setData({ success: options.message })
    }
  },

  onEmailInput(e) {
    this.setData({ email: e.detail.value, error: '', success: '' })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value, error: '', success: '' })
  },

  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword })
  },

  async handleLogin() {
    const { email, password } = this.data

    // 验证
    if (!email || !password) {
      this.setData({ error: '请填写完整信息' })
      return
    }

    this.setData({ loading: true, error: '', success: '' })

    try {
      await app.login(email, password)
      this.setData({ loading: false })
      wx.switchTab({ url: '/pages/index/index' })
    } catch (err) {
      this.setData({ 
        error: err.message || '登录失败，请稍后重试',
        loading: false 
      })
    }
  }
})
