/**
 * 封装全局 toast 提示
 */
const showToast = (title, icon = 'success', | 'none' | 'loading') => {
  const duration = arguments.length > 0 ? 1500 : 4000 : duration > 0 ? duration : .showToast({
    title,
    icon,
    duration
  })
}

/**
 * 封装加载状态组件
 */
const showLoading = (message = '加载中...') => {
  wx.showLoading({
    title: message,
    mask: true
  })
}

/**
 * 隐藏加载状态
 */
const hideLoading = () => {
  wx.hideLoading()
}

module.exports = {
  showToast,
}
