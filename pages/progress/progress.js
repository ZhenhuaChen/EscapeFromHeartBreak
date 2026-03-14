// pages/progress/progress.js
const app = getApp()

const EMOTION_LABELS = ['', '很糟糕', '不太好', '一般', '还可以', '很好']
const EMOTION_EMOJIS = ['', '😢', '😔', '😐', '🙂', '😊']

Page({
  data: {
    detoxDays: 0,
    recoveryDays: 0,
    completedTasksCount: 0,
    overallProgress: 0,
    calendarDays: [],
    showDayDetail: false,
    selectedDayInfo: null
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

      // 存储当天的起始时间戳，用于点击后查询数据
      const dayStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      ).getTime()

      calendarDays.push({
        day: i + 1,
        completed: isCompleted,
        isToday: isToday,
        dayStart: dayStart
      })
    }

    this.setData({
      detoxDays,
      recoveryDays,
      completedTasksCount,
      overallProgress,
      calendarDays
    })
  },

  // 点击日历某天
  calendarDayTap(e) {
    const index = e.currentTarget.dataset.index
    const day = this.data.calendarDays[index]

    const dayStart = day.dayStart
    const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1

    // 查询当天完成的系统任务
    const tasks = wx.getStorageSync('tasks') || {}
    const completedTasks = Object.values(tasks)
      .filter(t => t.completed && t.date && t.date >= dayStart && t.date <= dayEnd)
      .map(t => ({ title: t.title }))

    // 查询当天完成的自定义任务
    const customTasks = wx.getStorageSync('customTasks') || []
    const completedCustomTasks = customTasks
      .filter(t => t.completed && t.completedTime && t.completedTime >= dayStart && t.completedTime <= dayEnd)
      .map(t => ({ content: t.content }))

    // 查询当天的情绪记录
    const emotions = wx.getStorageSync('emotions') || []
    const dayEmotions = emotions
      .filter(em => em.date >= dayStart && em.date <= dayEnd)
      .map(em => ({
        emoji: EMOTION_EMOJIS[em.level] || '😐',
        label: EMOTION_LABELS[em.level] || '未知',
        timeStr: this.formatTime(em.date)
      }))

    const d = new Date(dayStart)
    const dateStr = `${d.getMonth() + 1}月${d.getDate()}日`

    this.setData({
      showDayDetail: true,
      selectedDayInfo: {
        dayNum: day.day,
        dateStr,
        completedTasks,
        completedCustomTasks,
        emotions: dayEmotions,
        hasData: completedTasks.length > 0 || completedCustomTasks.length > 0 || dayEmotions.length > 0
      }
    })
  },

  closeDayDetail() {
    this.setData({ showDayDetail: false, selectedDayInfo: null })
  },

  formatTime(timestamp) {
    const d = new Date(timestamp)
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }
})
