#!/bin/bash

echo "🚀 快速部署到 Vercel 公网访问"
echo "================================"

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "请运行: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI 已安装"

# 检查项目文件
if [ ! -f "package.json" ]; then
    echo "❌ 未找到 package.json"
    exit 1
fi

echo "✅ 项目文件检查完成"

# 部署到 Vercel
echo "🌐 开始部署到 Vercel..."
echo "注意：首次部署需要登录 Vercel 账户"

vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo "📱 你的评测系统现在可以通过公网访问了"
    echo "🌍 分享链接已生成，请查看上面的输出"
    echo ""
    echo "📋 使用说明："
    echo "1. 面试者：访问公网链接 → 填写信息 → 完成评测"
    echo "2. 管理员：访问公网链接 → 登录管理后台 → 查看结果"
    echo ""
    echo "🔧 管理命令："
    echo "- 查看部署状态: vercel ls"
    echo "- 查看日志: vercel logs"
    echo "- 重新部署: vercel --prod"
else
    echo "❌ 部署失败"
    echo "请检查网络连接和 Vercel 账户设置"
fi
