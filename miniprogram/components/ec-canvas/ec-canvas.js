Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    }
  },

  data: {
    chart: null
  },

  lifetimes: {
    attached() {
      this.initChart()
    }
  },

  methods: {
    initChart() {
      const query = wx.createSelectorQuery().in(this)
      query.select('.ec-canvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            const canvas = res[0].node
            const ctx = canvas.getContext('2d')
            const dpr = wx.getSystemInfoSync().pixelRatio
            canvas.width = res[0].width * dpr
            canvas.height = res[0].height * dpr
            ctx.scale(dpr, dpr)
            
            this.setData({ chart: { canvas, ctx } })
            
            // 触发初始化事件
            this.triggerEvent('init', { canvas, width: res[0].width, height: res[0].height, dpr })
          }
        })
    },

    setOption(option) {
      if (!this.data.chart) return
      
      const { ctx } = this.data.chart
      const width = this.data.chart.canvas.width / wx.getSystemInfoSync().pixelRatio
      const height = this.data.chart.canvas.height / wx.getSystemInfoSync().pixelRatio
      
      // 清空画布
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#f5f5f5'
      ctx.fillRect(0, 0, width, height)
      
      // 简单绘制饼图
      if (option.series && option.series[0] && option.series[0].type === 'pie') {
        this.drawPieChart(option.series[0], width, height)
      }
    },

    drawPieChart(series, width, height) {
      const { ctx } = this.data.chart
      const data = series.data || []
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 2 - 40
      const innerRadius = radius * 0.4
      
      let total = data.reduce((sum, item) => sum + item.value, 0)
      let currentAngle = -Math.PI / 2
      
      data.forEach((item, index) => {
        const angle = (item.value / total) * Math.PI * 2
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle)
        ctx.arc(centerX, centerY, innerRadius, currentAngle + angle, currentAngle, true)
        ctx.closePath()
        
        const color = item.itemStyle?.color || this.getDefaultColor(index)
        ctx.fillStyle = color
        ctx.fill()
        
        // 绘制标签
        const midAngle = currentAngle + angle / 2
        const labelRadius = radius + 20
        const labelX = centerX + Math.cos(midAngle) * labelRadius
        const labelY = centerY + Math.sin(midAngle) * labelRadius
        
        ctx.fillStyle = '#333'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(item.name, labelX, labelY)
        
        const percentage = ((item.value / total) * 100).toFixed(1) + '%'
        ctx.fillText(percentage, labelX, labelY + 15)
        
        currentAngle += angle
      })
    },

    getDefaultColor(index) {
      const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1', '#7b1fa2', '#f57c00']
      return colors[index % colors.length]
    }
  }
})
