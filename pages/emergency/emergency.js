// pages/emergency/emergency.js
Page({
  data: {
    showBreathingModal: false,
    breathingPhase: 'inhale',
    breathingText: '吸气',
    breathingTip: '跟随呼吸节奏',
    breathingTimer: null
  },

  onUnload() {
    if (this.data.breathingTimer) {
      clearInterval(this.data.breathingTimer)
    }
  },

  // 开始呼吸练习
  startBreathing() {
    this.setData({
      showBreathingModal: true,
      breathingPhase: 'inhale',
      breathingText: '吸气'
    })

    let count = 0
    const phases = [
      { phase: 'inhale', text: '吸气', duration: 4000 },
      { phase: 'hold', text: '屏住', duration: 4000 },
      { phase: 'exhale', text: '呼气', duration: 4000 },
      { phase: 'hold', text: '放松', duration: 4000 }
    ]

    const timer = setInterval(() => {
      const currentPhase = phases[count % 4]
      this.setData({
        breathingPhase: currentPhase.phase,
        breathingText: currentPhase.text
      })
      count++

      // 30秒后自动结束
      if (count >= 8) {
        this.closeBreathing()
        wx.showToast({
          title: '练习完成！',
          icon: 'success'
        })
      }
    }, 4000)

    this.setData({ breathingTimer: timer })
  },

  closeBreathing() {
    if (this.data.breathingTimer) {
      clearInterval(this.data.breathingTimer)
    }
    this.setData({
      showBreathingModal: false,
      breathingTimer: null
    })
  },

  stopPropagation() {
    // 阻止事件冒泡
  },

  // 想TA了
  handleMissing() {
    const distractions = [
      '去喝杯水，活动一下身体',
      '打开音乐，听一首喜欢的歌',
      '看看窗外，观察路过的行人',
      '做10个深蹲，让身体动起来',
      '给朋友发个消息，聊聊天',
      '看一个搞笑视频，笑一笑',
      '整理一下房间，让环境更舒适'
    ]

    const randomIndex = Math.floor(Math.random() * distractions.length)
    const suggestion = distractions[randomIndex]

    wx.showModal({
      title: '试试这个',
      content: suggestion,
      showCancel: false,
      confirmText: '好的'
    })
  },

  // 显示心理热线
  showHotline() {
    wx.showModal({
      title: '心理咨询热线',
      content: '全国心理援助热线：\n\n• 希望24热线：400-161-9995\n• 北京心理危机干预热线：010-82951332\n• 上海心理援助热线：021-12320-5\n\n* 本工具不替代专业心理咨询',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 记录感受
  recordFeeling() {
    wx.showModal({
      title: '写下此刻的感受',
      editable: true,
      placeholderText: '你现在的心情如何...',
      success: (res) => {
        if (res.confirm && res.content) {
          // 保存到本地
          const feelings = wx.getStorageSync('feelings') || []
          feelings.push({
            content: res.content,
            date: Date.now()
          })
          wx.setStorageSync('feelings', feelings)

          wx.showToast({
            title: '已保存',
            icon: 'success'
          })
        }
      }
    })
  }
})
