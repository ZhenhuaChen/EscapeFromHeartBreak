// pages/profile/profile.js
Page({
  data: {
    nickname: '',
    recoveryDays: 0
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const userProfile = wx.getStorageSync('userProfile') || {}
    const assessment = wx.getStorageSync('assessment') || {}

    this.setData({
      nickname: userProfile.nickname || '用户',
      recoveryDays: assessment.recoveryDays || 30
    })
  },

  goToEmergency() {
    wx.navigateTo({
      url: '/pages/emergency/emergency'
    })
  },

  viewEmotionRecords() {
    const emotions = wx.getStorageSync('emotions') || []
    wx.showModal({
      title: '情绪记录',
      content: emotions.length > 0 ? `您已记录 ${emotions.length} 次情绪` : '暂无记录',
      showCancel: false
    })
  },

  resetData() {
    wx.showModal({
      title: '重新开始',
      content: '确定要清除所有数据并重新开始吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.reLaunch({
            url: '/pages/welcome/welcome'
          })
        }
      }
    })
  },

  showAbout() {
    wx.showModal({
      title: '关于逃出失恋',
      content: '这是一款帮助失恋人群走出情感困境的小程序。通过科学的戒断计划和每日任务，帮助你不再沉溺失恋。\n\n走出失恋，不是靠时间，而是靠行动。',
      showCancel: false
    })
  },

  showHotline() {
    wx.showModal({
      title: '心理咨询热线',
      content: '全国心理援助热线：\n\n• 希望24热线：400-161-9995\n• 北京心理危机干预热线：010-82951332\n• 上海心理援助热线：021-12320-5\n\n* 如遇紧急情况请立即拨打',
      showCancel: false
    })
  }
})
