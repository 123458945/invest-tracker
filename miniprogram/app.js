// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'http://localhost:3000/api'
  },

  onLaunch() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      this.checkAuth()
    }
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
  }
})
