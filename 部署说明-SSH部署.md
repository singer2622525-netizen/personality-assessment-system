# 🚀 SSH 部署说明

## 📦 压缩包内容

本压缩包包含修复后的代码文件，用于解决"提交评测卡住"的问题。

### 修复的文件
- `app/api/sessions/[sessionId]/submit/route.ts` - 提交评测API
- `app/api/sessions/[sessionId]/route.ts` - 获取/更新会话API
- `app/api/sessions/[sessionId]/answers/route.ts` - 保存答案API

### 其他文件
- 所有源代码文件
- 配置文件（package.json, next.config.js等）
- 部署说明文档

---

## 🚀 部署步骤

### 步骤1：上传压缩包到服务器

**在Mac终端执行：**
```bash
# 将压缩包上传到服务器
scp 修复代码-部署包.tar.gz songtuo@192.168.13.44:~/
```

### 步骤2：SSH连接到服务器

```bash
ssh songtuo@192.168.13.44
```

### 步骤3：备份现有代码（重要！）

```bash
# 进入项目目录（根据实际路径调整）
cd ~/personality-assessment  # 或您的项目路径

# 备份当前代码
cp -r app/api app/api.backup.$(date +%Y%m%d_%H%M%S)
```

### 步骤4：解压并部署

```bash
# 解压压缩包
cd ~
tar -xzf 修复代码-部署包.tar.gz

# 进入解压后的目录
cd 修复代码-部署包

# 复制修复后的文件到项目目录
# 方法1：直接复制修复的文件（推荐）
cp app/api/sessions/\[sessionId\]/submit/route.ts ~/personality-assessment/app/api/sessions/[sessionId]/submit/route.ts
cp app/api/sessions/\[sessionId\]/route.ts ~/personality-assessment/app/api/sessions/[sessionId]/route.ts
cp app/api/sessions/\[sessionId\]/answers/route.ts ~/personality-assessment/app/api/sessions/[sessionId]/answers/route.ts

# 或者方法2：复制整个app目录（如果项目结构相同）
# cp -r app/* ~/personality-assessment/app/
```

### 步骤5：重新构建项目

```bash
# 进入项目目录
cd ~/personality-assessment

# 重新构建
npm run build
```

### 步骤6：重启服务

**如果使用PM2：**
```bash
pm2 restart all
# 或
pm2 restart personality-assessment
```

**如果直接运行：**
```bash
# 停止当前服务（Ctrl+C）
# 然后重新启动
npm start
```

---

## 🧪 验证修复

### 测试步骤

1. **访问应用**：
   - 在服务器浏览器访问：`http://localhost:3000`
   - 或从其他设备访问：`http://192.168.13.44:3000`

2. **测试提交评测**：
   - 创建新的评测会话
   - 完成所有50道题目
   - 点击"完成评测"按钮
   - **应该能正常跳转到结果页面** ✅

3. **检查结果**：
   - 结果页面应该正常显示
   - 所有数据应该正确保存

---

## ⚠️ 注意事项

### 1. 路径问题
- 请根据实际项目路径调整命令
- 如果项目路径不同，请修改相应的路径

### 2. 权限问题
- 确保有写入项目目录的权限
- 如果遇到权限问题，可能需要使用 `sudo`

### 3. 服务管理
- 如果使用PM2，确保服务名称正确
- 如果不确定服务名称，使用 `pm2 list` 查看

### 4. 备份重要
- 部署前务必备份现有代码
- 如果出现问题，可以从备份恢复

---

## 🔄 回滚方法

如果部署后出现问题，可以回滚：

```bash
# 进入项目目录
cd ~/personality-assessment

# 恢复备份的文件
cp app/api/sessions/\[sessionId\]/submit/route.ts.backup app/api/sessions/[sessionId]/submit/route.ts
cp app/api/sessions/\[sessionId\]/route.ts.backup app/api/sessions/[sessionId]/route.ts
cp app/api/sessions/\[sessionId\]/answers/route.ts.backup app/api/sessions/[sessionId]/answers/route.ts

# 重新构建
npm run build

# 重启服务
pm2 restart all
```

---

## 📞 问题排查

### 如果构建失败
```bash
# 检查Node.js版本
node --version  # 应该是 18+

# 检查依赖
npm install

# 重新构建
npm run build
```

### 如果服务无法启动
```bash
# 检查端口是否被占用
netstat -tulpn | grep 3000

# 检查PM2状态
pm2 status
pm2 logs
```

### 如果功能仍然有问题
```bash
# 检查服务器日志
pm2 logs personality-assessment

# 或查看Next.js日志
# 在运行npm start的终端查看输出
```

---

## ✅ 部署完成检查清单

- [ ] 压缩包已上传到服务器
- [ ] 已备份现有代码
- [ ] 修复文件已复制到项目目录
- [ ] 项目已重新构建成功
- [ ] 服务已重启
- [ ] 已测试提交评测功能
- [ ] 功能正常工作

---

**部署完成后，提交评测功能应该能正常工作！** 🎉


