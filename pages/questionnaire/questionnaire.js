// pages/questionnaire/questionnaire.js
const app = getApp()

// 10个问题定义
const QUESTIONS = [
  {
    id: 'gender',
    title: '性别',
    options: [
      { label: '男性', value: 1 },
      { label: '女性', value: 2 }
    ]
  },
  {
    id: 'breakupTime',
    title: '分手多久了？',
    options: [
      { label: '不到1周', value: 1 },
      { label: '不到1个月', value: 2 },
      { label: '1-3个月', value: 3 },
      { label: '3-6个月', value: 4 },
      { label: '6个月以上', value: 5 }
    ]
  },
  {
    id: 'relationshipDuration',
    title: '这段关系持续了多久？',
    options: [
      { label: '不到1个月', value: 1 },
      { label: '1-6个月', value: 2 },
      { label: '6-12个月', value: 3 },
      { label: '1-3年', value: 4 },
      { label: '3-5年', value: 5 },
      { label: '5年以上', value: 6 }
    ]
  },
  {
    id: 'currentFeeling',
    title: '你现在感觉如何？',
    options: [
      { label: '还在震惊中', value: 1 },
      { label: '非常受伤和情绪化', value: 2 },
      { label: '沮丧，但慢慢开始接受', value: 3 },
      { label: '翻篇了，开始继续前行', value: 4 },
      { label: '已经感觉好多了', value: 5 }
    ]
  },
  {
    id: 'contactFrequency',
    title: '你和前任还有联系吗？',
    options: [
      { label: '是的，每天都有', value: 1 },
      { label: '偶尔', value: 2 },
      { label: '很少', value: 3 },
      { label: '从不', value: 4 }
    ]
  },
  {
    id: 'whoEnded',
    title: '是谁结束了这段关系？',
    options: [
      { label: '我结束的', value: 1 },
      { label: '我的前任', value: 2 },
      { label: '相互结束的', value: 3 },
      { label: '很复杂，说不清楚', value: 4 }
    ]
  },
  {
    id: 'checkDynamic',
    title: '还在网上关注你的前任动态吗？',
    options: [
      { label: '每天多次', value: 1 },
      { label: '每天一次', value: 2 },
      { label: '每隔几天一次', value: 3 },
      { label: '从不/已拉黑', value: 4 }
    ]
  },
  {
    id: 'biggestTrouble',
    title: '目前最大的困扰是什么？',
    options: [
      { label: '经常想念前任', value: 1 },
      { label: '感到迷失和空虚', value: 2 },
      { label: '凡事容易想太多', value: 3 },
      { label: '感到被拒绝', value: 4 },
      { label: '我经常哭泣', value: 5 },
      { label: '即使和别人在一起也感到孤独', value: 6 },
      { label: '总是感到自责', value: 7 }
    ]
  },
  {
    id: 'copingMethod',
    title: '你通常如何处理痛苦？',
    options: [
      { label: '保持忙碌，分散注意力', value: 1 },
      { label: '自我隔离', value: 2 },
      { label: '和朋友聊天', value: 3 },
      { label: '放声哭泣', value: 4 },
      { label: '不知道怎么办', value: 5 }
    ]
  },
  {
    id: 'healingProgress',
    title: '你感觉自己在愈合吗？',
    options: [
      { label: '完全没有', value: 1 },
      { label: '慢慢的，一步一步', value: 2 },
      { label: '是的，我已经取得了进展', value: 3 },
      { label: '我感觉好多了', value: 4 }
    ]
  }
]

Page({
  data: {
    currentIndex: -1, // -1 表示用户信息收集阶段
    currentQuestion: {},
    answers: {},
    progress: 0,
    nickname: '',
    age: '',
    canSubmit: false
  },

  onLoad() {
    this.initQuestionnaire()
  },

  initQuestionnaire() {
    // 从用户信息收集开始
    this.setData({
      currentIndex: -1,
      progress: 0
    })
  },

  // 用户信息输入
  handleNicknameInput(e) {
    const nickname = e.detail.value.trim()
    this.setData({ nickname })
    this.checkCanSubmit()
  },

  handleAgeInput(e) {
    const age = e.detail.value.trim()
    this.setData({ age })
    this.checkCanSubmit()
  },

  checkCanSubmit() {
    const canSubmit = this.data.nickname.length > 0 && this.data.age.length > 0
    this.setData({ canSubmit })
  },

  handleUserInfoNext() {
    if (!this.data.canSubmit) return

    const age = parseInt(this.data.age)
    if (age < 1 || age > 120) {
      wx.showToast({
        title: '请输入有效年龄',
        icon: 'none'
      })
      return
    }

    // 保存用户信息
    const userProfile = {
      nickname: this.data.nickname,
      age: age
    }
    const app = getApp()
    app.saveUserProfile(userProfile)

    // 进入第一个问题
    this.setData({
      currentIndex: 0,
      currentQuestion: QUESTIONS[0],
      progress: 0
    })
  },

  handleSelectOption(e) {
    const value = parseInt(e.currentTarget.dataset.value)
    const currentQuestion = this.data.currentQuestion

    // 保存答案
    const answers = {
      ...this.data.answers,
      [currentQuestion.id]: value
    }
    this.setData({ answers })

    // 延迟跳转到下一题
    setTimeout(() => {
      this.nextQuestion()
    }, 300)
  },

  nextQuestion() {
    const nextIndex = this.data.currentIndex + 1

    if (nextIndex < QUESTIONS.length) {
      // 还有问题，继续
      const progress = Math.round((nextIndex / QUESTIONS.length) * 100)
      this.setData({
        currentIndex: nextIndex,
        currentQuestion: QUESTIONS[nextIndex],
        progress
      })
    } else {
      // 问题回答完毕，保存并跳转到目标选择页
      wx.setStorageSync('questionnaireAnswers', this.data.answers)
      wx.redirectTo({
        url: '/pages/goalSelect/goalSelect'
      })
    }
  }
})
