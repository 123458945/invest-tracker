#!/bin/bash

set -e

echo "=========================================="
echo "   InvestTracker 部署脚本"
echo "=========================================="

echo ""
echo "[1/5] 检查环境..."
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "Docker 版本: $(docker --version)"
echo "Docker Compose 版本: $(docker-compose --version)"

echo ""
echo "[2/5] 检查环境变量文件..."
if [ ! -f .env ]; then
    if [ -f .env.production ]; then
        echo "复制 .env.production 到 .env"
        cp .env.production .env
    else
        echo "错误: 请先创建 .env 或 .env.production 文件"
        exit 1
    fi
fi

echo ""
echo "[3/5] 停止旧容器..."
docker-compose down 2>/dev/null || true

echo ""
echo "[4/5] 构建并启动新容器..."
docker-compose up -d --build

echo ""
echo "[5/5] 等待服务启动..."
sleep 5

echo ""
echo "=========================================="
echo "   部署完成!"
echo "=========================================="
echo ""
echo "服务状态:"
docker-compose ps

echo ""
echo "访问地址:"
echo "  前端: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip')"
echo "  后端: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip'):3000"
echo "  健康检查: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip')/api/health"
echo ""
echo "常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  重启服务: docker-compose restart"
echo "  停止服务: docker-compose down"
echo ""
