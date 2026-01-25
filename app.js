// app.js
const { DETOX_TASKS } = require('./data/tasks.js')

App({
  onLaunch() {
    // 小程序启动时的逻辑已移到welcome页面的onLoad中处理
    // 新用户会看到welcome页面
    // 老用户会在welcome页面自动跳转到home页面
  },

  globalData: {
    userProfile: null,
    assessment: null,
    tasks: null,
    emotions: []
  },

  // 保存用户资料
  saveUserProfile(data) {
    this.globalData.userProfile = data
    wx.setStorageSync('userProfile', data)
  },

  // 保存评估结果
  saveAssessment(data) {
    this.globalData.assessment = data
    wx.setStorageSync('assessment', data)
  },

  // 初始化任务列表（使用50个戒断任务）
  initTasks() {
    const assessment = wx.getStorageSync('assessment')
    const recoveryDays = assessment.recoveryDays || 50

    // 使用完整的50个戒断任务，根据恢复天数筛选
    const selectedTasks = DETOX_TASKS.filter(t => t.day <= recoveryDays)

    // 转换为任务对象 - 支持一天多个任务
    const tasks = {}
    selectedTasks.forEach((template, index) => {
      const taskId = `task${index + 1}`
      tasks[taskId] = {
        id: taskId,
        day: template.day,
        title: template.title,
        desc: template.desc,
        completed: false,
        date: null
      }
    })

    this.globalData.tasks = tasks
    wx.setStorageSync('tasks', tasks)
    return tasks
  },

  // 完成任务
  completeTask(taskId) {
    const tasks = wx.getStorageSync('tasks') || this.globalData.tasks
    if (tasks[taskId]) {
      tasks[taskId].completed = true
      tasks[taskId].date = Date.now()
      wx.setStorageSync('tasks', tasks)
      this.globalData.tasks = tasks
    }
  },

  // 记录情绪
  addEmotion(level, note = '') {
    const emotions = wx.getStorageSync('emotions') || []
    emotions.push({
      date: Date.now(),
      level: level,
      note: note
    })
    wx.setStorageSync('emotions', emotions)
    this.globalData.emotions = emotions
  },

  // 计算戒断天数
  getDetoxDays() {
    const assessment = wx.getStorageSync('assessment')
    if (!assessment || !assessment.startDate) return 0
    const days = Math.floor((Date.now() - assessment.startDate) / (1000 * 60 * 60 * 24))
    return days
  }
})
