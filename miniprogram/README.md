# InvestTracker 微信小程序

基于 React Web 项目转换的微信小程序版本。

## 项目结构

```
miniprogram/
├── pages/              # 页面目录
│   ├── index/         # 首页（仪表板）
│   ├── login/         # 登录页
│   ├── register/      # 注册页
│   ├── holdings/      # 持仓管理
│   ├── stocks/        # 行情查询
│   ├── alerts/        # 价格提醒
│   └── profile/       # 个人中心
├── components/         # 组件目录
│   ├── charts/        # 图表组件
│   ├── stocks/        # 股票相关组件
│   └── common/        # 通用组件
├── utils/             # 工具函数
│   └── request.js     # API请求封装
├── assets/            # 静态资源
│   └── icons/         # TabBar图标
├── app.js             # 小程序入口文件
├── app.json           # 小程序配置文件
├── app.wxss           # 全局样式
└── sitemap.json       # 站点地图配置
```

## 功能模块

### 1. 用户认证
- 登录
- 注册
- 退出登录

### 2. 首页（仪表板）
- 总资产统计
- 总盈亏统计
- 盈利/亏损持仓数量
- 资产配置图表（待集成 echarts-for-weixin）
- 盈亏排行榜
- 更新价格功能

### 3. 持仓管理
- 持仓列表展示
- 添加持仓（待实现）
- 编辑持仓（待实现）
- 卖出持仓（待实现）
- 删除持仓
- 更新价格

### 4. 行情查询
- 股票搜索
- 实时价格显示
- K线图（待实现）
- 均线图（待实现）

### 5. 价格提醒
- 提醒列表
- 添加提醒（待实现）
- 启用/暂停提醒
- 重置提醒
- 删除提醒

### 6. 个人中心
- 用户信息展示
- 个人设置（待实现）
- 交易记录（待实现）
- 关于信息

## 开发环境设置

### 1. 安装依赖

小程序端需要安装以下 npm 包：

```bash
cd miniprogram
npm init -y
npm install weui-wxss
npm install echarts-for-weixin
```

### 2. 构建npm

在微信开发者工具中：
1. 点击菜单栏 "工具" -> "构建 npm"
2. 构建完成后即可使用 npm 包

### 3. 配置后端地址

在 `miniprogram/app.js` 中修改 `baseUrl`:

```javascript
globalData: {
  baseUrl: 'http://your-server-address:3000/api'
}
```

### 4. 后端CORS配置

在 `server/src/app.js` 中添加小程序域名到CORS白名单：

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://your-miniprogram-domain'],
  credentials: true
}));
```

## 待完成功能

- [ ] 集成 echarts-for-weixin 图表库
- [ ] 实现添加持仓页面
- [ ] 实现编辑持仓页面
- [ ] 实现卖出持仓页面
- [ ] 实现股票详情页（K线图、均线图）
- [ ] 实现添加价格提醒页面
- [ ] 实现交易记录页面
- [ ] 实现个人设置页面
- [ ] 优化UI细节
- [ ] 添加加载动画
- [ ] 添加错误边界处理
- [ ] 添加下拉刷新功能
- [ ] 添加上拉加载更多功能

## 技术栈

- 微信小程序原生框架
- WXML + WXSS + JavaScript
- WeUI样式库
- echarts-for-weixin（图表）
- 后端API（Node.js + Express + MongoDB）

## 注意事项

1. 确保后端服务已启动
2. 小程序开发工具中需要勾选"不校验合法域名"
3. 真机调试时需要在微信公众平台配置服务器域名
4. 图表功能需要下载 echarts-for-weixin 组件

## 版本历史

- v1.0.0 (2026-03-27)
  - 完成基础骨架搭建
  - 实现登录/注册功能
  - 实现主要页面框架
  - 集成基本API调用
