// app.js
const { DETOX_TASKS } = require('./data/tasks.js')

App({
  onLaunch() {
    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        // 云开发环境ID（需要替换为你的环境ID）
        env: 'production-2gsfdc0z03e879c0',
        traceUser: true
      })
    }

    // 初始化用户数据
    this.initCloudData()
  },

  globalData: {
    userProfile: null,
    assessment: null,
    tasks: null,
    emotions: [],
    cloudReady: false  // 云数据是否就绪
  },

  // 从云端初始化数据
  async initCloudData() {
    console.log('🚀 开始初始化云数据...')
    try {
      const res = await wx.cloud.callFunction({
        name: 'initUserData'
      })

      console.log('📦 云函数返回结果:', res)

      if (res.result.success) {
        const userData = res.result.data
        console.log('✅ 用户数据:', userData)

        // 加载用户基本信息
        if (userData.nickname) {
          this.globalData.userProfile = {
            nickname: userData.nickname,
            age: userData.age
          }
          wx.setStorageSync('userProfile', this.globalData.userProfile)
        }

        // 加载评估结果
        if (userData.assessment) {
          this.globalData.assessment = userData.assessment
          wx.setStorageSync('assessment', this.globalData.assessment)
        }

        // 加载任务（将云端数组格式转为本地对象格式）
        if (userData.tasks && userData.tasks.length > 0) {
          this.globalData.tasks = this.convertTasksArrayToObject(userData.tasks)
          wx.setStorageSync('tasks', this.globalData.tasks)
        }

        // 加载情绪记录
        if (userData.emotions) {
          this.globalData.emotions = userData.emotions
          wx.setStorageSync('emotions', this.globalData.emotions)
        }

        this.globalData.cloudReady = true
        console.log('云数据加载成功')
      }
    } catch (err) {
      console.error('云数据初始化失败，使用本地缓存:', err)
      // 降级到本地缓存
      this.loadLocalData()
    }
  },

  // 将云端任务数组转为本地对象格式
  convertTasksArrayToObject(tasksArray) {
    const tasks = {}
    tasksArray.forEach(task => {
      tasks[task.taskId] = {
        id: task.taskId,
        day: task.day,
        title: task.title,
        desc: task.desc,
        completed: task.completed,
        date: task.completedAt ? new Date(task.completedAt).getTime() : null
      }
    })
    return tasks
  },

  // 加载本地缓存数据（降级方案）
  loadLocalData() {
    this.globalData.userProfile = wx.getStorageSync('userProfile')
    this.globalData.assessment = wx.getStorageSync('assessment')
    this.globalData.tasks = wx.getStorageSync('tasks')
    this.globalData.emotions = wx.getStorageSync('emotions') || []
    this.globalData.cloudReady = false
  },

  // 保存用户资料
  async saveUserProfile(data) {
    this.globalData.userProfile = data
    wx.setStorageSync('userProfile', data)

    // 同步到云端
    try {
      await wx.cloud.callFunction({
        name: 'updateUserData',
        data: {
          type: 'profile',
          data: data
        }
      })
      console.log('用户资料已同步到云端')
    } catch (err) {
      console.error('用户资料同步失败:', err)
    }
  },

  // 保存评估结果
  async saveAssessment(data) {
    this.globalData.assessment = data
    wx.setStorageSync('assessment', data)

    // 同步到云端
    try {
      await wx.cloud.callFunction({
        name: 'updateUserData',
        data: {
          type: 'assessment',
          data: data
        }
      })
      console.log('评估结果已同步到云端')
    } catch (err) {
      console.error('评估结果同步失败:', err)
    }
  },

  // 初始化任务列表（使用50个戒断任务）
  async initTasks() {
    const assessment = wx.getStorageSync('assessment')
    const recoveryDays = assessment.recoveryDays || 50

    // 使用完整的50个戒断任务，根据恢复天数筛选
    const selectedTasks = DETOX_TASKS.filter(t => t.day <= recoveryDays)

    // 转换为任务对象 - 支持一天多个任务
    const tasks = {}
    const tasksArray = []  // 云端存储的数组格式

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

      tasksArray.push({
        taskId: taskId,
        day: template.day,
        title: template.title,
        desc: template.desc,
        completed: false,
        completedAt: null
      })
    })

    this.globalData.tasks = tasks
    wx.setStorageSync('tasks', tasks)

    // 同步到云端
    try {
      await wx.cloud.callFunction({
        name: 'updateUserData',
        data: {
          type: 'initTasks',
          data: {
            tasks: tasksArray
          }
        }
      })
      console.log('任务列表已同步到云端')
    } catch (err) {
      console.error('任务列表同步失败:', err)
    }

    return tasks
  },

  // 完成任务
  async completeTask(taskId) {
    const tasks = wx.getStorageSync('tasks') || this.globalData.tasks
    if (tasks[taskId]) {
      tasks[taskId].completed = true
      tasks[taskId].date = Date.now()
      wx.setStorageSync('tasks', tasks)
      this.globalData.tasks = tasks

      // 同步到云端
      try {
        await wx.cloud.callFunction({
          name: 'updateUserData',
          data: {
            type: 'task',
            data: {
              taskId: taskId,
              day: tasks[taskId].day,
              title: tasks[taskId].title,
              desc: tasks[taskId].desc
            }
          }
        })
        console.log('任务完成已同步到云端')
      } catch (err) {
        console.error('任务完成同步失败:', err)
      }
    }
  },

  // 记录情绪
  async addEmotion(level, note = '') {
    const emotion = {
      date: Date.now(),
      level: level,
      note: note
    }

    const emotions = wx.getStorageSync('emotions') || []
    emotions.push(emotion)
    wx.setStorageSync('emotions', emotions)
    this.globalData.emotions = emotions

    // 同步到云端
    try {
      await wx.cloud.callFunction({
        name: 'updateUserData',
        data: {
          type: 'emotion',
          data: {
            level: level,
            note: note
          }
        }
      })
      console.log('情绪记录已同步到云端')
    } catch (err) {
      console.error('情绪记录同步失败:', err)
    }
  },

  // 计算戒断天数
  getDetoxDays() {
    const assessment = wx.getStorageSync('assessment')
    if (!assessment || !assessment.startDate) return 0
    const days = Math.floor((Date.now() - assessment.startDate) / (1000 * 60 * 60 * 24))
    return days
  }
})
