const { get } = require('../../utils/request.js')

Component({
  properties: {
    placeholder: {
      type: String,
      value: '请输入股票代码或名称'
    },
    selectedStock: {
      type: Object,
      value: null
    }
  },

  data: {
    keyword: '',
    stocks: [],
    searching: false,
    showList: false
  },

  methods: {
    onInput(e) {
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
            showList: false,
            searching: false
          })
        }
      } catch (err) {
        this.setData({
          stocks: [],
          showList: false,
          searching: false
        })
      }
    },

    onSelectStock(e) {
      const index = e.currentTarget.dataset.index
      const stock = this.data.stocks[index]
      
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
