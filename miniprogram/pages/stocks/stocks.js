// pages/stocks/stocks.js
const { get } = require('../../utils/request.js')
const { showToast } = require('../../utils/toast.js')
const { debounce } = require('../../utils/util.js')

Page({
  data: {
    stocks: [],
    keyword: '',
    searching: false,
    error: '',
    loading: false
  },

  onLoad(options) {
    if (options.message) {
      this.setData({ success: options.message })
    }
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ keyword })
  },

  handleSearch: debounce(async function() {
    const keyword = this.data.keyword.trim()
    if (!keyword) {
      this.setData({ stocks: [], error: '' })
      return
    }

    this.setData({ searching: true, error: '' })

    try {
      const res = await get('/stocks/search', { keyword })
      if (res.success && res.data && res.data.length > 0) {
        this.setData({
          stocks: res.data,
          searching: false
        })
      } else {
        this.setData({
          stocks: [],
          searching: false,
          error: '未找到相关股票'
        })
      }
    } catch (err) {
      this.setData({
        searching: false,
        error: '搜索失败'
      })
    }
  }, 500),

  handleStockClick(e) {
    const stock = e.currentTarget.dataset.stock
    wx.navigateTo({
      url: `/pages/stocks/stock-detail/stock-detail?code=${stock.code}&market=${stock.market || 'sh'}`
    })
  },

  navigateToStockDetail(code, market = 'sh') {
    wx.navigateTo({
      url: `/pages/stocks/stock-detail/stock-detail?code=${code}&market=${market || 'sh'}`
    })
  },

  onPullDownRefresh() {
    this.setData({ stocks: [], keyword: '', error: '' })
    wx.stopPullDownRefresh()
  }
})
