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
    customTasks: [],
    showEncouragement: false,
    encouragementMessage: '',
    showAddDialog: false,
    newTaskContent: ''
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

    // 获取今日的戒断任务
    let tasks = app.globalData.tasks
    if (!tasks) {
      tasks = wx.getStorageSync('tasks') || {}
      app.globalData.tasks = tasks
    }
    const allTasks = Object.values(tasks)
    const todayTasks = allTasks.filter(task => task.day === detoxDays)

    // 获取今天的第一个任务作为"今日任务"展示
    const todayTask = DETOX_TASKS.filter(t => t.day === detoxDays)[0] ||
                      { title: '休息日', desc: '今天没有新任务，继续保持！' }

    // 检查今日任务完成情况
    const completedTodayTasks = todayTasks.filter(t => t.completed)
    const todayTaskCompleted = todayTasks.length > 0 && completedTodayTasks.length === todayTasks.length

    let completedTimeStr = ''
    if (todayTaskCompleted && completedTodayTasks.length > 0) {
      const lastCompleted = completedTodayTasks[completedTodayTasks.length - 1]
      if (lastCompleted.date) {
        const time = new Date(lastCompleted.date)
        completedTimeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`
      }
    }

    // 加载自定义任务
    const customTasks = this.loadCustomTasks()

    this.setData({
      detoxDays,
      todayDate,
      todayTask,
      todayTaskCompleted,
      completedTimeStr,
      tasksList: todayTasks,
      customTasks
    })
  },

  // 加载自定义任务
  loadCustomTasks() {
    const tasks = wx.getStorageSync('customTasks') || []
    return tasks.map(task => {
      let completedTimeStr = ''
      if (task.completed && task.completedTime) {
        const time = new Date(task.completedTime)
        completedTimeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`
      }
      return {
        ...task,
        completedTimeStr
      }
    })
  },

  // 处理今日戒断任务点击
  handleTaskTap(e) {
    const taskId = e.currentTarget.dataset.taskId
    let tasks = app.globalData.tasks
    if (!tasks) {
      tasks = wx.getStorageSync('tasks') || {}
      app.globalData.tasks = tasks
    }

    const task = tasks[taskId]
    if (!task) return

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

    // 同步到云端
    app.completeTask(taskId)

    // 显示鼓励弹窗
    this.showEncouragementModal()

    // 刷新数据
    this.loadData()
  },

  // 显示添加任务弹窗
  showAddTaskDialog() {
    this.setData({
      showAddDialog: true,
      newTaskContent: ''
    })
  },

  // 关闭添加任务弹窗
  closeAddDialog() {
    this.setData({
      showAddDialog: false,
      newTaskContent: ''
    })
  },

  // 输入任务内容
  handleTaskInput(e) {
    this.setData({
      newTaskContent: e.detail.value
    })
  },

  // 添加自定义任务
  addCustomTask() {
    const content = this.data.newTaskContent.trim()
    if (!content) {
      wx.showToast({
        title: '请输入任务内容',
        icon: 'none'
      })
      return
    }

    const customTasks = wx.getStorageSync('customTasks') || []

    if (customTasks.length >= 5) {
      wx.showToast({
        title: '最多只能添加5个任务',
        icon: 'none'
      })
      return
    }

    const newTask = {
      id: Date.now().toString(),
      content: content,
      completed: false,
      completedTime: null,
      createdTime: Date.now()
    }

    customTasks.push(newTask)
    wx.setStorageSync('customTasks', customTasks)

    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })

    this.closeAddDialog()
    this.loadData()
  },

  // 切换自定义任务完成状态
  toggleCustomTask(e) {
    const taskId = e.currentTarget.dataset.id
    const customTasks = wx.getStorageSync('customTasks') || []

    const taskIndex = customTasks.findIndex(t => t.id === taskId)
    if (taskIndex >= 0) {
      customTasks[taskIndex].completed = !customTasks[taskIndex].completed
      customTasks[taskIndex].completedTime = customTasks[taskIndex].completed ? Date.now() : null

      wx.setStorageSync('customTasks', customTasks)

      if (customTasks[taskIndex].completed) {
        wx.showToast({
          title: '完成了一项任务！',
          icon: 'success'
        })
      }

      this.loadData()
    }
  },

  // 删除自定义任务
  deleteCustomTask(e) {
    const taskId = e.currentTarget.dataset.id

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          const customTasks = wx.getStorageSync('customTasks') || []
          const newTasks = customTasks.filter(t => t.id !== taskId)
          wx.setStorageSync('customTasks', newTasks)

          wx.showToast({
            title: '已删除',
            icon: 'success'
          })

          this.loadData()
        }
      }
    })
  },

  // 显示鼓励弹窗
  showEncouragementModal() {
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
