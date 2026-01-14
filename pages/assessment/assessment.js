// pages/assessment/assessment.js
const app = getApp()

Page({
  data: {
    answers: {
      breakupDays: null,
      stillContact: null,
      checkDynamic: null,
      sleepQuality: null
    },
    canSubmit: false
  },

  handleAnswer(e) {
    const { question, value } = e.currentTarget.dataset
    console.log(value, question, 'ooooooo')
    let actualValue = value

    // 处理布尔值
    if (value === 'true') actualValue = true
    if (value === 'false') actualValue = false

    // 处理数字
    if (!isNaN(value) && value !== '') {
      actualValue = parseInt(value)
    }

    this.setData({
      [`answers.${question}`]: actualValue
    })

    this.checkCanSubmit()
  },

  checkCanSubmit() {
    const { breakupDays, stillContact, checkDynamic, sleepQuality } = this.data.answers
    const canSubmit =
      breakupDays !== null &&
      stillContact !== null &&
      checkDynamic !== null &&
      sleepQuality !== null

    this.setData({ canSubmit })
  },

  calculateStage() {
    const { breakupDays, stillContact, checkDynamic, sleepQuality } = this.data.answers

    // 计算总分（权重计算）
    let score = 0

    // 分手天数（越久分数越高）
    if (breakupDays === 1) score += 10
    else if (breakupDays === 7) score += 20
    else if (breakupDays === 14) score += 30
    else score += 40

    // 是否还联系（不联系分数更高）
    score += stillContact ? 0 : 30

    // 是否刷动态（不刷分数更高）
    score += checkDynamic ? 0 : 20

    // 睡眠质量（越好分数越高）
    score += sleepQuality * 2

    // 根据分数判断阶段
    let stage = ''
    let stageName = ''
    if (score < 40) {
      stage = 'stage1'
      stageName = '情绪崩溃期'
    } else if (score < 70) {
      stage = 'stage2'
      stageName = '戒断期'
    } else {
      stage = 'stage3'
      stageName = '恢复期'
    }

    return { stage, stageName }
  },

  handleSubmit() {
    if (!this.data.canSubmit) return

    const { stage, stageName } = this.calculateStage()

    // 保存评估结果
    const assessment = {
      ...this.data.answers,
      stage: stage,
      stageName: stageName,
      startDate: Date.now()
    }
    app.saveAssessment(assessment)

    // 初始化任务列表
    app.initTasks()

    // 跳转到主页
    wx.reLaunch({
      url: '/pages/home/home'
    })
  }
})
