const app = getApp()

const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    const token = app.globalData.token
    
    wx.request({
      url: `${app.globalData.baseUrl}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          app.logout()
          wx.navigateTo({ url: '/pages/login/login' })
          reject(new Error('未授权，请重新登录'))
        } else {
          reject(new Error(res.data.message || '请求失败'))
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

const get = (url, params = {}) => {
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  return request(fullUrl, 'GET')
}

const post = (url, data = {}) => {
  return request(url, 'POST', data)
}

const put = (url, data = {}) => {
  return request(url, 'PUT', data)
}

const del = (url) => {
  return request(url, 'DELETE')
}

module.exports = {
  request,
  get,
  post,
  put,
  del
}
