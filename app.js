// app.js
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

  // 初始化任务列表（根据恢复天数动态生成）
  initTasks() {
    const assessment = wx.getStorageSync('assessment')
    const recoveryDays = assessment.recoveryDays || 30

    // 基础任务模板
    const taskTemplates = [
      { day: 1, title: '开始记录心情', desc: '每天记录自己的情绪变化' },
      { day: 3, title: '清理联系方式', desc: '删除或隐藏聊天记录和照片' },
      { day: 5, title: '24小时不看TA动态', desc: '一整天不查看对方的社交媒体' },
      { day: 7, title: '写一封永不发送的信', desc: '把想说的话写下来，释放情绪' },
      { day: 10, title: '尝试新的兴趣', desc: '开始学习一项新技能或爱好' },
      { day: 14, title: '第一次社交复健', desc: '主动约朋友见面或参加活动' },
      { day: 18, title: '整理生活空间', desc: '清理房间，扔掉旧物，迎接新生活' },
      { day: 21, title: '运动打卡', desc: '开始规律运动，释放压力' },
      { day: 25, title: '感恩清单', desc: '列出生活中值得感恩的事情' },
      { day: 30, title: '情绪复盘', desc: '回顾这段时间的变化，记录成长' }
    ]

    // 根据恢复天数筛选任务
    const selectedTasks = taskTemplates.filter(t => t.day <= recoveryDays)

    // 转换为任务对象
    const tasks = {}
    selectedTasks.forEach(template => {
      const taskId = `day${template.day}`
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
    return 2
    const assessment = wx.getStorageSync('assessment')
    if (!assessment || !assessment.startDate) return 0
    const days = Math.floor((Date.now() - assessment.startDate) / (1000 * 60 * 60 * 24))
    return days
  }
})
