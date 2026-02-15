# 云开发部署指南

## 📦 项目架构

本项目使用微信云开发，采用精简架构：
- **2张数据库表**：users（用户表）
- **2个云函数**：initUserData、updateUserData

---

## 🚀 部署步骤

### 第一步：开通云开发

1. 在微信开发者工具中打开项目
2. 点击顶部菜单 **云开发** → **开通云开发**
3. 创建一个新的云环境（建议命名为 `escape-love-prod`）
4. 等待环境创建完成（约需3-5分钟）

### 第二步：配置云环境ID

修改 `app.js` 中的云环境配置：

```javascript
wx.cloud.init({
  env: 'your-env-id',  // 替换为你的云环境ID（在云开发控制台查看）
  traceUser: true
})
```

### 第三步：创建数据库集合

1. 打开 **云开发控制台** → **数据库**
2. 点击 **添加集合**
3. 创建集合名称：`users`
4. 权限设置：选择 **仅创建者可读写**

**users 集合索引配置：**
```json
{
  "索引名": "_openid_",
  "字段": "_openid",
  "类型": "单字段",
  "唯一": true
}
```

### 第四步：上传云函数

#### 4.1 上传 initUserData 云函数

1. 在微信开发者工具中，右键点击 `cloudfunctions/initUserData` 文件夹
2. 选择 **云函数** → **上传并部署：云端安装依赖**
3. 等待上传完成（约需1-2分钟）

#### 4.2 上传 updateUserData 云函数

1. 右键点击 `cloudfunctions/updateUserData` 文件夹
2. 选择 **云函数** → **上传并部署：云端安装依赖**
3. 等待上传完成

### 第五步：测试云函数

在微信开发者工具的控制台中测试：

```javascript
// 测试 initUserData
wx.cloud.callFunction({
  name: 'initUserData'
}).then(res => {
  console.log('测试成功:', res)
})

// 测试 updateUserData
wx.cloud.callFunction({
  name: 'updateUserData',
  data: {
    type: 'profile',
    data: { nickname: '测试用户', age: 25 }
  }
}).then(res => {
  console.log('更新成功:', res)
})
```

---

## 📊 数据库设计

### users 集合结构

```javascript
{
  _openid: String,              // 微信openId（自动生成）
  _id: String,                  // 文档ID（等于_openid）

  // 基本信息
  nickname: String,
  age: Number,
  createdAt: Date,

  // 评估结果（嵌入式文档）
  assessment: {
    answers: Object,            // 10个问题的答案
    goal: Number,               // 选择的目标
    recoveryDays: Number,       // 恢复天数
    startDate: Date,            // 开始日期
    createdAt: Date
  },

  // 任务列表（数组）
  tasks: [
    {
      taskId: String,           // task1, task2...
      day: Number,              // 第几天
      title: String,
      desc: String,
      completed: Boolean,
      completedAt: Date
    }
  ],

  // 情绪记录（数组）
  emotions: [
    {
      level: Number,            // 1-5
      note: String,
      recordedAt: Date
    }
  ],

  // 统计数据
  stats: {
    totalCompleted: Number,     // 总完成任务数
    currentStreak: Number,      // 当前连续天数
    longestStreak: Number,      // 最长连续天数
    lastUpdated: Date
  }
}
```

---

## 🔧 云函数说明

### 1. initUserData（初始化/获取用户数据）

**功能**：首次访问时创建用户记录，后续访问返回用户数据

**调用方式**：
```javascript
wx.cloud.callFunction({
  name: 'initUserData'
})
```

**返回数据**：
```javascript
{
  success: true,
  data: { /* 用户完整数据 */ },
  isNewUser: false  // 是否是新用户
}
```

### 2. updateUserData（更新用户数据）

**功能**：通用更新接口，支持5种数据类型

**调用方式**：

#### 2.1 更新用户基本信息
```javascript
wx.cloud.callFunction({
  name: 'updateUserData',
  data: {
    type: 'profile',
    data: { nickname: '小明', age: 25 }
  }
})
```

