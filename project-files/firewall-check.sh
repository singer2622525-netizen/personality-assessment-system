#!/bin/bash

echo "🛡️ Mac防火墙检查脚本"
echo "===================="

# 检查防火墙状态
echo "📊 防火墙状态检查："
if /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate | grep -q "enabled"; then
    echo "⚠️ 防火墙已启用"
    echo "🔧 需要允许Node.js通过防火墙"
else
    echo "✅ 防火墙已禁用"
fi

echo ""
echo "🔍 Node.js进程检查："
if pgrep -f "node.*next" > /dev/null; then
    echo "✅ Node.js进程正在运行"
    echo "进程ID: $(pgrep -f "node.*next")"
else
    echo "❌ Node.js进程未运行"
fi

echo ""
echo "🌐 网络连接测试："
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
if [ ! -z "$LOCAL_IP" ]; then
    echo "测试本地连接..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        echo "✅ 本地连接正常"
    else
        echo "❌ 本地连接失败"
    fi
    
    echo "测试网络连接..."
    if curl -s -o /dev/null -w "%{http_code}" http://$LOCAL_IP:3000 | grep -q "200"; then
        echo "✅ 网络连接正常"
    else
        echo "❌ 网络连接失败"
    fi
fi

echo ""
echo "🛠️ 解决方案："
echo "1. 打开 系统偏好设置 > 安全性与隐私 > 防火墙"
echo "2. 点击 防火墙选项..."
echo "3. 找到 Node.js 并设置为 允许传入连接"
echo "4. 或者临时关闭防火墙进行测试"
echo ""
echo "📱 测试链接: http://$LOCAL_IP:3000"
