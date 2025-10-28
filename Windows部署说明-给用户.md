# 📦 Windows Server 2016 部署说明

> 专门为您的同事准备的 Windows 服务器部署指南

---

## ✅ 重要提示：不需要修改程序文件！

您的程序文件**完全不需要修改**，可以在 Windows Server 2016 上直接使用！

我为您准备了：
- ✅ Windows 专用部署脚本
- ✅ 详细的部署文档
- ✅ IIS 反向代理配置
- ✅ 所有需要的配置文件

---

## 🎯 部署方式选择

### 方案一：纯 Docker（推荐，最简单）

**适合场景**：只需要在 Windows 服务器上运行，使用 IP 或简单域名访问

**部署步骤**：
1. 在服务器上安装 Docker Desktop
2. 运行 `deploy-windows.ps1` 脚本
3. 完成！

**文档**：查看 `Windows服务器部署指南.md`

---

### 方案二：Docker + IIS（推荐用于正式环境）

**适合场景**：需要 IIS 作为反向代理，支持域名、SSL 证书

**部署步骤**：
1. 按照"方案一"部署 Docker 容器
2. 配置 IIS 反向代理
3. 配置域名和 SSL

**文档**：
- `Windows服务器部署指南.md` - 完整步骤
- `IIS反向代理配置.md` - IIS 详细配置

---

## 📋 快速开始（3步）

### 第一步：准备服务器

在 Windows Server 2016 上安装：

1. **Docker Desktop**
   - 下载：https://www.docker.com/products/docker-desktop
   - 安装并重启服务器

2. **PowerShell**（系统自带，无需安装）

### 第二步：准备项目文件

将项目文件夹复制到服务器：
```
C:\WebApps\personality-assessment\
```

### 第三步：运行部署

**以管理员身份运行 PowerShell**：

```powershell
# 进入项目目录
cd C:\WebApps\personality-assessment

# 运行部署脚本
.\deploy-windows.ps1
```

按照提示操作即可！

---

## 📁 重要文件说明

### 给管理员同事的文件

| 文件 | 说明 | 是否必需 |
|------|------|---------|
| `Windows服务器部署指南.md` | ✅ **必读** - 完整部署步骤 | ✅ |
| `deploy-windows.ps1` | ✅ **必用** - 一键部署脚本 | ✅ |
| `web.config` | IIS 配置（可选） | ⬜ |
| `IIS反向代理配置.md` | IIS 详细配置（可选） | ⬜ |

### 原有文件（不需要修改）

所有原有的程序文件都可以直接使用：
- ✅ `app/` - 应用代码，**不需要修改**
- ✅ `lib/` - 业务逻辑，**不需要修改**
- ✅ `package.json` - 依赖配置，**不需要修改**
- ✅ `Dockerfile` - Docker 配置，**不需要修改**
- ✅ `docker-compose.yml` - Compose 配置，**不需要修改**

**只有一点需要注意**：
确保项目目录包含 `docker-compose.yml` 文件！

---

## 🛠️ 详细步骤

### 1. 安装 Docker Desktop

1. 下载 Docker Desktop for Windows
2. 双击安装
3. 按照向导完成安装
4. **重要**：安装完成后必须重启服务器
5. 启动 Docker Desktop，等待图标显示运行中

### 2. 准备项目文件

**方法 A：直接复制**（推荐）
```
1. 将整个项目文件夹复制到 C:\WebApps\personality-assessment
2. 确保文件夹包含所有文件
```

**方法 B：使用 Git**
```powershell
New-Item -ItemType Directory -Path "C:\WebApps\personality-assessment" -Force
Set-Location "C:\WebApps\personality-assessment"
git clone <repository-url> .
```

### 3. 运行部署脚本

```powershell
# 以管理员身份运行 PowerShell
cd C:\WebApps\personality-assessment

# 首次运行需要允许脚本执行
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# 运行部署脚本
.\deploy-windows.ps1
```

### 4. 配置访问

**内网访问**：
在 Hosts 文件添加域名映射：
```
C:\Windows\System32\drivers\etc\hosts

添加：
192.168.1.100    assessment.local
```

浏览器访问：`http://assessment.local:3000`

---

## 🔧 管理命令

### 查看服务状态
```powershell
cd C:\WebApps\personality-assessment
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
# 如果有 Git
git pull
docker-compose build --no-cache
docker-compose up -d
```

---

## ❓ 常见问题

### Q1: PowerShell 脚本无法执行

**错误**：`无法加载文件，因为在此系统上禁止运行脚本`

**解决方案**：
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q2: Docker 无法启动

**解决方案**：
1. 确保虚拟化已启用（在 BIOS 中启用 VT-x）
2. 安装 WSL 2：
   ```powershell
   wsl --install
   ```
3. 重启服务器

### Q3: 端口被占用

**解决方案**：
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程
taskkill /PID <PID> /F
```

### Q4: 如何外网访问

**需要配置**：
1. 配置域名 DNS 解析
2. 在云平台配置安全组（开放端口）
3. 配置防火墙规则
4. （可选）配置 IIS 反向代理

详细步骤见 `Windows服务器部署指南.md`

---

## 📊 系统要求

### 服务器配置
- 操作系统：Windows Server 2016+
- CPU：2核以上
- 内存：4GB 以上
- 硬盘：20GB 以上可用空间

### 必需软件
- Docker Desktop 20.10+
- PowerShell 5.1+（系统自带）
- （可选）IIS 10.0+

---

## ✅ 部署检查清单

### 安装检查
- [ ] Docker Desktop 已安装
- [ ] Docker 服务正在运行
- [ ] 项目文件已复制到服务器
- [ ] 所有配置文件都存在

### 配置检查
- [ ] 防火墙端口已开放
- [ ] 服务可以正常访问
- [ ] 功能测试通过

### 功能检查
- [ ] 网站可以访问
- [ ] 管理员登录正常
- [ ] 创建任务正常
- [ ] 评测功能正常

---

## 🎉 完成！

系统已经可以在 Windows Server 2016 上运行了！

访问地址：`http://服务器IP:3000`

管理员账号：
- 用户名：`admin`
- 密码：`admin123`

---

## 📚 详细文档

- **必读**：`Windows服务器部署指南.md` - 完整部署步骤
- **参考**：`IIS反向代理配置.md` - IIS 详细配置（如果使用 IIS）

---

**提示**：所有程序文件都不需要修改，现有的文件可以直接使用！
