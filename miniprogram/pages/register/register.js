// pages/register/register.js
const app = getApp()

Page({
  data: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    loading: false,
    error: ''
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value, error: '' })
  },

  onEmailInput(e) {
    this.setData({ email: e.detail.value, error: '' })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value, error: '' })
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value, error: '' })
  },

  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword })
  },

  async handleRegister() {
    const { username, email, password, confirmPassword } = this.data

    // 验证
    if (!username || !email || !password || !confirmPassword) {
      this.setData({ error: '请填写完整信息' })
      return
    }

    if (password !== confirmPassword) {
      this.setData({ error: '两次密码输入不一致' })
      return
    }

    if (password.length < 6) {
      this.setData({ error: '密码长度至少6位' })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      this.setData({ error: '请输入有效的邮箱地址' })
      return
    }

    this.setData({ loading: true, error: '' })

    try {
      await app.register(username, email, password)
      this.setData({ loading: false })
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      })
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/login/login?message=注册成功，请登录'
        })
      }, 1500)
    } catch (err) {
      this.setData({ 
        error: err.message || '注册失败，请稍后重试',
        loading: false 
      })
    }
  }
})
