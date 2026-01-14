# 逃出失恋 - 小程序 MVP

## 项目简介

「逃出失恋」是一款帮助失恋人群走出情感困境的微信小程序。通过科学的戒断计划、进度可视化和情绪急救工具，帮助用户不再沉溺失恋。

**核心理念：** 不陪你难过，而是帮你脱身

## 功能特性

### ✅ 已实现功能（MVP版本）

1. **用户信息录入**
   - 昵称设置
   - 性别选择

2. **失恋阶段识别**
   - 4个问题评估
   - 智能判断失恋阶段
   - 生成个性化报告

3. **戒断任务系统**（核心功能）
   - Day 1：删除聊天记录
   - Day 3：24小时不看TA动态
   - Day 7：写一封永不发送的信
   - Day 14：第一次社交复健
   - Day 21：情绪复盘
   - 任务解锁机制
   - 完成打卡功能

4. **进度可视化**
   - 戒断天数统计
   - 任务完成进度
   - 恢复阶段显示
   - 进度条展示

5. **情绪急救包**
   - 深呼吸练习（30秒）
   - "想TA了"分散注意力
   - 情绪记录
   - 心理热线查询

## 技术栈

- 微信小程序原生开发
- 本地存储（localStorage）
- 无需后端服务器

## 目录结构

```
├── pages/
│   ├── welcome/          # 欢迎页
│   ├── userInfo/         # 用户信息录入
│   ├── assessment/       # 失恋阶段评估
│   ├── home/             # 主页（核心功能）
│   └── emergency/        # 情绪急救包
├── utils/
│   └── util.js           # 工具函数
├── app.js                # 全局逻辑
├── app.json              # 全局配置
└── app.wxss              # 全局样式
```

## 数据结构

### 用户资料（userProfile）
```javascript
{
  nickname: string,
  gender: 'male' | 'female' | 'other'
}
```

### 评估结果（assessment）
```javascript
{
  breakupDays: number,      // 分手天数
  stillContact: boolean,    // 是否还联系
  checkDynamic: boolean,    // 是否刷动态
  sleepQuality: number,     // 睡眠质量 1-5
  stage: string,            // 失恋阶段
  stageName: string,        // 阶段名称
  startDate: timestamp      // 开始戒断日期
}
```

### 任务列表（tasks）
```javascript
{
  [taskId]: {
    id: string,
    day: number,
    title: string,
    desc: string,
    completed: boolean,
    date: timestamp | null
  }
}
```

## 如何运行

1. 安装微信开发者工具
2. 导入本项目
3. 编译运行

## 下一步计划

### 功能优化
- [ ] 添加情绪波动曲线图表
- [ ] 更多戒断任务（扩展到30天）
- [ ] 每日心理小贴士
- [ ] 成就系统

### 技术优化
- [ ] 云开发集成（数据同步）
- [ ] 推送通知（任务提醒）
- [ ] 分享功能
- [ ] 数据导出

### 运营准备
- [ ] 小红书内容策划
- [ ] 抖音短视频脚本
- [ ] 用户反馈收集机制

## 注意事项

- 本工具不替代专业心理咨询
- 数据仅存储在本地
- 如遇紧急情况请拨打心理热线

## 开发者

独立开发者项目

## 许可证

Private - All Rights Reserved
