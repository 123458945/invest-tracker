// utils/auth.js

function getAppInstance() {
  return getApp()
}

/**
 * 检查是否已登录
 */
function isLoggedIn() {
  const app = getAppInstance()
  return !!app.globalData.token
}

/**
 * 检查 token 是否有效
 */
function isTokenValid() {
  const app = getAppInstance()
  const token = app.globalData.token
  if (!token) {
    return false
  }
  
  // 简单检查 token 格式（实际应该解析 JWT）
  return typeof token === 'string' && token.length > 0
}

/**
 * 获取当前用户信息
 */
function getCurrentUser() {
  return getAppInstance().globalData.userInfo
}

/**
 * 检查登录状态，未登录则跳转登录页
 * @param {Object} options 配置选项
 * @param {boolean} options.redirect 是否使用 redirectTo（默认使用 navigateTo）
 * @returns {boolean} 是否已登录
 */
function checkLogin(options = {}) {
  const { redirect = false } = options
  
  if (!isLoggedIn()) {
    const url = '/pages/login/login'
    if (redirect) {
      wx.redirectTo({ url })
    } else {
      wx.navigateTo({ url })
    }
    return false
  }
  
  return true
}

/**
 * 需要登录才能执行的操作
 * @param {Function} action 需要执行的操作
 * @param {Object} options 配置选项
 */
function requireLogin(action, options = {}) {
  if (checkLogin(options)) {
    if (typeof action === 'function') {
      action()
    }
  }
}

/**
 * 获取存储的 token
 */
function getToken() {
  const app = getAppInstance()
  return app.globalData.token || wx.getStorageSync('token')
}

/**
 * 设置 token
 */
function setToken(token) {
  const app = getAppInstance()
  app.globalData.token = token
  wx.setStorageSync('token', token)
}

/**
 * 清除登录状态
 */
function clearLoginState() {
  const app = getAppInstance()
  app.globalData.token = null
  app.globalData.userInfo = null
  wx.removeStorageSync('token')
}

/**
 * 检查页面访问权限
 * @param {Object} page 页面实例
 * @returns {boolean} 是否有权限访问
 */
function checkPageAccess(page) {
  // 如果页面需要登录但未登录，返回 false
  if (page.requireLogin !== false && !checkLogin()) {
    return false
  }
  
  return true
}

/**
 * 验证登录状态（异步，会请求服务器）
 */
function validateLogin() {
  return new Promise((resolve, reject) => {
    if (!isTokenValid()) {
      clearLoginState()
      reject(new Error('未登录'))
      return
    }
    
    getAppInstance().checkAuth()
      .then(user => {
        resolve(user)
      })
      .catch(err => {
        clearLoginState()
        reject(err)
      })
  })
}

/**
 * 自动登录（检查本地 token 并验证）
 */
function autoLogin() {
  return new Promise((resolve, reject) => {
    const token = getToken()
    
    if (!token) {
      reject(new Error('无token'))
      return
    }
    
    getAppInstance().globalData.token = token
    validateLogin()
      .then(user => {
        resolve(user)
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * 登出
 */
function logout() {
  return new Promise((resolve) => {
    clearLoginState()
    wx.reLaunch({
      url: '/pages/login/login'
    })
    resolve()
  })
}

/**
 * 页面混入：为页面添加登录检查
 * 使用方法：
 * const { withLogin } = require('../../utils/auth.js')
 * Page(withLogin({
 *   // 页面配置
 * }))
 */
function withLogin(pageConfig) {
  const originalOnLoad = pageConfig.onLoad
  const originalOnShow = pageConfig.onShow
  
  pageConfig.onLoad = function(options) {
    if (!checkPageAccess(this)) {
      return
    }
    
    if (originalOnLoad) {
      originalOnLoad.call(this, options)
    }
  }
  
  pageConfig.onShow = function() {
    if (this.requireLogin !== false && !isLoggedIn()) {
      return
    }
    
    if (originalOnShow) {
      originalOnShow.call(this)
    }
  }
  
  return pageConfig
}

/**
 * 拦截器：为请求添加 token
 */
function addAuthHeader(headers = {}) {
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

module.exports = {
  isLoggedIn,
  isTokenValid,
  getCurrentUser,
  checkLogin,
  requireLogin,
  getToken,
  setToken,
  clearLoginState,
  checkPageAccess,
  validateLogin,
  autoLogin,
  logout,
  withLogin,
  addAuthHeader
}
