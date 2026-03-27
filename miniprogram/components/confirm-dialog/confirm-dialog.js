Component({
  properties: {
    title: {
      type: String,
      value: '提示'
    },
    content: {
      type: String,
      value: ''
    },
    confirmText: {
      type: String,
      value: '确定'
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    show: {
      type: Boolean,
      value: false
    },
    // 是否显示输入框
    showInput: {
      type: Boolean,
      value: false
    },
    // 输入框占位符
    inputPlaceholder: {
      type: String,
      value: '请输入'
    },
    // 输入类型：text, number, idcard, digit
    inputType: {
      type: String,
      value: 'text'
    },
    // 需要确认的输入值（如删除时需要输入"删除"）
    confirmValue: {
      type: String,
      value: ''
    },
    // 确认按钮颜色
    confirmColor: {
      type: String,
      value: '#1976d2'
    },
    // 取消按钮颜色
    cancelColor: {
      type: String,
      value: '#666'
    },
    // 是否显示为危险操作（红色确认按钮）
    danger: {
      type: Boolean,
      value: false
    }
  },

  data: {
    inputValue: ''
  },

  observers: {
    'show': function(show) {
      // 每次打开对话框时清空输入
      if (show) {
        this.setData({ inputValue: '' })
      }
    }
  },

  methods: {
    onConfirm() {
      const { inputValue, confirmValue } = this.data
      
      // 如果需要确认值但输入不匹配
      if (confirmValue && inputValue !== confirmValue) {
        wx.showToast({
          title: `请输入"${confirmValue}"`,
          icon: 'none'
        })
        return
      }
      
      this.triggerEvent('confirm', { value: inputValue })
    },

    onCancel() {
      this.triggerEvent('cancel')
    },

    onInputChange(e) {
      this.setData({
        inputValue: e.detail.value
      })
    },

    // 阻止冒泡
    preventBubble() {}
  }
})
