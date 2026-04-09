// pages/transactions/transactions.js
const { get } = require('../../utils/request.js')

const { showToast } = require('../../utils/toast.js')
const { isLoggedIn, withLogin } = require('../../utils/auth.js')

Page(withLogin({
  data: {
    transactions: [],
    loading: true,
    loadingMore: false,
    error: '',
    filterType: 'all',
    filterTypes: [
      { value: 'all', label: '全部' },
      { value: 'buy', label: '买入' },
      { value: 'sell', label: '卖出' }
    ],
    filterIndex: 0,
    page: 1,
    pageSize: 20,
    hasMore: true,
    stats: null
  },

  onLoad() {
  },

  onShow() {
    if (isLoggedIn()) {
      this.fetchTransactions()
      this.fetchStats()
    }
  },

  async fetchTransactions(append = false) {
    try {
      if (!append) {
        this.setData({ loading: true, error: '', page: 1, hasMore: true })
      } else {
        this.setData({ loadingMore: true })
      }

      const { page, pageSize, filterType } = this.data
      const params = {
        page,
        limit: pageSize
      }

      if (filterType !== 'all') {
        params.type = filterType
      }

      const res = await get('/holdings/transactions', params)
      const transactions = res.data || []

      this.setData({
        transactions: append ? [...this.data.transactions, ...transactions] : transactions,
        hasMore: transactions.length === pageSize,
        loading: false,
        loadingMore: false
      })
    } catch (err) {
      this.setData({
        error: '获取交易记录失败',
        loading: false,
        loadingMore: false
      })
    }
  },

  async fetchStats() {
    try {
      const res = await get('/holdings/transactions/stats')
      this.setData({ stats: res.data || null })
    } catch (err) {
      console.error('获取统计数据失败', err)
    }
  },

  onFilterChange(e) {
    const index = e.detail.value
    this.setData({
      filterIndex: index,
      filterType: this.data.filterTypes[index].value
    })
    this.fetchTransactions()
  },

  onPullDownRefresh() {
    Promise.all([this.fetchTransactions(), this.fetchStats()]).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1,
        loading: true,
        hasMore: true
      })
      this.fetchTransactions(true)
    }
  }
}))
