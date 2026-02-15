// 云函数：初始化/获取用户数据
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID

  try {
    // 使用 where 查询用户数据（避免 doc().get() 在文档不存在时报错）
    const queryRes = await db.collection('users')
      .where({
        _openid: openId
      })
      .get()

    // 如果用户存在，直接返回
    if (queryRes.data && queryRes.data.length > 0) {
      return {
        success: true,
        data: queryRes.data[0],
        isNewUser: false
      }
    }

    // 用户不存在，创建新用户
    const newUser = {
      _openid: openId,
      nickname: '',
      age: 0,
      createdAt: new Date(),

      // 评估结果
      assessment: null,

      // 任务数组
      tasks: [],

      // 情绪记录数组
      emotions: [],

      // 统计数据
      stats: {
        totalCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastUpdated: new Date()
      }
    }

    // 创建新用户文档
    const addRes = await db.collection('users').add({
      data: newUser
    })

    console.log('新用户创建成功，文档ID:', addRes._id)

    return {
      success: true,
      data: {
        ...newUser,
        _id: addRes._id
      },
      isNewUser: true
    }

  } catch (err) {
    console.error('初始化用户数据失败:', err)
    return {
      success: false,
      error: err.message,
      errCode: err.errCode || 'unknown'
    }
  }
}
