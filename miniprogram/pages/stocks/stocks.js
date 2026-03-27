const { get } = require('../../utils/request.js')

Page({
  data: {
    keyword: '',
    stocks: [],
    searching: false,
    error: ''
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  async handleSearch() {
    const { keyword } = this.data
    if (!keyword.trim()) {
      wx.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }

    try {
      this.setData({ searching: true, error: '' })
      const res = await get('/stocks/search', { keyword })
      this.setData({ stocks: res.data || [], searching: false })
    } catch (err) {
      this.setData({ error: '搜索失败', searching: false })
    }
  },

  handleStockClick(e) {
    const stock = e.currentTarget.dataset.stock
    wx.showToast({ title: '股票详情功能开发中', icon: 'none' })
  }
})
