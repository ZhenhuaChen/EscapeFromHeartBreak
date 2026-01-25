// pages/tasks/tasks.js
const app = getApp()
const { DETOX_TASKS, ENCOURAGEMENT_MESSAGES } = require('../../data/tasks.js')

Page({
  data: {
    detoxDays: 0,
    todayDate: '',
    todayTask: {},
    todayTaskCompleted: false,
    completedTimeStr: '',
    tasksList: [],
    showEncouragement: false,
    encouragementMessage: ''
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

    // 获取所有里程碑任务 - 优先从 globalData 读取，提高性能
    let tasks = app.globalData.tasks
    if (!tasks) {
      tasks = wx.getStorageSync('tasks') || {}
      app.globalData.tasks = tasks
    }
    const allTasks = Object.values(tasks).sort((a, b) => a.day - b.day)

    // 只显示当天和过去的任务（不显示未来的任务）
    const tasksList = allTasks.filter(task => task.day <= detoxDays)

    // 获取今天的第一个任务作为"今日任务"展示
    const todayTasks = DETOX_TASKS.filter(t => t.day === detoxDays)
    const todayTask = todayTasks.length > 0 ? todayTasks[0] : { title: '休息日', desc: '今天没有新任务，继续保持！' }

    // 检查今日任务完成情况 - 检查当天所有任务是否都完成
    const todayTasksInList = tasksList.filter(t => t.day === detoxDays)
    const completedTodayTasks = todayTasksInList.filter(t => t.completed)
    const todayTaskCompleted = todayTasksInList.length > 0 && completedTodayTasks.length === todayTasksInList.length

    let completedTimeStr = ''
    if (todayTaskCompleted && completedTodayTasks.length > 0) {
      const lastCompleted = completedTodayTasks[completedTodayTasks.length - 1]
      if (lastCompleted.date) {
        const time = new Date(lastCompleted.date)
        completedTimeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`
      }
    }

    this.setData({
      detoxDays,
      todayDate,
      todayTask,
      todayTaskCompleted,
      completedTimeStr,
      tasksList
    })
  },

  // 处理任务列表项点击
  handleTaskTap(e) {
    const taskId = e.currentTarget.dataset.taskId

    // 优先从 globalData 读取
    let tasks = app.globalData.tasks
    if (!tasks) {
      tasks = wx.getStorageSync('tasks') || {}
      app.globalData.tasks = tasks
    }

    const task = tasks[taskId]

    if (!task) return

    // 只能完成当天的任务
    if (task.day !== this.data.detoxDays) {
      if (task.day < this.data.detoxDays) {
        wx.showToast({
          title: '任务已过期',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '任务未解锁',
          icon: 'none'
        })
      }
      return
    }

    // 已完成的任务不能再次完成
    if (task.completed) {
      wx.showToast({
        title: '任务已完成',
        icon: 'none'
      })
      return
    }

    // 完成任务
    task.completed = true
    task.date = Date.now()
    tasks[taskId] = task

    // 同时更新缓存和全局数据
    wx.setStorageSync('tasks', tasks)
    app.globalData.tasks = tasks

    // 显示鼓励弹窗
    this.showEncouragementModal()

    // 刷新数据
    this.loadData()
  },

  // 显示鼓励弹窗
  showEncouragementModal() {
    // 随机选择一条鼓励语
    const randomIndex = Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)
    const message = ENCOURAGEMENT_MESSAGES[randomIndex]

    this.setData({
      showEncouragement: true,
      encouragementMessage: message
    })
  },

  // 关闭鼓励弹窗
  closeEncouragement() {
    this.setData({
      showEncouragement: false
    })
  },

  // 阻止冒泡
  stopPropagation() {
    // 阻止事件冒泡，防止点击内容区域关闭弹窗
  }
})
