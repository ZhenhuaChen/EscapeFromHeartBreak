// pages/tasks/tasks.js
const app = getApp()

// 每日任务池
const DAILY_TASKS = [
  { title: '记录今天的心情', desc: '写下你今天的感受和想法' },
  { title: '做一件喜欢的事', desc: '看书、听音乐、运动或任何让你开心的事' },
  { title: '整理生活空间', desc: '清理房间，让环境更舒适' },
  { title: '和朋友聊天', desc: '主动联系一位朋友，分享生活' },
  { title: '运动30分钟', desc: '散步、跑步或任何形式的运动' },
  { title: '学习新技能', desc: '花时间学习一项新的技能或爱好' },
  { title: '感恩清单', desc: '列出今天值得感恩的3件事' },
  { title: '冥想或深呼吸', desc: '给自己10分钟放松时间' },
  { title: '健康饮食', desc: '为自己准备一顿营养的meal' },
  { title: '早睡早起', desc: '保持规律作息，善待自己' }
]

Page({
  data: {
    detoxDays: 0,
    todayDate: '',
    todayTask: {},
    todayTaskCompleted: false,
    completedTimeStr: '',
    tasksList: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const detoxDays = app.getDetoxDays()
    const today = new Date()
    const todayDate = `${today.getMonth() + 1}月${today.getDate()}日`

    // 根据天数选择今日任务（循环）
    const taskIndex = detoxDays % DAILY_TASKS.length
    const todayTask = DAILY_TASKS[taskIndex]

    // 检查今日任务是否完成
    const dailyRecords = wx.getStorageSync('dailyTaskRecords') || {}
    const todayKey = this.getTodayKey()
    const todayRecord = dailyRecords[todayKey]
    const todayTaskCompleted = todayRecord ? todayRecord.completed : false

    let completedTimeStr = ''
    if (todayTaskCompleted && todayRecord.completedTime) {
      const time = new Date(todayRecord.completedTime)
      completedTimeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`
    }

    // 获取所有里程碑任务
    const tasks = wx.getStorageSync('tasks') || {}
    const tasksList = Object.values(tasks).sort((a, b) => a.day - b.day)

    this.setData({
      detoxDays,
      todayDate,
      todayTask,
      todayTaskCompleted,
      completedTimeStr,
      tasksList
    })
  },

  getTodayKey() {
    const today = new Date()
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  },

  completeTask() {
    const todayKey = this.getTodayKey()
    const dailyRecords = wx.getStorageSync('dailyTaskRecords') || {}

    dailyRecords[todayKey] = {
      completed: true,
      completedTime: Date.now(),
      task: this.data.todayTask
    }

    wx.setStorageSync('dailyTaskRecords', dailyRecords)

    wx.showToast({
      title: '打卡成功！',
      icon: 'success'
    })

    this.loadData()
  }
})
