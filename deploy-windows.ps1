# 招聘人格评测系统 - Windows 一键部署脚本
# 适用于 Windows Server 2016+
# 需要以管理员身份运行

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ 请以管理员身份运行此脚本" -ForegroundColor Red
    Write-Host "   右键点击脚本，选择'以管理员身份运行'" -ForegroundColor Yellow
    Read-Host "按 Enter 键退出"
    exit 1
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   招聘人格评测系统 - Windows 部署脚本" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 配置变量
$ProjectDir = "C:\WebApps\personality-assessment"
$Domain = ""
$EnableHTTPS = $false

Write-Host "📋 部署配置" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

# 获取域名
$Domain = Read-Host "请输入域名（例如: assessment.company.com，留空使用 IP 访问）"

# 获取是否启用 HTTPS
$enableHttpsInput = Read-Host "是否启用 HTTPS? [y/n] (默认: n)"
if ($enableHttpsInput -eq "y" -or $enableHttpsInput -eq "Y") {
    $EnableHTTPS = $true
}

Write-Host ""
Write-Host "⏳ 开始部署..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

# 1. 检查 Docker
Write-Host "[1/6] 检查 Docker..." -ForegroundColor Green

try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "  ✓ Docker 已安装: $dockerVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "  ❌ Docker 未安装" -ForegroundColor Red
    Write-Host "  请先安装 Docker Desktop for Windows" -ForegroundColor Yellow
    Write-Host "  下载地址: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Read-Host "按 Enter 键退出"
    exit 1
}

# 2. 检查 Docker 服务是否运行
Write-Host "[2/6] 检查 Docker 服务..." -ForegroundColor Green
try {
    docker ps | Out-Null
    Write-Host "  ✓ Docker 服务正在运行" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker 服务未运行" -ForegroundColor Red
    Write-Host "  请启动 Docker Desktop" -ForegroundColor Yellow
    Read-Host "按 Enter 键退出"
    exit 1
}

# 3. 创建项目目录
Write-Host "[3/6] 创建项目目录..." -ForegroundColor Green
if (-not (Test-Path $ProjectDir)) {
    New-Item -ItemType Directory -Path $ProjectDir -Force | Out-Null
    Write-Host "  ✓ 目录已创建: $ProjectDir" -ForegroundColor Green
} else {
    Write-Host "  ✓ 目录已存在: $ProjectDir" -ForegroundColor Green
}

Write-Host ""
Write-Host "⚠️  重要提示: 请确保项目文件已准备好" -ForegroundColor Yellow
Write-Host "   项目文件应位于: $ProjectDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "   可以使用以下方法之一准备文件:" -ForegroundColor Yellow
Write-Host "   1) Git: git clone <repo-url> $ProjectDir" -ForegroundColor Cyan
Write-Host "   2) 复制: 将项目文件夹复制到 $ProjectDir" -ForegroundColor Cyan
Write-Host "   3) 解压: 解压项目压缩包到 $ProjectDir" -ForegroundColor Cyan
Write-Host ""

$confirmation = Read-Host "项目文件已准备好? [按 Enter 继续 / 输入任意键退出]"
if ($confirmation -ne "") {
    exit 0
}

# 4. 检查项目文件
Write-Host "[4/6] 检查项目文件..." -ForegroundColor Green
$packageJson = Join-Path $ProjectDir "package.json"
if (-not (Test-Path $packageJson)) {
    Write-Host "  ❌ 未找到项目文件" -ForegroundColor Red
    Write-Host "  请将项目文件放置在: $ProjectDir" -ForegroundColor Yellow
    Read-Host "按 Enter 键退出"
    exit 1
}
Write-Host "  ✓ 项目文件检查通过" -ForegroundColor Green

# 5. 构建并启动服务
Write-Host "[5/6] 构建并启动服务..." -ForegroundColor Green
Set-Location $ProjectDir

Write-Host "  正在构建 Docker 镜像，请稍候..." -ForegroundColor Yellow
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ 构建失败" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}

Write-Host "  正在启动服务..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ 启动失败" -ForegroundColor Red
    Read-Host "按 Enter 键退出"
    exit 1
}

Write-Host "  ✓ 服务启动成功" -ForegroundColor Green

# 等待服务启动
Write-Host "  等待服务就绪..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 6. 配置防火墙
Write-Host "[6/6] 配置防火墙..." -ForegroundColor Green

try {
    # 允许端口 3000
    New-NetFirewallRule -DisplayName "Personality Assessment" `
        -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow `
        -ErrorAction SilentlyContinue | Out-Null
    Write-Host "  ✓ 防火墙规则已配置" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  防火墙规则可能已存在" -ForegroundColor Yellow
}

# 测试服务
Write-Host ""
Write-Host "🧪 测试服务..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "  ✓ 服务运行正常" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  服务可能还在启动中，请稍后再试" -ForegroundColor Yellow
    Write-Host "     可以运行命令测试: Invoke-WebRequest http://localhost:3000" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 访问地址:" -ForegroundColor Yellow
if ($Domain) {
    Write-Host "   http://$Domain" -ForegroundColor Cyan
} else {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress
    Write-Host "   http://$ip:3000" -ForegroundColor Cyan
    Write-Host "   或 http://localhost:3000" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "📊 管理命令:" -ForegroundColor Yellow
Write-Host "   查看日志: docker-compose logs -f" -ForegroundColor Cyan
Write-Host "   重启服务: docker-compose restart" -ForegroundColor Cyan
Write-Host "   查看状态: docker-compose ps" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 提示:" -ForegroundColor Yellow
Write-Host "   - 如需外网访问，请配置域名 DNS 解析" -ForegroundColor Gray
Write-Host "   - 管理员账号: admin / admin123" -ForegroundColor Gray
Write-Host ""

Read-Host "按 Enter 键退出"
