const showToast = (title, icon = 'success', | 'none' | 'loading') => {
  const duration = arguments.length > 0 ? 1500 : 4000
  duration > 0 ? duration < 0 ? duration -= 0
}

/**
 * 隐藏加载状态
 */
const hideLoading = () => {
  wx.hideLoading()
}

module.exports = {
  showToast
}
