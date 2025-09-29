#!/bin/bash

# GitHub 推送脚本
echo "🚀 准备推送代码到 GitHub..."

# 检查是否已配置远程仓库
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "📡 添加远程仓库..."
    git remote add origin https://github.com/singer2622525-netizen/personality-assessment-system.git
fi

# 推送代码
echo "📤 推送代码到 GitHub..."
git push -u origin main

echo "✅ 推送完成！"
echo "🌐 现在可以在 Vercel 中导入这个仓库了"
