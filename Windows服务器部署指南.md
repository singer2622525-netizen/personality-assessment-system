# Windows Server 2016 部署指南

## 📋 适用场景
- 直接在 Windows Server 2016 上部署
- 不需要 SSH 远程操作
- 适合公司内部服务器环境

---

## 🛠️ 准备工作

### 第一步：安装必需软件

#### 1. 安装 Docker Desktop for Windows

1. **下载 Docker Desktop**
   - 访问：https://www.docker.com/products/docker-desktop
   - 下载 Windows 版本
   - 文件大小约 500MB

2. **安装 Docker Desktop**
   - 双击安装程序
   - 按照向导完成安装
   - **重要**：安装过程中选择 "Use WSL 2 based engine"（推荐）

3. **启动 Docker**
   - 安装完成后重启计算机
   - 启动 Docker Desktop 应用
   - 等待 Docker 启动完成（系统托盘图标显示运行中）

#### 2. 验证安装
```powershell
# 打开 PowerShell
docker --version
docker-compose --version
```

---

## 🚀 部署步骤

### 第一步：准备项目文件

#### 方法 A: 从 Git 仓库克隆（推荐）
```powershell
# 在服务器上创建项目目录
New-Item -ItemType Directory -Path "C:\WebApps\personality-assessment" -Force
Set-Location "C:\WebApps\personality-assessment"

# 使用 Git 克隆（如果已安装 Git）
git clone <your-repository-url> .
```

#### 方法 B: 直接复制项目文件夹
1. 将整个项目文件夹复制到服务器
2. 建议路径：`C:\WebApps\personality-assessment`

#### 方法 C: 解压压缩包
1. 将项目打包为 `project.zip`
2. 在服务器上解压到：`C:\WebApps\personality-assessment`

### 第二步：配置项目

编辑 `.env.production` 文件（如果不存在则创建）：
```powershell
# 使用记事本创建
notepad .env.production
```

添加内容：
```
NODE_ENV=production
PORT=3000
```

保存文件

### 第三步：构建和启动服务

```powershell
# 进入项目目录
Set-Location "C:\WebApps\personality-assessment"

# 构建 Docker 镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

等待构建完成（首次需要 5-10 分钟）

### 第四步：验证服务运行

```powershell
# 查看运行状态
docker-compose ps

# 测试本地访问
Invoke-WebRequest http://localhost:3000
```

如果看到 HTML 响应，说明服务运行正常！

---

## 🌐 配置 IIS 反向代理（可选）

### 第一步：安装 IIS

1. 打开"服务器管理器"
2. 点击"添加角色和功能"
3. 选择"Web 服务器(IIS)"
4. 在功能页面勾选：
   - 应用程序初始化
   - ASP.NET 4.7
   - WebSocket 协议
5. 完成安装

### 第二步：安装 Application Request Routing (ARR)

1. 下载 IIS 扩展：
   - 访问：https://www.iis.net/downloads/microsoft/application-request-routing
   - 下载并安装 "Application Request Routing"

2. 配置反向代理：
   - 打开 IIS 管理器
   - 选择服务器节点
   - 双击"URL 重写"
   - 点击右侧"导入规则"
   - 选择项目目录中的 `web.config`（我们需要创建）

### 第三步：创建网站

1. 打开 IIS 管理器
2. 右键"网站" → "添加网站"
3. 配置：
   - 网站名称：PersonalityAssessment
   - 物理路径：`C:\WebApps\personality-assessment\public`
   - 绑定：
     - 类型：http
     - IP 地址：全部未分配
     - 端口：80
     - 主机名：留空（或填写域名）

4. 点击"确定"

---

## 🔧 防火墙配置

### Windows 防火墙

```powershell
# 以管理员身份运行 PowerShell

# 允许端口 3000
New-NetFirewallRule -DisplayName "Personality Assessment" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# 允许端口 80（HTTP）
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# 允许端口 443（HTTPS）
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

### 验证防火墙规则
```powershell
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Personality*"}
```

---

## 🌐 域名配置

### 内网部署（公司内部）

如果只在内网使用，配置 Hosts 文件：

1. 打开 CMD（以管理员身份）
2. 编辑 hosts 文件：
```cmd
notepad C:\Windows\System32\drivers\etc\hosts
```

