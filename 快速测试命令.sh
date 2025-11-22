#!/bin/bash

# 快速测试脚本
# 用于在Mac上本地测试修复后的代码

echo "=== 🧪 本地测试脚本 ==="
echo ""

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录执行此脚本"
    exit 1
fi

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到Node.js，请先安装Node.js"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

echo ""
echo "🚀 启动开发服务器..."
echo ""
echo "访问地址：http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动开发服务器
npm run dev


