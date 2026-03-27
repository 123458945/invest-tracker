// utils/request.js

const app = getApp()
const { showToast, showLoading, hideLoading } = require('./toast.js')

// 请求队列，用于防抖
const requestQueue = new Map()

// 网络状态
let networkType = 'unknown'

/**
 * 初始化网络状态监听
 */
function initNetworkListener() {
  // 获取当前网络状态
  wx.getNetworkType({
    success: (res) => {
      networkType = res.networkType
    }
  })
  
  // 监听网络状态变化
  wx.onNetworkStatusChange((res) => {
    networkType = res.networkType
    if (!res.isConnected) {
      showToast('网络连接已断开', 'none', 3000)
    }
  })
}

// 初始化网络监听
initNetworkListener()

/**
 * 检查网络状态
 */
function checkNetwork() {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: (res) => {
        networkType = res.networkType
        if (res.networkType === 'none') {
          reject(new Error('无网络连接'))
        } else {
          resolve(res.networkType)
        }
      },
      fail: () => {
        reject(new Error('无法获取网络状态'))
      }
    })
  })
}

/**
 * 生成请求唯一标识
 */
function generateRequestKey(url, method, data) {
  return `${method}:${url}:${JSON.stringify(data)}`
}

/**
 * 检查是否有相同请求正在进行
 */
function hasDuplicateRequest(key) {
  return requestQueue.has(key)
}

/**
 * 添加请求到队列
 */
function addRequestToQueue(key, promise) {
  requestQueue.set(key, promise)
}

/**
 * 从队列中移除请求
 */
function removeRequestFromQueue(key) {
  requestQueue.delete(key)
}

/**
 * 获取重复请求的 Promise
 */
function getDuplicateRequest(key) {
  return requestQueue.get(key)
}

/**
 * 核心请求函数
 */
const request = (url, method = 'GET', data = {}, options = {}) => {
  const {
    showLoading: showLoadingFlag = false,
    loadingText = '加载中...',
    retry = method === 'GET',  // GET 请求默认重试
    retryCount = 1,
    timeout = 10000,
    debounce = true,  // 默认开启防抖
    skipAuthCheck = false
  } = options
  
  // 检查网络状态
  if (!skipAuthCheck) {
    return checkNetwork().catch(() => {
      showToast('网络不可用，请检查网络设置', 'none', 3000)
      return Promise.reject(new Error('网络不可用'))
    }).then(() => {
      return doRequest()
    })
  }
  
  return doRequest()
  
  function doRequest() {
    const token = app.globalData.token
    const requestKey = generateRequestKey(url, method, data)
    
    // 防抖：检查是否有相同请求正在进行
    if (debounce && hasDuplicateRequest(requestKey)) {
      return getDuplicateRequest(requestKey)
    }
    
    // 显示加载提示
    if (showLoadingFlag) {
      showLoading(loadingText)
    }
    
    const requestPromise = new Promise((resolve, reject) => {
      let retryAttempts = 0
      
      const makeRequest = () => {
        // 创建超时定时器
        const timeoutId = setTimeout(() => {
          showToast('请求超时，请稍后重试', 'none')
          reject(new Error('请求超时'))
        }, timeout)
        
        wx.request({
          url: `${app.globalData.baseUrl}${url}`,
          method,
          data,
          header: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          success: (res) => {
            clearTimeout(timeoutId)
            
            if (showLoadingFlag) {
              hideLoading()
            }
            
            // 处理 401 未授权
            if (res.statusCode === 401) {
              app.logout()
              wx.redirectTo({ url: '/pages/login/login' })
              showToast('登录已过期，请重新登录', 'none', 3000)
              reject(new Error('未授权，请重新登录'))
              return
            }
            
            // 处理 403 禁止访问
            if (res.statusCode === 403) {
              showToast('没有访问权限', 'none')
              reject(new Error('没有访问权限'))
              return
            }
            
            // 处理 404 未找到
            if (res.statusCode === 404) {
              showToast('请求的资源不存在', 'none')
              reject(new Error('资源不存在'))
              return
            }
            
            // 处理 500 服务器错误
            if (res.statusCode >= 500) {
              showToast('服务器错误，请稍后重试', 'none')
              reject(new Error('服务器错误'))
              return
            }
            
            // 成功响应
            if (res.statusCode === 200) {
              resolve(res.data)
            } else {
              const errorMsg = res.data && res.data.message ? res.data.message : '请求失败'
              showToast(errorMsg, 'none')
              reject(new Error(errorMsg))
            }
          },
          fail: (err) => {
            clearTimeout(timeoutId)
            
            if (showLoadingFlag) {
              hideLoading()
            }
            
            // 网络请求失败，尝试重试
            if (retry && retryAttempts < retryCount) {
              retryAttempts++
              console.log(`请求失败，第 ${retryAttempts} 次重试:`, url)
              setTimeout(() => {
                makeRequest()
              }, 1000 * retryAttempts) // 递增延迟
              return
            }
            
            // 重试次数用完，显示错误
            showToast('网络请求失败，请检查网络', 'none')
            reject(err)
          }
        })
      }
      
      makeRequest()
    })
    
    // 添加到请求队列（防抖）
    if (debounce) {
      addRequestToQueue(requestKey, requestPromise)
      
      // 请求完成后移除
      requestPromise
        .catch(() => {})
        .finally(() => {
          removeRequestFromQueue(requestKey)
        })
    }
    
    return requestPromise
  }
}

/**
 * GET 请求
 */
const get = (url, params = {}, options = {}) => {
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  return request(fullUrl, 'GET', {}, options)
}

/**
 * POST 请求
 */
const post = (url, data = {}, options = {}) => {
  return request(url, 'POST', data, options)
}

/**
 * PUT 请求
 */
const put = (url, data = {}, options = {}) => {
  return request(url, 'PUT', data, options)
}

/**
 * DELETE 请求
 */
const del = (url, options = {}) => {
  return request(url, 'DELETE', {}, options)
}

/**
 * 上传文件
 */
const upload = (url, filePath, name = 'file', formData = {}) => {
  return new Promise((resolve, reject) => {
    const token = app.globalData.token
    
    wx.uploadFile({
      url: `${app.globalData.baseUrl}${url}`,
      filePath: filePath,
      name: name,
      formData: formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data)
            resolve(data)
          } catch (e) {
            resolve(res.data)
          }
        } else if (res.statusCode === 401) {
          app.logout()
          wx.redirectTo({ url: '/pages/login/login' })
          reject(new Error('未授权，请重新登录'))
        } else {
          reject(new Error('上传失败'))
        }
      },
      fail: (err) => {
        showToast('上传失败', 'none')
        reject(err)
      }
    })
  })
}

/**
 * 下载文件
 */
const download = (url) => {
  return new Promise((resolve, reject) => {
    const token = app.globalData.token
    
    wx.downloadFile({
      url: `${app.globalData.baseUrl}${url}`,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath)
        } else if (res.statusCode === 401) {
          app.logout()
          wx.redirectTo({ url: '/pages/login/login' })
          reject(new Error('未授权，请重新登录'))
        } else {
          reject(new Error('下载失败'))
        }
      },
      fail: (err) => {
        showToast('下载失败', 'none')
        reject(err)
      }
    })
  })
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  upload,
  download,
  checkNetwork
}
