// pages/welcome/welcome.js
Page({
  data: {
  },

  onLoad() {
    // 检查是否已经完成初始化
    const userProfile = wx.getStorageSync('userProfile')
    const assessment = wx.getStorageSync('assessment')

    if (userProfile && assessment && assessment.recoveryDays) {
      // 已完成初始化，直接切换到主页（使用switchTab因为home是tabBar页面）
      wx.switchTab({
        url: '/pages/home/home'
      })
    }
  },

  handleStart() {
    wx.navigateTo({
      url: '/pages/questionnaire/questionnaire'
    })
  }
})
