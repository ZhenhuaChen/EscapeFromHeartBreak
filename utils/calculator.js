// utils/calculator.js - 智能天数计算算法

/**
 * 恢复天数枚举：21, 25, 30, 35, 40, 45, 50, 54, 57, 60天
 * 根据10个问题的回答，计算出最适合的恢复天数
 */

const RECOVERY_DAYS = [21, 25, 30, 35, 40, 45, 50, 54, 57, 60]

/**
 * 计算恢复天数
 * @param {Object} answers - 问卷答案对象
 * @returns {Number} - 恢复天数
 */
function calculateRecoveryDays(answers) {
  let score = 0

  // 1. 性别 (权重较小)
  // 男性: 1, 女性: 2
  // 无影响，跳过

  // 2. 分手多久了 (权重: 15分)
  // 值越小(分手越早)，需要的恢复时间越长
  const breakupTimeScore = {
    1: 15,  // 不到1周 - 最需要时间
    2: 12,  // 不到1个月
    3: 9,   // 1-3个月
    4: 6,   // 3-6个月
    5: 3    // 6个月以上 - 已经恢复一些
  }
  score += breakupTimeScore[answers.breakupTime] || 0

  // 3. 关系持续时间 (权重: 15分)
  // 关系越长，需要的恢复时间越长
  const durationScore = {
    1: 3,   // 不到1个月
    2: 6,   // 1-6个月
    3: 9,   // 6-12个月
    4: 12,  // 1-3年
    5: 14,  // 3-5年
    6: 15   // 5年以上 - 最需要时间
  }
  score += durationScore[answers.relationshipDuration] || 0

  // 4. 当前感觉 (权重: 15分)
  // 值越小(感觉越差)，需要的恢复时间越长
  const feelingScore = {
    1: 15,  // 还在震惊中
    2: 12,  // 非常受伤
    3: 9,   // 慢慢接受
    4: 6,   // 开始前行
    5: 3    // 感觉好多了
  }
  score += feelingScore[answers.currentFeeling] || 0

  // 5. 联系频率 (权重: 10分)
  // 联系越频繁，恢复越难
  const contactScore = {
    1: 10,  // 每天都有
    2: 7,   // 偶尔
    3: 4,   // 很少
    4: 1    // 从不
  }
  score += contactScore[answers.contactFrequency] || 0

  // 6. 谁结束的关系 (权重: 10分)
  // 被动分手需要更多时间
  const whoEndedScore = {
    1: 5,   // 我结束的
    2: 10,  // 前任结束的 - 最难接受
    3: 7,   // 相互结束
    4: 8    // 很复杂
  }
  score += whoEndedScore[answers.whoEnded] || 0

  // 7. 查看动态频率 (权重: 10分)
  // 查看越频繁，越难放下
  const checkDynamicScore = {
    1: 10,  // 每天多次
    2: 7,   // 每天一次
    3: 4,   // 每隔几天
    4: 1    // 从不/已拉黑
  }
  score += checkDynamicScore[answers.checkDynamic] || 0

  // 8. 最大困扰 (权重: 10分)
  const troubleScore = {
    1: 10,  // 经常想念前任
    2: 8,   // 感到迷失和空虚
    3: 7,   // 想太多
    4: 8,   // 感到被拒绝
    5: 9,   // 经常哭泣
    6: 8,   // 感到孤独
    7: 7    // 感到自责
  }
  score += troubleScore[answers.biggestTrouble] || 0

  // 9. 应对方式 (权重: 8分)
  const copingScore = {
    1: 4,   // 保持忙碌 - 积极应对
    2: 8,   // 自我隔离 - 需要更多帮助
    3: 3,   // 和朋友聊天 - 积极应对
    4: 6,   // 放声哭泣 - 需要时间
    5: 8    // 不知道怎么办 - 需要引导
  }
  score += copingScore[answers.copingMethod] || 0

  // 10. 愈合进度 (权重: 7分)
  const healingScore = {
    1: 7,   // 完全没有
    2: 5,   // 慢慢的
    3: 3,   // 有进展
    4: 1    // 感觉好多了
  }
  score += healingScore[answers.healingProgress] || 0

  // 总分范围: 0-100
  // 将分数映射到10个恢复天数枚举
  // 分数越高，需要的恢复天数越多

  const index = Math.min(Math.floor(score / 10), 9)
  return RECOVERY_DAYS[index]
}

module.exports = {
  calculateRecoveryDays,
  RECOVERY_DAYS
}
