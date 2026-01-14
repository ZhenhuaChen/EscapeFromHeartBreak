// pages/result/result.js
const app = getApp()
const calculator = require('../../utils/calculator.js')

Page({
  data: {
    showResult: false,
    recoveryDays: 0,
    analysisItems: [
      { text: '持续时间和情感影响', active: false },
      { text: '分手原因与我回方向', active: false },
      { text: '前任联系频率', active: false }
    ]
  },

  onLoad() {
    this.startCalculating()
  },

  startCalculating() {
    // 模拟分析过程
    setTimeout(() => {
      this.setData({
        'analysisItems[0].active': true
      })
    }, 800)

    setTimeout(() => {
      this.setData({
        'analysisItems[1].active': true
      })
    }, 1600)

    setTimeout(() => {
      this.setData({
        'analysisItems[2].active': true
      })
    }, 2400)

    // 3秒后显示结果
    setTimeout(() => {
      this.calculateAndShowResult()
    }, 3200)
  },

  calculateAndShowResult() {
    // 获取问卷答案
    const answers = wx.getStorageSync('questionnaireAnswers') || {}
    const selectedGoal = wx.getStorageSync('selectedGoal')

    // 计算恢复天数
    const recoveryDays = calculator.calculateRecoveryDays(answers)

    // 保存评估结果
    const assessment = {
      answers: answers,
      goal: selectedGoal,
      recoveryDays: recoveryDays,
      startDate: Date.now()
    }
    app.saveAssessment(assessment)

    // 初始化任务
    app.initTasks()

    // 显示结果
    this.setData({
      recoveryDays: recoveryDays,
      showResult: true
    })
  },

  goToHome() {
    wx.reLaunch({
      url: '/pages/home/home'
    })
  }
})
