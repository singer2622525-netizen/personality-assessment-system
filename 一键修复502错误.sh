#!/bin/bash

echo "🔧 502 错误快速修复..."
echo ""

# 服务器信息
SERVER_USER="songtuo"
SERVER_HOST="192.168.13.44"
APP_DIR="/home/songtuo/下载/complete-project"

echo "📡 连接到服务器: ${SERVER_USER}@${SERVER_HOST}"
echo ""

# 检查并重启应用
echo "1️⃣  检查 PM2 状态..."
PM2_STATUS=$(ssh ${SERVER_USER}@${SERVER_HOST} "pm2 list 2>/dev/null | grep personality-assessment" || echo "")

if echo "$PM2_STATUS" | grep -q "online"; then
    echo "✅ PM2 应用正在运行，但可能有问题，尝试重启..."
    ssh ${SERVER_USER}@${SERVER_HOST} "pm2 restart personality-assessment"
else
    echo "❌ PM2 应用未运行，尝试启动..."
    
    # 检查是否有 standalone 目录
    STANDALONE_EXISTS=$(ssh ${SERVER_USER}@${SERVER_HOST} "test -d '$APP_DIR/.next/standalone' && echo 'yes' || echo 'no'")
    
    if [ "$STANDALONE_EXISTS" = "yes" ]; then
        echo "   使用 standalone 模式启动..."
        ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /home/songtuo/下载/complete-project/.next/standalone
pm2 delete personality-assessment 2>/dev/null || true
pm2 start node --name "personality-assessment" -- server.js
pm2 save
ENDSSH
    else
        echo "   使用 npm start 启动..."
        ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /home/songtuo/下载/complete-project
pm2 delete personality-assessment 2>/dev/null || true
pm2 start npm --name "personality-assessment" -- start
pm2 save
ENDSSH
    fi
fi

echo ""
echo "2️⃣  等待应用启动..."
sleep 10

echo ""
echo "3️⃣  检查应用响应..."
HTTP_CODE=$(ssh ${SERVER_USER}@${SERVER_HOST} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo '000'")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 应用响应正常 (HTTP $HTTP_CODE)"
    echo ""
    echo "✅ 修复完成！"
    echo ""
    echo "请等待 30 秒后访问: https://assessment.suuntoyun.com"
else
    echo "❌ 应用仍然无响应 (HTTP $HTTP_CODE)"
    echo ""
    echo "查看详细日志："
    ssh ${SERVER_USER}@${SERVER_HOST} "pm2 logs personality-assessment --lines 30 --nostream"
    echo ""
    echo "如果问题仍然存在，请查看完整指南："
    echo "  502错误快速修复指南.md"
fi
