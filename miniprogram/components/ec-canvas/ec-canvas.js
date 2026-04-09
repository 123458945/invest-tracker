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
          if (!res[0]) return

          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = wx.getSystemInfoSync().pixelRatio
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          ctx.scale(dpr, dpr)

          this.setData({ chart: { canvas, ctx, width: res[0].width, height: res[0].height } })
          this.triggerEvent('init', { canvas, width: res[0].width, height: res[0].height, ctx })
        })
    },

    setOption(option) {
      if (!this.data.chart) return

      const { ctx, width, height } = this.data.chart
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      const series = option.series && option.series[0]
      if (!series) return

      if (series.type === 'pie') {
        this.drawPieChart(series, width, height, option.legend, option.color)
      }
    },

    drawPieChart(series, width, height, legend, colors) {
      const { ctx } = this.data.chart
      const data = series.data || []
      if (data.length === 0) return

      const colorList = colors || ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1', '#7b1fa2', '#f57c00']
      const total = data.reduce((sum, item) => sum + item.value, 0)
      if (total === 0) return

      // 饼图区域
      const centerX = legend ? width * 0.35 : width / 2
      const centerY = height / 2
      const radius = Math.min(width * 0.3, height / 2) - 20
      const innerRadius = radius * 0.45

      let currentAngle = -Math.PI / 2

      data.forEach((item, index) => {
        const angle = (item.value / total) * Math.PI * 2
        if (angle <= 0) return

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle)
        ctx.arc(centerX, centerY, innerRadius, currentAngle + angle, currentAngle, true)
        ctx.closePath()
        ctx.fillStyle = item.itemStyle ? (item.itemStyle.color || colorList[index % colorList.length]) : colorList[index % colorList.length]
        ctx.fill()

        currentAngle += angle
      })

      // 中心文字
      ctx.fillStyle = '#333'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('资产配置', centerX, centerY - 8)
      ctx.font = '11px sans-serif'
      ctx.fillStyle = '#999'
      ctx.fillText(`${data.length} 类`, centerX, centerY + 10)

      // 图例
      if (legend !== false) {
        const legendX = width * 0.65
        let legendY = Math.max(20, centerY - data.length * 18)
        ctx.textAlign = 'left'

        data.forEach((item, index) => {
          const color = item.itemStyle ? (item.itemStyle.color || colorList[index % colorList.length]) : colorList[index % colorList.length]
          ctx.fillStyle = color
          ctx.fillRect(legendX, legendY, 10, 10)

          ctx.fillStyle = '#333'
          ctx.font = '11px sans-serif'
          ctx.fillText(item.name, legendX + 16, legendY + 9)

          const pct = ((item.value / total) * 100).toFixed(1) + '%'
          ctx.fillStyle = '#999'
          ctx.font = '10px sans-serif'
          ctx.fillText(pct, legendX + 16 + ctx.measureText(item.name).width + 6, legendY + 9)

          legendY += 22
        })
      }
    }
  }
})
