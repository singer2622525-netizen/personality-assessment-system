#!/bin/bash

echo "🚀 开始部署人格评测系统到绿联云..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 构建Docker镜像
echo "📦 构建Docker镜像..."
docker build -t personality-assessment .

if [ $? -ne 0 ]; then
    echo "❌ Docker镜像构建失败"
    exit 1
fi

# 停止旧容器
echo "🛑 停止旧容器..."
docker-compose down

# 启动新容器
echo "🚀 启动新容器..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ 部署完成！"
    echo ""
    echo "📱 访问地址:"
    echo "   内网: http://localhost:3000"
    echo "   公网: http://你的绿联云公网IP:3000"
    echo ""
    echo "📊 查看状态: docker-compose ps"
    echo "📋 查看日志: docker-compose logs -f"
    echo "🛑 停止服务: docker-compose down"
else
    echo "❌ 容器启动失败"
    exit 1
fi
