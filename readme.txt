InvestTracker - 个人投资管理系统实施计划
项目概述
从零搭建一个个人投资管理 webapp，支持中国A股/基金的持仓管理、实时行情、数据可视化和邮件提醒。
技术栈
前端: React (JS) + Vite + Material UI + ECharts
后端: Node.js + Express
数据库: MongoDB + Mongoose
认证: JWT + bcrypt
行情API: 新浪财经接口 (免费，无需注册)
邮件: Nodemailer
定时任务: node-cron
项目结构
plaintext
fortuneTeller/
├── client/                         # React 前端
│   ├── src/
│   │   ├── api/                    # API 调用封装
│   │   │   ├── axios.config.js     # Axios 实例 (拦截器、baseURL)
│   │   │   ├── auth.api.js
│   │   │   ├── holdings.api.js
│   │   │   ├── stocks.api.js
│   │   │   ├── alerts.api.js
│   │   │   └── analytics.api.js
│   │   ├── components/
│   │   │   ├── common/             # 通用组件
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   └── PrivateRoute.jsx
│   │   │   ├── layout/
│   │   │   │   ├── AppBar.jsx
│   │   │   │   └── MainLayout.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── PortfolioSummary.jsx
│   │   │   │   ├── ProfitLossCard.jsx
│   │   │   │   ├── AssetAllocation.jsx
│   │   │   │   └── RecentAlerts.jsx
│   │   │   ├── holdings/
│   │   │   │   ├── HoldingsList.jsx
│   │   │   │   ├── AddHoldingDialog.jsx
│   │   │   │   └── EditHoldingDialog.jsx
│   │   │   ├── stocks/
│   │   │   │   ├── StockSearchBar.jsx
│   │   │   │   ├── StockQuoteCard.jsx
│   │   │   │   ├── StockChart.jsx
│   │   │   │   └── MovingAverages.jsx
│   │   │   └── alerts/
│   │   │       ├── AlertsList.jsx
│   │   │       ├── CreateAlertDialog.jsx
│   │   │       └── AlertTypeSelector.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── HoldingsPage.jsx
│   │   │   ├── StocksPage.jsx
│   │   │   └── AlertsPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useRealTimePrice.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   └── calculations.js
│   │   ├── styles/
│   │   │   └── theme.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── router.jsx
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # Node.js 后端
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── jwt.js
│   │   │   └── email.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Holding.js
│   │   │   ├── Stock.js
│   │   │   ├── Alert.js
│   │   │   └── Transaction.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── holdings.controller.js
│   │   │   ├── stocks.controller.js
│   │   │   ├── alerts.controller.js
│   │   │   └── analytics.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── holdings.routes.js
│   │   │   ├── stocks.routes.js
│   │   │   ├── alerts.routes.js
│   │   │   └── analytics.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   ├── errorHandler.middleware.js
│   │   │   └── rateLimiter.middleware.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── holdings.service.js
│   │   │   ├── marketData.service.js
│   │   │   ├── alert.service.js
│   │   │   ├── email.service.js
│   │   │   └── analytics.service.js
│   │   ├── jobs/
│   │   │   ├── priceMonitor.job.js
│   │   │   ├── stockCache.job.js
│   │   │   └── scheduler.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── apiResponse.js
│   │   │   └── calculations.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
└── package.json                    # 根级 workspace 配置
数据库设计
Users
字段	类型	说明
email	String (unique)	登录邮箱
password	String	bcrypt 哈希密码
username	String	用户名
Holdings (持仓)
字段	类型	说明
userId	ObjectId	所属用户
stockCode	String	股票代码 (如 "600519")
stockName	String	名称 (如 "贵州茅台")
market	String	市场: 'sh' / 'sz'
assetType	String	类型: 'stock' / 'fund'
quantity	Number	持仓数量
buyPrice	Number	买入均价
buyDate	Date	买入日期
currentPrice	Number	当前价(实时更新)
notes	String	备注
虚拟字段: profitLoss, profitLossRate, marketValue
Stocks (行情缓存)
字段	类型	说明
stockCode	String (unique)	代码
currentPrice, changePercent, volume...	Number	行情数据
ma5, ma10, ma20, ma60	Number	均线
lastFetchedAt	Date	缓存时间
Alerts (提醒)
字段	类型	说明
userId	ObjectId	所属用户
stockCode / stockName	String	目标股票
alertType	String	'price_above' / 'price_below' / 'ma_cross_up' / 'ma_cross_down'
targetPrice	Number	目标价格
maConfig	Object	均线配置 { shortPeriod, longPeriod }
isActive / isTriggered	Boolean	状态
notificationMethod	String	'email'
Transactions (交易记录)
字段	类型	说明
userId	ObjectId	所属用户
stockCode	String	股票代码
transactionType	String	'buy' / 'sell'
quantity, price, totalAmount	Number	交易数据
API 设计
认证 /api/auth
POST /register - 注册
POST /login - 登录
GET /me - 获取当前用户
持仓 /api/holdings (需认证)
GET / - 获取所有持仓
POST / - 添加持仓
PUT /:id - 更新持仓
DELETE /:id - 删除持仓
POST /batch-update-prices - 批量刷新价格
行情 /api/stocks (需认证)
GET /search?keyword=xxx - 搜索股票
GET /:code - 实时行情
GET /:code/kline?period=day&count=60 - K线数据
GET /:code/ma - 均线数据
提醒 /api/alerts (需认证)
GET / - 获取所有提醒
POST / - 创建提醒
PUT /:id - 更新提醒
DELETE /:id - 删除提醒
POST /:id/reset - 重置已触发提醒
分析 /api/analytics (需认证)
GET /portfolio-summary - 组合总览
GET /asset-allocation - 资产配置
GET /top-performers - 收益排行
行情数据方案
使用新浪财经API (免费、无需注册):
plaintext
实时行情: https://hq.sinajs.cn/list=sh600519,sz000001
返回逗号分隔字符串，包含名称/开盘价/当前价/最高/最低/成交量等
缓存策略:
交易时间内 (工作日 09:30-15:00): 缓存2分钟
非交易时间: 缓存1小时
定时任务 (node-cron):
价格监控: 交易时间每2分钟检查提醒触发
缓存更新: 每日08:00预加载数据
实施阶段
Phase 1: 项目基础搭建
创建 monorepo 结构，初始化 client/ 和 server/
Vite 创建 React 项目，安装 MUI
Express 后端骨架，MongoDB 连接
基础布局 (MainLayout, AppBar, 路由)
Phase 2: 用户认证系统
User 模型 + bcrypt 密码哈希
JWT 认证 API (register/login)
前端 AuthContext + PrivateRoute
登录/注册页面
Phase 3: 持仓管理
Holding 模型 + CRUD API
HoldingsPage + 添加/编辑/删除对话框
持仓列表表格 (MUI Table)
Phase 4: 行情数据
marketData.service.js 对接新浪API
Stock 缓存模型
StocksPage + 搜索 + 行情卡片
持仓价格自动更新
Phase 5: 数据可视化
DashboardPage + 组合总览卡片
ECharts 资产配置饼图
K线图表 + 均线叠加
盈亏趋势图
Phase 6: 提醒系统
Alert 模型 + CRUD API
邮件服务 (Nodemailer)
定时任务 (node-cron) 价格监控
AlertsPage + 创建/管理提醒
Phase 7: 优化与完善
API 限流 + 日志 (Winston)
错误边界 + Loading状态
响应式优化
全面测试
验证方案
Phase 1: 前端 npm run dev 启动成功 (localhost:5173)，后端 npm run dev 启动成功 (localhost:3000)，MongoDB 连接成功
Phase 2: Postman 测试注册/登录API，前端完成登录流程，受保护路由正常跳转
Phase 3: 通过UI完成持仓的增删改查，数据库数据一致性检查
Phase 4: 调用新浪API返回有效行情数据，持仓列表显示实时价格和盈亏
Phase 5: 仪表板图表正确渲染，数据与持仓一致
Phase 6: 创建提醒后定时任务正确检测并发送邮件
Phase 7: npm run build 成功，无控制台错误，移动端布局正常
关键依赖
前端: react, react-router-dom, @mui/material, @mui/icons-material, @emotion/react, @emotion/styled, axios, echarts, echarts-for-react, date-fns后端: express, mongoose, jsonwebtoken, bcryptjs, express-validator, helmet, cors, express-rate-limit, nodemailer, node-cron, winston, morgan, dotenv, axios