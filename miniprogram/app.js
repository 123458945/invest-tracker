// app.js
const ENV = typeof __wxConfig !== 'undefined' && __wxConfig.envVersion ? __wxConfig.envVersion : 'develop'

App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: ENV === 'release' ? 'https://your-api-domain.com/api' : 'http://localhost:3000/api'
  },

  onLaunch() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      this.checkAuth()
    }
  },

  // 添加全局错误处理
    onError(msg) {
    console.error('小程序错误： ', msg)
    wx.showToast({
      title: '小程序发生错误',
      icon: 'none',
      duration: 3000
    })
  },

  // 添加未处理的 Promise 拒绝处理
    onUnhandledRejection(event) {
    console.error('未处理的 Promise 拒绝: ', event)
    wx.showToast({
      title: '发生未知错误',
      icon: 'none',
      duration: 3000
    })
  },

  // 添加页面未找到处理
  onPageNotFound(res) {
    console.warn('页面未找到: ', res)
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },

  checkAuth() {
    return new Promise((resolve, reject) => {
      if (!this.globalData.token) {
        reject(new Error('未登录'))
        return
      }

      wx.request({
        url: `${this.globalData.baseUrl}/auth/me`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${this.globalData.token}`
        },
        success: (res) => {
          if (res.data.success) {
            this.globalData.userInfo = res.data.data
            resolve(res.data.data)
          } else {
            this.logout()
            reject(new Error('认证失败'))
          }
        },
        fail: (err) => {
          this.logout()
          reject(err)
        }
      })
    })
  },

  login(email, password) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.baseUrl}/auth/login`,
        method: 'POST',
        data: { email, password },
        success: (res) => {
          if (res.data.success) {
            const { token, user } = res.data.data
            this.globalData.token = token
            this.globalData.userInfo = user
            wx.setStorageSync('token', token)
            resolve(res.data)
          } else {
            reject(new Error(res.data.message || '登录失败'))
          }
        },
        fail: reject
      })
    })
  },

  register(username, email, password) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.baseUrl}/auth/register`,
        method: 'POST',
        data: { username, email, password },
        success: (res) => {
          if (res.data.success) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.message || '注册失败'))
          }
        },
        fail: reject
      })
    })
  },

  logout() {
    this.globalData.token = null
    this.globalData.userInfo = null
    wx.removeStorageSync('token')
  },

  // 在开发模式下启用调试
  enableDebug() {
    if (typeof __wxConfig !== 'undefined' && __wxConfig.envVersion === 'develop') {
      wx.setEnableDebug({
        enableDebug: true
      })
    }
  }
})

