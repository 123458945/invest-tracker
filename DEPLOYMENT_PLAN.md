# InvestTracker 阿里云部署计划

## 📋 部署前准备清单

### 1. 本地代码整理
- [ ] 确认本地代码已提交到 Git 仓库
- [ ] 备份本地代码（可选）

### 2. 阿里云服务器准备
- [ ] 准备一台阿里云 ECS 服务器（建议配置：2核4G内存或以上）
- [ ] 服务器操作系统：Ubuntu 20.04 或 CentOS 7+
- [ ] 确保服务器已配置公网 IP

---

## 🛠 阿里云服务器配置步骤

### 步骤 1: 连接到服务器
使用 SSH 连接到你的阿里云服务器：
```bash
ssh root@你的服务器公网IP
```

### 步骤 2: 安装 Docker 和 Docker Compose
```bash
# 更新系统包
apt update && apt upgrade -y  # Ubuntu
# 或
yum update -y  # CentOS

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 启动 Docker 服务
systemctl start docker
systemctl enable docker

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 步骤 3: 安装 Nginx（用于反向代理）
```bash
apt install nginx -y  # Ubuntu
# 或
yum install nginx -y  # CentOS

systemctl start nginx
systemctl enable nginx
```

### 步骤 4: 配置防火墙和安全组
在阿里云控制台：
- [ ] 配置安全组规则，开放以下端口：
  - 80 (HTTP，用于 Web 访问)
  - 443 (HTTPS，如果需要 SSL)
  - 22 (SSH，用于远程连接)

在服务器上：
```bash
# Ubuntu (使用 ufw)
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable

# 或 CentOS (使用 firewalld)
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --reload
```

---

## 📁 代码部署步骤

### 方案 A: Docker Compose 部署（推荐）

#### 步骤 1: 上传代码到服务器
```bash
# 方法 1: 使用 Git（推荐）
cd /var/www
git clone 你的仓库地址 invest-tracker
cd invest-tracker

