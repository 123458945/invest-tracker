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
    }
  },

  methods: {
    onConfirm() {
      this.triggerEvent('confirm')
    },

    onCancel() {
      this.triggerEvent('cancel')
    }
  }
})
