const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 格式化日期为 MM月DD日
const formatDate = timestamp => {
  const date = new Date(timestamp)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

// 计算天数差
const getDaysDiff = (startTimestamp, endTimestamp = Date.now()) => {
  return Math.floor((endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24))
}

module.exports = {
  formatTime,
  formatDate,
  getDaysDiff
}
