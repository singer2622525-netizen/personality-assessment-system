#!/bin/bash

# 系统更新后一键修复脚本
# 用于修复 Ubuntu 系统更新后导致的 502 错误

set -e

echo "🔄 系统更新后修复脚本"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 服务器信息
SERVER_USER="songtuo"
SERVER_HOST="192.168.13.44"
APP_DIR="/home/songtuo/下载/complete-project"

echo -e "${BLUE}📡 连接到服务器: ${SERVER_USER}@${SERVER_HOST}${NC}"
echo ""

# 步骤 1：检查系统状态
echo -e "${BLUE}1️⃣  检查系统状态...${NC}"
echo ""
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
echo "系统信息:"
uname -a
echo ""
echo "Node.js 版本:"
node --version 2>/dev/null || echo "❌ Node.js 未安装"
npm --version 2>/dev/null || echo "❌ npm 未安装"
echo ""
echo "PM2 状态:"
pm2 list 2>/dev/null || echo "❌ PM2 未安装或未运行"
ENDSSH

echo ""
echo -e "${BLUE}2️⃣  检查应用状态...${NC}"
HTTP_CODE=$(ssh ${SERVER_USER}@${SERVER_HOST} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo '000'")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ 应用正常运行 (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "应用似乎正常，但如果你仍然看到 502 错误，可能是："
    echo "  1. Cloudflare Tunnel 连接问题（等待 30-60 秒）"
    echo "  2. 浏览器缓存（清除缓存或使用无痕模式）"
    exit 0
fi

echo -e "${RED}❌ 应用无响应 (HTTP $HTTP_CODE)${NC}"
echo ""
echo -e "${YELLOW}开始修复...${NC}"
echo ""

# 步骤 3：重启应用
echo -e "${BLUE}3️⃣  重启应用...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /home/songtuo/下载/complete-project

# 检查是否有 standalone 目录
if [ -d ".next/standalone" ]; then
    echo "   使用 standalone 模式启动..."
    cd .next/standalone
    pm2 delete personality-assessment 2>/dev/null || true
    pm2 start node --name "personality-assessment" -- server.js
    pm2 save
else
    echo "   ❌ standalone 目录不存在，需要重新构建"
    echo "   执行: cd /home/songtuo/下载/complete-project && npm run build"
    exit 1
fi
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 应用启动失败${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}4️⃣  重新安装原生模块（如果需要）...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /home/songtuo/下载/complete-project/.next/standalone

# 检查 better-sqlite3 是否存在
if grep -q "better-sqlite3" package.json 2>/dev/null; then
    echo "   重新安装 better-sqlite3..."
    npm install better-sqlite3 --production --no-save 2>&1 | tail -3
else
    echo "   ✅ 无需重新安装原生模块"
fi
ENDSSH

echo ""
echo -e "${BLUE}5️⃣  等待应用启动...${NC}"
sleep 10

echo ""
echo -e "${BLUE}6️⃣  验证修复...${NC}"
HTTP_CODE=$(ssh ${SERVER_USER}@${SERVER_HOST} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo '000'")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ 修复成功！应用响应正常 (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ 修复失败，应用仍然无响应 (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "查看应用日志："
    ssh ${SERVER_USER}@${SERVER_HOST} "pm2 logs personality-assessment --lines 30 --nostream"
    exit 1
fi

echo ""
echo -e "${BLUE}7️⃣  配置 PM2 开机自启...${NC}"
echo ""
echo -e "${YELLOW}⚠️  重要：需要配置 PM2 开机自启，避免系统重启后再次出现问题${NC}"
echo ""
echo "执行以下命令："
echo ""
echo "  ssh ${SERVER_USER}@${SERVER_HOST}"
echo "  pm2 startup"
echo ""
echo "然后复制输出的命令（通常是 sudo 开头的），执行它来配置开机自启。"
echo ""

echo ""
echo "=== ✅ 修复完成 ==="
echo ""
echo "请等待 30 秒后访问: https://assessment.suuntoyun.com"
echo ""
echo "如果问题仍然存在，请查看详细指南："
echo "  系统更新后修复指南.md"

