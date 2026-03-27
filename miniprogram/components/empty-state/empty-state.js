Component({
  properties: {
    // 类型：empty（无数据）、network（网络错误）、search（搜索无结果）、error（加载失败）
    type: {
      type: String,
      value: 'empty'
    },
    text: {
      type: String,
      value: ''
    },
    icon: {
      type: String,
      value: ''
    },
    // 是否显示操作按钮
    showAction: {
      type: Boolean,
      value: false
    },
    actionText: {
      type: String,
      value: ''
    }
  },

  data: {
    defaultIcons: {
      empty: '📭',
      network: '📡',
      search: '🔍',
      error: '⚠️'
    },
    defaultTexts: {
      empty: '暂无数据',
      network: '网络连接失败',
      search: '未找到相关内容',
      error: '加载失败'
    },
    defaultActions: {
      empty: '添加数据',
      network: '重新加载',
      search: '清除搜索',
      error: '重新加载'
    }
  },

  methods: {
    onAction() {
      this.triggerEvent('action', { type: this.properties.type })
    }
  }
})
