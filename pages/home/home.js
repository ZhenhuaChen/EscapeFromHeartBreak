// pages/home/home.js
const app = getApp()

Page({
  data: {
    userProfile: {},
    assessment: {},
    detoxDays: 0,
    recoveryDays: 0,
    tasksList: [],
    completedTasksCount: 0,
    totalTasksCount: 0,
    progressPercent: 0,
    progressTip: ''
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
    const tasks = wx.getStorageSync('tasks') || {}

    // 计算戒断天数和总恢复天数
    const detoxDays = app.getDetoxDays()
    const recoveryDays = assessment.recoveryDays || 30

    // 转换任务为数组并判断是否解锁
    const tasksList = Object.values(tasks).map(task => {
      const unlocked = detoxDays >= task.day
      let dateStr = ''
      if (task.date) {
        const date = new Date(task.date)
        dateStr = `${date.getMonth() + 1}月${date.getDate()}日`
      }
      return {
        ...task,
        unlocked,
        dateStr
      }
    })

    // 计算完成任务数和总任务数
    const totalTasksCount = tasksList.length
    const completedTasksCount = tasksList.filter(t => t.completed).length

    // 计算进度百分比
    const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0

    // 生成进度提示
    let progressTip = ''
    if (progressPercent === 0) {
      progressTip = '开始你的第一个任务吧'
    } else if (progressPercent < 50) {
      progressTip = '继续加油，你已经迈出了第一步'
    } else if (progressPercent < 100) {
      progressTip = '做得很好，继续保持'
    } else {
      progressTip = '恭喜你完成所有任务！'
    }

    this.setData({
      userProfile,
      assessment,
      detoxDays,
      recoveryDays,
      tasksList,
      completedTasksCount,
      totalTasksCount,
      progressPercent,
      progressTip
    })
  },

  handleToggleTask(e) {
    const taskId = e.currentTarget.dataset.id
    const task = this.data.tasksList.find(t => t.id === taskId)

    if (!task.unlocked) {
      wx.showToast({
        title: `Day ${task.day} 才能解锁此任务`,
        icon: 'none'
      })
      return
    }

    if (task.completed) {
      wx.showModal({
        title: '提示',
        content: '确定要取消完成此任务吗？',
        success: (res) => {
          if (res.confirm) {
            this.uncompleteTask(taskId)
          }
        }
      })
    } else {
      wx.showModal({
        title: '确认完成',
        content: `确定已完成「${task.title}」吗？`,
        success: (res) => {
          if (res.confirm) {
            this.completeTask(taskId)
          }
        }
      })
    }
  },

  completeTask(taskId) {
    app.completeTask(taskId)
    wx.showToast({
      title: '太棒了！',
      icon: 'success'
    })
    this.loadData()
  },

  uncompleteTask(taskId) {
    const tasks = wx.getStorageSync('tasks') || {}
    if (tasks[taskId]) {
      tasks[taskId].completed = false
      tasks[taskId].date = null
      wx.setStorageSync('tasks', tasks)
    }
    this.loadData()
  },

  goToEmergency() {
    wx.navigateTo({
      url: '/pages/emergency/emergency'
    })
  },

  recordEmotion() {
    wx.showActionSheet({
      itemList: ['很糟糕', '不太好', '一般', '还可以', '很好'],
      success: (res) => {
        const level = res.tapIndex + 1
        app.addEmotion(level)
        wx.showToast({
          title: '记录成功',
          icon: 'success'
        })
      }
    })
  }
})