3. 添加域名映射：
```
192.168.1.100    assessment.company.com
```
（将 192.168.1.100 替换为服务器内网 IP）

### 公网部署（需要外网访问）

1. **购买域名**
   - 在阿里云、腾讯云等平台购买

2. **配置 DNS 解析**
   - 添加 A 记录指向服务器公网 IP

3. **在 IIS 中绑定域名**
   - 右键网站 → 绑定
   - 添加 HTTPS 绑定
   - 主机名填写您的域名

---

## 🔒 SSL 证书配置（HTTPS）

### 方法 1: 使用 Certbot（推荐）

1. 下载 Certbot for Windows：
   https://certbot.eff.org/

2. 运行 Certbot：
```cmd
certbot --iis personality-assessment
```

按照提示完成证书配置

### 方法 2: 使用 Cloudflare（简单）

1. 在 Cloudflare 添加域名
2. 修改 DNS 解析
3. 使用 Cloudflare 的 SSL 加密

---

## ✅ 测试访问

### 内网访问
```
http://assessment.company.com
```
（根据您的配置）

### 外网访问
```
http://yourdomain.com
```
（如果有公网IP和域名）

### 功能测试

1. **打开首页** - 应该能看到系统界面
2. **管理员登录**
   - 用户名：`admin`
   - 密码：`admin123`
3. **创建测试任务** - 验证创建功能
4. **完成一次评测** - 验证评测流程

---

## 📊 管理命令

### 查看服务状态
```powershell
docker-compose ps
```

### 查看日志
```powershell
docker-compose logs -f
```

### 重启服务
```powershell
docker-compose restart
```

### 停止服务
```powershell
docker-compose stop
```

### 更新系统
```powershell
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔄 开机自启动

### Docker Desktop 开机自启
Docker Desktop 安装后会自动设置开机启动

### Docker 容器开机自启
创建批处理文件 `start.bat`：

```batch
@echo off
cd C:\WebApps\personality-assessment
docker-compose up -d
```

将此批处理添加到 Windows 任务计划程序

---

## ⚠️ 常见问题

### Q1: Docker 无法启动
**解决方案**：
- 确保虚拟化已启用（在 BIOS 中启用 VT-x）
- 安装 WSL 2：`wsl --install`
- 重启计算机

### Q2: 无法访问 localhost:3000
**解决方案**：
```powershell
# 检查服务是否运行
docker-compose ps

# 查看错误日志
docker-compose logs

# 检查防火墙
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*3000*"}
```

### Q3: 端口被占用
**解决方案**：
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程
taskkill /PID <PID> /F
```

### Q4: IIS 502 错误
**解决方案**：
- 确保 Docker 服务正在运行
- 检查反向代理配置
- 查看 IIS 错误日志

---

## 📝 完整部署检查清单

### 软件安装
- [ ] Docker Desktop 已安装并运行
- [ ] 项目文件已复制到服务器
- [ ] 环境变量已配置

### 服务配置
- [ ] Docker 容器已启动
- [ ] 端口 3000 已开放
- [ ] 服务可以本地访问

### 网络配置
- [ ] 防火墙已配置
- [ ] 域名已配置（或 Hosts 已配置）
- [ ] IIS 反向代理已配置（可选）
- [ ] SSL 证书已配置（可选）

### 功能测试
- [ ] 网站可以访问
- [ ] 管理员登录正常
- [ ] 创建任务正常
- [ ] 评测流程正常

---

## 🎉 部署完成！

系统现在已经在 Windows Server 2016 上运行了！

**访问地址**：
- 内网：`http://assessment.company.com`（根据您的配置）
- 公网：`http://yourdomain.com`（如果配置了域名）

**管理员登录**：
- 用户名：`admin`
- 密码：`admin123`

---

## 💡 提示

1. **定期更新系统**
   ```powershell
   git pull
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. **备份数据**
   - 定期备份 `C:\WebApps\personality-assessment\data` 目录

3. **监控服务**
   - 可以创建任务计划程序定期检查服务状态

4. **日志位置**
   - 容器日志：`docker-compose logs`
   - IIS 日志：`C:\inetpub\logs\LogFiles`
