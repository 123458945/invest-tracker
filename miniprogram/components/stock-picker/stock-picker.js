const { get } = require('../../utils/request.js')
const { STORAGE_KEYS } = require('../../utils/constants.js')

Component({
  properties: {
    placeholder: {
      type: String,
      value: '请输入股票代码或名称'
    },
    selectedStock: {
      type: Object,
      value: null
    },
    // 是否显示搜索历史
    showHistory: {
      type: Boolean,
      value: true
    },
    // 最大历史记录数
    maxHistory: {
      type: Number,
      value: 20
    }
  },

  data: {
    keyword: '',
    stocks: [],
    showList: false,
    searching: false,
    searchHistory: []
  },

  lifetimes: {
    attached() {
      this.loadSearchHistory()
    }
  },

  methods: {
    loadSearchHistory() {
      try {
        const history = wx.getStorageSync(STORAGE_KEYS.SEARCH_HISTORY) || []
        this.setData({ searchHistory: history })
      } catch (e) {
        console.error('加载搜索历史失败:', e)
      }
    },

    saveSearchHistory(stock) {
      if (!stock || !stock.code) return
      
      let history = this.data.searchHistory.slice()
      
      // 移除已存在的相同记录
      history = history.filter(item => item.code !== stock.code)
      
      // 添加到开头
      history.unshift({
        code: stock.code,
        name: stock.name,
        market: stock.market,
        timestamp: Date.now()
      })
      
      // 限制数量
      if (history.length > this.properties.maxHistory) {
        history = history.slice(0, this.properties.maxHistory)
      }
      
      this.setData({ searchHistory: history })
      wx.setStorageSync(STORAGE_KEYS.SEARCH_HISTORY, history)
    },

    clearSearchHistory() {
      wx.showModal({
        title: '提示',
        content: '确定清空搜索历史吗？',
        success: (res) => {
          if (res.confirm) {
            this.setData({ searchHistory: [] })
            wx.removeStorageSync(STORAGE_KEYS.SEARCH_HISTORY)
          }
        }
      })
    },

    onHistoryItemClick(e) {
      const index = e.currentTarget.dataset.index
      const stock = this.data.searchHistory[index]
      
      // 重新搜索
      this.setData({ keyword: stock.code })
      this.searchStock(stock.code)
    },

    onKeywordChange(e) {
      const keyword = e.detail.value.trim()
      this.setData({ keyword })
      
      if (keyword.length > 0) {
        this.searchStock(keyword)
      } else {
        this.setData({ stocks: [], showList: false })
      }
    },

    async searchStock(keyword) {
      if (this.data.searching) return
      
      this.setData({ searching: true })
      
      try {
        const res = await get('/stocks/search', { keyword })
        
        if (res.success && res.data && res.data.length > 0) {
          this.setData({
            stocks: res.data,
            showList: true,
            searching: false
          })
        } else {
          this.setData({
            stocks: [],
            showList: true,
            searching: false
          })
        }
      } catch (err) {
        console.error('搜索股票失败:', err)
        this.setData({
          stocks: [],
          showList: true,
          searching: false
        })
      }
    },

    onSelectStock(e) {
      const index = e.currentTarget.dataset.index
      const stock = this.data.stocks[index]
      
      // 保存到搜索历史
      this.saveSearchHistory(stock)
      
      this.setData({
        selectedStock: stock,
        keyword: '',
        stocks: [],
        showList: false
      })
      
      this.triggerEvent('select', stock)
    },

    onTapOutside() {
      this.setData({ showList: false })
    }
  }
})
