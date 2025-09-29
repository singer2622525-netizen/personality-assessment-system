#!/bin/bash

echo "🔍 网络连接诊断脚本"
echo "===================="

# 获取本机IP地址
echo "📱 本机IP地址："
ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1

echo ""
echo "🌐 服务器状态："
# 检查Next.js进程
if pgrep -f "next dev" > /dev/null; then
    echo "✅ Next.js服务器正在运行"
else
    echo "❌ Next.js服务器未运行"
fi

echo ""
echo "🔌 端口监听状态："
# 检查端口3000
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ 端口3000正在监听"
    lsof -i :3000
else
    echo "❌ 端口3000未监听"
fi

echo ""
echo "🧪 本地连接测试："
# 测试本地连接
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ 本地连接正常"
else
    echo "❌ 本地连接失败"
fi

echo ""
echo "🌍 网络连接测试："
# 获取本机IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
if [ ! -z "$LOCAL_IP" ]; then
    echo "测试连接: http://$LOCAL_IP:3000"
    if curl -s -o /dev/null -w "%{http_code}" http://$LOCAL_IP:3000 | grep -q "200"; then
        echo "✅ 网络连接正常"
        echo "📱 分享链接: http://$LOCAL_IP:3000"
    else
        echo "❌ 网络连接失败"
        echo "🔧 可能的原因："
        echo "   1. Mac防火墙阻止了连接"
        echo "   2. 路由器防火墙阻止了连接"
        echo "   3. Next.js未绑定到0.0.0.0"
    fi
else
    echo "❌ 无法获取本机IP地址"
fi

echo ""
echo "🛠️ 解决方案："
echo "1. 检查Mac系统偏好设置 > 安全性与隐私 > 防火墙"
echo "2. 确保防火墙允许Node.js连接"
echo "3. 重启Next.js服务器: npm run dev -- --hostname 0.0.0.0"
echo "4. 检查路由器设置"