# 方法 2: 使用 SCP 上传
# 在本地执行：
scp -r /e/claude/project1/* root@服务器IP:/var/www/invest-tracker/

# 方法 3: 使用 FTP 工具（如 FileZilla）
```

#### 步骤 2: 创建生产环境配置文件

在服务器上创建 `.env.production` 文件：
```bash
cd /var/www/invest-tracker
nano .env.production
```

添加以下内容（**请替换为你的实际值**）：
```env
# 服务器配置
NODE_ENV=production
PORT=3000
CLIENT_URL=http://你的域名或IP

# MongoDB 配置（使用阿里云 MongoDB 推荐）
MONGODB_URI=mongodb+srv://用户名:密码@mongodb.aliyuncs.com:37117/invest-tracker?retryWrites=true&w=majority&appName=invest-tracker

# JWT 配置（**务必修改**）
JWT_SECRET=请生成一个随机密钥-至少32位-例如:AbCdEf123456...XyZ
JWT_EXPIRES_IN=7d

# 邮件配置（使用阿里云邮件推送或保留 QQ）
EMAIL_SERVICE=smtp.qq.com
EMAIL_PORT=465
EMAIL_USER=你的QQ邮箱
EMAIL_PASS=你的QQ邮箱授权码
```

#### 步骤 3: 修改 Docker Compose 配置

创建生产环境的 `docker-compose.prod.yml`：
```bash
nano docker-compose.prod.yml
```

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:8.0
    container_name: invest-tracker-mongodb
    restart: always
    environment:
      - MONGO_INITDB_DATABASE=invest-tracker
    networks:
      - app-network

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    image: invest-tracker-server:latest
    container_name: invest-tracker-server
    restart: always
    env_file:
      - .env.production
    depends_on:
      - mongodb
    networks:
      - app-network

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    image: invest-tracker-client:latest
    container_name: invest-tracker-client
    restart: always
    depends_on:
      - server
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

#### 步骤 4: 启动服务
```bash
cd /var/www/invest-tracker
docker-compose -f docker-compose.prod.yml up -d --build
```

#### 步骤 5: 配置 Nginx 反向代理

创建 Nginx 配置文件：
```bash
nano /etc/nginx/sites-available/invest-tracker
```

```nginx
server {
    listen 80;
    server_name 你的域名或IP;

    # 前端静态文件
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # API 请求
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

启用配置：
```bash
# 创建符号链接
ln -s /etc/nginx/sites-available/invest-tracker /etc/nginx/sites-enabled/

# 删除默认配置（可选）
rm /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

---

### 方案 B: 使用阿里云服务（更简单但需要额外费用）

#### 1. 阿里云 MongoDB（推荐）
在阿里云控制台：
- [ ] 购买 MongoDB 实例（按量或包年）
- [ ] 获取连接字符串
- [ ] 配置白名单（服务器 IP）
- [ ] 将连接字符串填入 `.env.production`

#### 2. 阿里云邮件推送（可选）
- [ ] 购买邮件推送服务
- [ ] 获取 SMTP 配置信息
- [ ] 替换 `.env.production` 中的邮件配置

#### 3. 使用阿里云 RDS PostgreSQL（替代 MongoDB）
如果不想使用 MongoDB：
- [ ] 购买 RDS PostgreSQL 实例
- [ ] 修改后端代码使用 PostgreSQL（需要改代码）

---

## 🔒 SSL 证书配置（HTTPS）

### 方法 1: 使用 Let's Encrypt 免费证书
```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y  # Ubuntu

# 获取证书
certbot --nginx -d 你的域名.com

# Certbot 会自动更新 Nginx 配置
systemctl restart nginx
```

### 方法 2: 购买阿里云 SSL 证书
1. 在阿里云购买 SSL 证书
2. 下载证书文件（.pem 格式）
3. 上传到服务器 `/etc/nginx/ssl/` 目录
4. 更新 Nginx 配置：

```nginx
server {
    listen 443 ssl http2;
    server_name 你的域名.com;

    ssl_certificate /etc/nginx/ssl/你的证书.pem;
    ssl_certificate_key /etc/nginx/ssl/你的私钥.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 其他配置同上...
}

server {
    listen 80;
    server_name 你的域名.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🌐 域名配置

### 在阿里云控制台
1. [ ] 购买域名（如果没有）
2. [ ] 添加 DNS 记录：
   - 类型: A
   - 主机记录: @（根域名）或 www
   - 记录值: 你的服务器公网 IP
   - TTL: 600

---

## 📊 阿里云费用预估

### ECS 服务器
- 2核4G内存：约 200-400 元/月
- 带宽：按量或包年
- 磁盘：40GB SSD 约 100 元/月

### MongoDB 云数据库
- 基础版：约 200-500 元/月
- 存储空间：5GB-20GB

### 其他
- 域名：约 50-100 元/年
- SSL 证书：免费（Let's Encrypt）或付费

**月度预估成本：500-1500 元**

---

## 🧪 部署后验证清单

### 服务检查
- [ ] 后端 API 健康检查：`http://你的IP/api/health`
- [ ] 前端页面可访问：`http://你的IP` 或 `http://你的域名.com`
- [ ] MongoDB 连接正常（查看 Docker 日志）

### 功能测试
- [ ] 注册新账户
- [ ] 登录系统
- [ ] 添加持仓
- [ ] 查看行情图表
- [ ] 创建价格提醒
- [ ] 发送测试邮件
- [ ] 检查定时任务是否运行

### 日志查看
```bash
# 查看所有容器状态
docker-compose -f docker-compose.prod.yml ps

# 查看后端日志
docker logs invest-tracker-server -f

# 查看前端日志
docker logs invest-tracker-client -f

# 查看 MongoDB 日志
docker logs invest-tracker-mongodb -f

# 查看 Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 📝 常用运维命令

### Docker 管理
```bash
# 停止所有服务
docker-compose -f docker-compose.prod.yml down

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 进入容器调试
docker exec -it invest-tracker-server sh
docker exec -it invest-tracker-mongodb mongosh invest-tracker
```

### Nginx 管理
```bash
# 测试配置
nginx -t

# 重新加载配置
nginx -s reload

# 重启服务
systemctl restart nginx
```

### 数据库备份
```bash
# 导出数据
docker exec invest-tracker-mongodb mongodump -d invest-tracker --out /backup

# 导入数据
docker exec -i invest-tracker-mongodb mongorestore -d invest-tracker /backup
```

---

## ⚠️ 注意事项

1. **JWT_SECRET 必须修改**
   - 不要使用默认值 "your-super-secret-jwt-key-change-in-production"
   - 生成强随机密钥：`openssl rand -base64 32`

2. **邮箱授权码**
   - QQ 邮箱必须使用授权码，不是登录密码
   - 在 QQ 邮箱设置中生成授权码

3. **环境变量**
   - `.env.production` 文件包含敏感信息
   - 不要提交到 Git 仓库

4. **MongoDB 数据**
   - 建议使用阿里云 MongoDB 云数据库
   - 如果使用 Docker MongoDB，需要配置数据卷备份

5. **安全性**
   - 确保 JWT_SECRET 足够复杂
   - 启用 HTTPS
   - 定期备份数据库

6. **日志监控**
   - 定期查看日志排查问题
   - 监控服务器资源使用情况

---

## 🎯 快速部署流程（总结）

```
1. 准备阿里云服务器 → 安装 Docker + Nginx
2. 上传代码到服务器 /var/www/invest-tracker
3. 创建 .env.production 配置文件
4. 创建 docker-compose.prod.yml 配置
5. 运行: docker-compose -f docker-compose.prod.yml up -d --build
6. 配置 Nginx 反向代理
7. 配置域名解析到服务器 IP
8. 测试所有功能
9. 配置 SSL 证书（HTTPS）
```

---

## 📞 部署问题排查

### 问题：容器启动失败
```bash
# 查看详细日志
docker-compose -f docker-compose.prod.yml logs

# 检查端口占用
netstat -tunlp | grep -E ':(80|443|3000|5173)'
```

### 问题：Nginx 502 错误
- 检查 Docker 容器是否运行
- 检查 Nginx 配置中的代理地址是否正确
- 检查防火墙是否开放端口

### 问题：数据库连接失败
- 检查 MONGODB_URI 配置
- 检查 MongoDB 白名单配置
- 查看后端日志中的连接错误信息

### 问题：邮件发送失败
- 检查邮箱配置是否正确
- 确认使用授权码（QQ）
- 查看 Docker 日志中的邮件发送错误
