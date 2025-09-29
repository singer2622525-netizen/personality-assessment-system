#!/bin/bash

echo "🌐 内网穿透 - 公网访问解决方案"
echo "================================"

# 检查本地服务器
if ! pgrep -f "next dev" > /dev/null; then
    echo "❌ Next.js 服务器未运行"
    echo "请先运行: npm run dev -- --hostname 0.0.0.0 --port 8080"
    exit 1
fi

echo "✅ Next.js 服务器正在运行"

# 方案1：使用 serveo
echo ""
echo "🔧 方案1：使用 serveo（最简单）"
echo "运行命令: ssh -R 80:localhost:8080 serveo.net"
echo ""

# 方案2：使用 ngrok
echo "🔧 方案2：使用 ngrok"
echo "1. 访问 https://ngrok.com/ 注册免费账户"
echo "2. 下载 ngrok 客户端"
echo "3. 运行: ./ngrok http 8080"
echo ""

# 方案3：使用 Vercel
echo "🔧 方案3：使用 Vercel（推荐）"
echo "运行命令: ./deploy-vercel.sh"
echo ""

# 方案4：使用 Cloudflare Tunnel
echo "🔧 方案4：使用 Cloudflare Tunnel"
echo "1. 访问 https://one.dash.cloudflare.com/"
echo "2. 安装 cloudflared"
echo "3. 创建隧道并运行"
echo ""

echo "📱 当前本地访问地址："
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "内网: http://$LOCAL_IP:8080"
echo "本地: http://localhost:8080"
echo ""

echo "🎯 推荐使用流程："
echo "1. 临时使用：运行 serveo 命令"
echo "2. 长期使用：部署到 Vercel"
echo "3. 企业使用：部署到绿联云"
