# ---- 构建阶段 ----
FROM node:20-alpine AS builder

WORKDIR /app

# 复制根目录 package 文件（workspace 根 + lock）
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/

# 安装所有依赖（workspace 模式）
RUN npm ci --workspaces

# 复制全部源码并构建前端
COPY . .
RUN npm run build:client

# ---- 运行阶段 ----
FROM node:20-alpine AS runner

WORKDIR /app

# 复制根 workspace 配置 + lock + server package
COPY package.json package-lock.json ./
COPY server/package.json server/

# 只安装 server 的生产依赖
RUN npm ci --workspace=server --omit=dev

# 复制 server 源码
COPY server/src server/src

# 从构建阶段复制前端产物
# server/src 中引用 ../../client/dist → /app/client/dist
COPY --from=builder /app/client/dist client/dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server/src/server.js"]
