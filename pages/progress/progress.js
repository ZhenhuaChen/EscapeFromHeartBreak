// pages/progress/progress.js
const app = getApp()

Page({
  data: {
    detoxDays: 0,
    recoveryDays: 0,
    completedTasksCount: 0,
    overallProgress: 0,
    calendarDays: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const assessment = wx.getStorageSync('assessment') || {}
    const recoveryDays = assessment.recoveryDays || 30
    const detoxDays = app.getDetoxDays()

    // 计算总体进度
    const overallProgress = Math.min(Math.round((detoxDays / recoveryDays) * 100), 100)

    // 获取已完成的任务数（里程碑任务）
    const tasks = wx.getStorageSync('tasks') || {}
    const completedTasksCount = Object.values(tasks).filter(t => t.completed).length

    // 生成日历（显示最近30天）
    const calendarDays = []
    const today = new Date()
    const startDate = new Date(assessment.startDate)

    for (let i = 0; i < Math.min(recoveryDays, 60); i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(currentDate.getDate() + i)

      const isCompleted = i < detoxDays
      const isToday = currentDate.toDateString() === today.toDateString()

      calendarDays.push({
        day: i + 1,
        completed: isCompleted,
        isToday: isToday
      })
    }

    this.setData({
      detoxDays,
      recoveryDays,
      completedTasksCount,
      overallProgress,
      calendarDays
    })
  }
})
