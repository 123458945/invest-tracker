Component({
  properties: {
    text: {
      type: String,
      value: '加载中...'
    },
    show: {
      type: Boolean,
      value: true
    },
    // 骨架屏模式
    skeleton: {
      type: Boolean,
      value: false
    },
    // 骨架屏类型：list（列表）、card（卡片）、detail（详情）
    skeletonType: {
      type: String,
      value: 'list'
    },
    // 骨架屏行数（仅 list 类型）
    skeletonRows: {
      type: Number,
      value: 5
    }
  },

  data: {
    rows: []
  },

  observers: {
    'skeletonRows': function(count) {
      this.setData({
        rows: Array.from({ length: count }, (_, i) => i)
      })
    }
  },

  methods: {}
})