#### 2.2 保存评估结果
```javascript
wx.cloud.callFunction({
  name: 'updateUserData',
  data: {
    type: 'assessment',
    data: {
      answers: { /* 问卷答案 */ },
      goal: 3,
      recoveryDays: 30,
      startDate: new Date()
    }
  }
})
```

#### 2.3 初始化任务列表
```javascript
wx.cloud.callFunction({
  name: 'updateUserData',
  data: {
    type: 'initTasks',
    data: {
      tasks: [
        { taskId: 'task1', day: 1, title: '...', desc: '...', completed: false }
      ]
    }
  }
})
```

#### 2.4 完成任务
```javascript
wx.cloud.callFunction({
  name: 'updateUserData',
  data: {
    type: 'task',
    data: {
      taskId: 'task1',
      day: 1,
      title: '开始记录心情',
      desc: '...'
    }
  }
})
```

#### 2.5 记录情绪
```javascript
wx.cloud.callFunction({
  name: 'updateUserData',
  data: {
    type: 'emotion',
    data: {
      level: 3,
      note: '今天心情不错'
    }
  }
})
```

---

## 🔒 数据安全

### 权限设置

在云开发控制台 → 数据库 → users集合 → 权限设置：

```javascript
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

这样可以确保：
- ✅ 用户只能读写自己的数据
- ❌ 无法访问其他用户的数据

---

## 🐛 常见问题

### Q1: 云函数调用失败，提示"cloud init error"

**解决方案**：
1. 检查 `app.js` 中的 `env` 是否配置正确
2. 确认云开发已开通且环境已创建
3. 重新编译小程序

### Q2: 数据库写入失败，提示"permission denied"

**解决方案**：
1. 检查 users 集合的权限设置
2. 确认使用的是 `_openid` 作为文档ID
3. 检查云函数是否正确获取 `wxContext.OPENID`

### Q3: 云函数上传后无法调用

**解决方案**：
1. 右键云函数文件夹 → **云函数** → **云端安装依赖**
2. 检查 `package.json` 中的依赖版本
3. 在云开发控制台查看云函数日志

### Q4: 本地测试正常，真机调用失败

**解决方案**：
1. 检查小程序是否添加了云开发白名单
2. 确认云环境状态正常（不欠费）
3. 查看云开发控制台的调用日志

---

## 📈 性能优化建议

### 1. 减少云函数调用次数
```javascript
// ❌ 不好的做法：频繁调用
for (let i = 0; i < 10; i++) {
  await wx.cloud.callFunction({ name: 'updateUserData', ... })
}

// ✅ 好的做法：批量更新
await wx.cloud.callFunction({
  name: 'updateUserData',
  data: { type: 'batchUpdate', items: [...] }
})
```

### 2. 使用本地缓存作为降级方案
```javascript
// 本项目已实现：云端失败时自动使用本地缓存
try {
  await wx.cloud.callFunction(...)
} catch (err) {
  // 使用本地缓存
  wx.setStorageSync('tasks', tasks)
}
```

### 3. 控制数据库文档大小
- 单个用户文档建议控制在 **200KB** 以内
- 情绪记录超过 **500条** 时考虑归档旧数据
- 任务记录约 **100条**，文档大小在 **30KB** 左右

---

## 💰 成本估算

### 免费额度（每月）
- 数据库读操作：**5万次**
- 数据库写操作：**3万次**
- 云函数调用：**10万次**
- 云存储容量：**5GB**

### 本项目预估用量（1000个活跃用户/月）
- 数据库读：约 **15000次**（每用户15次/月）
- 数据库写：约 **8000次**（每用户8次/月）
- 云函数调用：约 **23000次**

**结论：完全在免费额度内** ✅

---

## 📞 技术支持

如遇问题，请查看：
1. [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
2. [云函数开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions.html)
3. [云数据库文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database.html)
