// 云函数：更新用户数据（通用接口）
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { type, data } = event
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID

  try {
    let updateData = {}

    switch(type) {
      case 'profile':
        // 更新用户基本信息
        updateData = {
          nickname: data.nickname,
          age: data.age
        }
        break

      case 'assessment':
        // 保存评估结果
        updateData = {
          assessment: {
            answers: data.answers,
            goal: data.goal,
            recoveryDays: data.recoveryDays,
            startDate: data.startDate,
            createdAt: new Date()
          }
        }
        break

      case 'initTasks':
        // 初始化任务列表（从result页面调用）
        updateData = {
          tasks: data.tasks  // 直接设置任务数组
        }
        break

      case 'task':
        // 完成单个任务
        const taskData = {
          taskId: data.taskId,
          day: data.day,
          title: data.title,
          desc: data.desc,
          completed: true,
          completedAt: new Date()
        }

        // 检查任务是否已存在（使用 where 查询）
        const queryRes = await db.collection('users')
          .where({ _openid: openId })
          .get()

        if (queryRes.data && queryRes.data.length > 0) {
          const existingTasks = queryRes.data[0].tasks || []
          const taskIndex = existingTasks.findIndex(t => t.taskId === data.taskId)

          if (taskIndex >= 0) {
            // 更新已有任务
            updateData = {
              [`tasks.${taskIndex}`]: taskData,
              'stats.totalCompleted': _.inc(1),
              'stats.lastUpdated': new Date()
            }
          } else {
            // 添加新任务
            updateData = {
              tasks: _.push(taskData),
              'stats.totalCompleted': _.inc(1),
              'stats.lastUpdated': new Date()
            }
          }
        } else {
          // 用户不存在，返回错误
          return {
            success: false,
            error: '用户不存在，请先初始化'
          }
        }
        break

      case 'emotion':
        // 记录情绪
        updateData = {
          emotions: _.push({
            level: data.level,
            note: data.note || '',
            recordedAt: new Date()
          })
        }
        break

      default:
        return {
          success: false,
          error: '未知的更新类型'
        }
    }

    // 查询用户文档 ID
    const userQuery = await db.collection('users')
      .where({ _openid: openId })
      .get()

    if (!userQuery.data || userQuery.data.length === 0) {
      return {
        success: false,
        error: '用户不存在，请先调用 initUserData'
      }
    }

    const userId = userQuery.data[0]._id

    // 执行更新
    await db.collection('users').doc(userId).update({
      data: updateData
    })

    return {
      success: true,
      message: '数据更新成功'
    }

  } catch (err) {
    console.error('更新用户数据失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
