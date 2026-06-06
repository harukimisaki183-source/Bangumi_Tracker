#!/bin/bash
set -e

echo "=== 追番记录站 部署脚本 ==="
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi

echo "✅ Docker 已就绪"

# 创建 .env（如果不存在）
if [ ! -f .env ]; then
    echo "📝 创建 .env 文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 填入你的配置（JWT_SECRET、SMTP 等）"
    echo "   运行: nano .env"
    exit 1
fi

echo "✅ .env 文件已存在"

# 启动服务
echo "🚀 启动服务..."
docker compose up -d --build

echo ""
echo "等待服务启动..."
sleep 10

# 检查服务状态
echo ""
echo "=== 服务状态 ==="
docker compose ps

echo ""
echo "=== 访问地址 ==="
echo "前端: http://111.230.114.217"
echo "API:  http://111.230.114.217:3000/api"
echo "MinIO: http://111.230.114.217:9001"
echo ""
echo "✅ 部署完成！"
