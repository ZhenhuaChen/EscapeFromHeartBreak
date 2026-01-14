// pages/goalSelect/goalSelect.js
const GOALS = [
  { value: 1, label: '忘记我的前任', icon: '🧠' },
  { value: 2, label: '重新感到快乐', icon: '😊' },
  { value: 3, label: '重建信心', icon: '💪' },
  { value: 4, label: '睡得更好', icon: '😴' },
  { value: 5, label: '停止哭泣', icon: '🌈' },
  { value: 6, label: '重新爱自己', icon: '❤️' },
  { value: 7, label: '重新相信爱情', icon: '💕' },
  { value: 8, label: '开始新的事物', icon: '🌟' },
  { value: 9, label: '寻找内心的平静', icon: '🧘' },
  { value: 10, label: '与朋友重新联系', icon: '👥' }
]

Page({
  data: {
    goals: GOALS,
    selectedGoal: null
  },

  handleSelectGoal(e) {
    const value = parseInt(e.currentTarget.dataset.value)
    this.setData({
      selectedGoal: value
    })
  },

  handleConfirm() {
    if (!this.data.selectedGoal) return

    // 保存目标
    wx.setStorageSync('selectedGoal', this.data.selectedGoal)

    // 跳转到计算页面（result页面会显示计算动画）
    wx.redirectTo({
      url: '/pages/result/result'
    })
  }
})
