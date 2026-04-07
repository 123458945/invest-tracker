// utils/toast.js

/**
 * 显示提示消息
 * @param {string} title 提示内容
 * @param {string} icon 图标类型：success, none, loading
 * @param {number} duration 显示时长（毫秒）
 */
const showToast = (title, icon = 'none', duration = 2000) => {
  if (!title) return
  
  wx.showToast({
    title: title,
    icon: icon,
    duration: duration
  })
}

/**
 * 显示成功提示
 */
const showSuccess = (title, duration = 2000) => {
  showToast(title, 'success', duration)
}

/**
 * 显示错误提示
 */
const showError = (title, duration = 2000) => {
  showToast(title, 'none', duration)
}

/**
 * 显示加载中
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title: title,
    mask: true
  })
}

/**
 * 隐藏加载状态
 */
const hideLoading = () => {
  wx.hideLoading()
}

/**
 * 显示确认对话框
 */
const showConfirm = (content, title = '提示') => {
  return new Promise((resolve) => {
    wx.showModal({
      title: title,
      content: content,
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 显示操作菜单
 */
const showActionSheet = (itemList) => {
  return new Promise((resolve, reject) => {
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        resolve(res.tapIndex)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

module.exports = {
  showToast,
  showSuccess,
  showError,
  showLoading,
  hideLoading,
  showConfirm,
  showActionSheet
}
