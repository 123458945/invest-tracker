// pages/stocks/stock-detail/stock-detail.js
const { get } = require('../../../utils/request.js')

Page({
  data: {
    code: '',
    market: '',
    stockInfo: null,
    maData: null,
    klineData: null,
    loading: true,
    error: ''
  },

  onLoad(options) {
    if (!options.code) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const today = new Date()
    const todayStr = this.formatDate(today)
    this.setData({
      code: options.code,
      market: options.market || 'sh',
    })

    this.loadStockData()
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  async loadStockData() {
    try {
      this.setData({ loading: true, error: '' })
      
      // 并行加载行情数据、均线数据和
K线数据
      const [quoteRes, maRes, klineRes] = await Promise.all([
        get(`/stocks/${this.data.code}`, { market: this.data.market }),
        get(`/stocks/${this.data.code}/ma`),
        get(`/stocks/${this.data.code}/kline`, { market: this.data.market, count: 70 })
      ])

      const stockInfo = quoteRes.data || {}
      const maData = maRes.data || {}
      const klineData = klineRes.data || []

      this.setData({
        stockInfo,
        maData,
        klineData,
        loading: false
      })

      // 绘制K线图和均线图
      this.drawCharts()
    } catch (err) {
      this.setData({
        error: err.message || '获取行情数据失败',
        loading: false
      })
    }
  },

  drawCharts() {
    const { klineData, maData } = this.data
    if (!klineData || klineData.length === 0) return

    // 绘制K线图
    this.drawKLine()
    
    // 绘制均线图
    this.drawMA()
  },

  drawKLine() {
    const query = wx.createSelectorQuery()
    query.select('#klineCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return
        
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)

        const width = res[0].width
        const height = res[0].height

        // 清空画布
        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = '#f5f5f5'
        ctx.fillRect(0, 0, width, height)
        // 绘制标题
        ctx.fillStyle = '#333'
        ctx.font = '14px sans-serif'
        ctx.fillText('K线图（待集成echarts）', 10, 30)
        const { klineData } = this.data
        if (klineData && klineData.length > 0) {
          const maxPrice = Math.max(...klineData.map(k => k.high || k.close))
          const minPrice = Math.min(...klineData.map(k => k.low || k.close))
          const priceRange = maxPrice - minPrice
          const barWidth = (width - 40) / klineData.length
          klineData.forEach((item, index) => {
            const x = 20 + index * barWidth
            const openY = height - 20 - ((item.open - minPrice) / priceRange) * (height - 60)
            const closeY = height - 20 - ((item.close - minPrice) / priceRange) * (height - 60)
            const highY = height - 20 - ((item.high - minPrice) / priceRange) * (height - 60)
            const lowY = height - 20 - ((item.low - minPrice) / priceRange) * (height - 60)
            // 绘制K线柱
            ctx.strokeStyle = item.close >= item.open ? '#f44336' : '#4caf50'
            ctx.fillStyle = item.close >= item.open ? '#f44336' : '#4caf50'
            
            ctx.beginPath()
            ctx.moveTo(x, highY)
            ctx.lineTo(x, lowY)
            ctx.stroke()
            const barHeight = Math.abs(closeY - openY)
            ctx.fillRect(x - barWidth/3, Math.min(openY, closeY), barWidth * 2/3, barHeight || 1)
          })
        }
      })
  },

  drawMA() {
    const query = wx.createSelectorQuery()
    query.select('#maCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return
        
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)
        const width = res[0].width
        const height = res[0].height
        // 清空画布
        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = '#f5f5f5'
        ctx.fillRect(0, 0, width, height)
        // 绘制标题
        ctx.fillStyle = '#333'
        ctx.font = '14px sans-serif'
        ctx.fillText('均线图（待集成echarts）', 10, 30)
        // 简单绘制均线
        const { maData } = this.data
        if (maData && maData.ma5) {
          this.drawLine(ctx, maData.ma5, '#1976d2', width, height, 'MA5')
        }
        if (maData && maData.ma10) {
          this.drawLine(ctx, maData.ma10, '#ff9800', width, height, 'MA10')
        }
        if (maData && maData.ma20) {
          this.drawLine(ctx, maData.ma20, '#9c27b0', width, height, 'MA20')
        }
      })
    }
  },

  drawLine(ctx, data, color, width, height, label) {
    if (!data || data.length < 2) return
    ctx.beginPath()
    ctx.strokeStyle = color
    const maxPrice = Math.max(...data)
    const minPrice = Math.min(...data.filter(v => v !== null))
    const priceRange = maxPrice - minPrice
    const stepX = (width - 40) / (data.length - 1)
    let started = false
    data.forEach((value, index) => {
      if (value === null) return
      
      const x = 20 + index * stepX
      const y = height - 20 - ((value - minPrice) / priceRange) * (height - 60)

      if (!started) {
        ctx.moveTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  },

  formatDate(dateStr) {
    if (!dateStr) return ''
    return dateStr.split('T')[0]
  }
})
