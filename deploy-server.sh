#!/bin/bash

# 招聘人格评测系统 - 服务器快速部署脚本
# 使用前请确保：1) 已配置域名DNS解析 2) 服务器已安装Docker

set -e  # 遇到错误立即退出

echo "========================================="
echo "  招聘人格评测系统 - 服务器部署脚本"
echo "========================================="
echo ""

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请使用 root 权限运行此脚本"
    echo "   运行命令: sudo bash deploy-server.sh"
    exit 1
fi

# 配置变量
PROJECT_DIR="/opt/personality-assessment"
DOMAIN=""
USE_HTTPS=false

echo "📋 部署配置"
echo "----------------------------------------"
read -p "请输入您的域名（例如: assessment.example.com）: " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo "❌ 域名不能为空"
    exit 1
fi

read -p "是否启用 HTTPS (推荐)? [y/n]: " enable_https
if [[ $enable_https =~ ^[Yy]$ ]]; then
    USE_HTTPS=true
fi

echo ""
echo "⏳ 开始部署..."
echo "----------------------------------------"

# 1. 安装 Docker
echo "[1/7] 检查并安装 Docker..."
if ! command -v docker &> /dev/null; then
    echo "  正在安装 Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl start docker
    systemctl enable docker
else
    echo "  ✓ Docker 已安装"
fi

# 2. 安装 Docker Compose
echo "[2/7] 检查并安装 Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "  正在安装 Docker Compose..."
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f 4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "  ✓ Docker Compose 已安装"
fi

# 3. 安装 Nginx
echo "[3/7] 检查并安装 Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "  正在安装 Nginx..."
    if [ -f /etc/redhat-release ]; then
        yum install -y nginx
    else
        apt update && apt install -y nginx
    fi
    systemctl enable nginx
else
    echo "  ✓ Nginx 已安装"
fi

# 4. 创建项目目录
echo "[4/7] 创建项目目录..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

echo "⚠️  重要提示: 请确保您已将项目文件上传到服务器"
echo "   可以使用以下方法之一:"
echo "   1) Git: git clone <repository-url>"
echo "   2) SCP: scp -r project/ root@server:/opt/personality-assessment/"
echo "   3) 压缩包: 解压到 $PROJECT_DIR"
echo ""
read -p "项目文件已准备好? [按Enter继续] " 

if [ ! -f "$PROJECT_DIR/package.json" ]; then
    echo "❌ 未找到项目文件，请先上传项目到 $PROJECT_DIR"
    exit 1
fi

# 5. 配置 Nginx
echo "[5/7] 配置 Nginx..."
cat > /etc/nginx/sites-available/personality-assessment <<EOF
server {
    listen 80;
    server_name ${DOMAIN};
    
    access_log /var/log/nginx/personality-assessment-access.log;
    error_log /var/log/nginx/personality-assessment-error.log;
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
}
EOF

# 创建软链接（Ubuntu/Debian）
if [ -d /etc/nginx/sites-available ]; then
    ln -sf /etc/nginx/sites-available/personality-assessment /etc/nginx/sites-enabled/
fi

nginx -t
systemctl reload nginx

# 6. 配置 SSL（如果需要）
if [ "$USE_HTTPS" = true ]; then
    echo "[6/7] 配置 SSL 证书..."
    
    if ! command -v certbot &> /dev/null; then
        echo "  正在安装 Certbot..."
        if [ -f /etc/redhat-release ]; then
            yum install -y epel-release
            yum install -y certbot python3-certbot-nginx
        else
            apt install -y certbot python3-certbot-nginx
        fi
    fi
    
    echo "⚠️  接下来需要配置 SSL 证书..."
    echo "   请按提示输入您的邮箱地址"
    certbot --nginx -d $DOMAIN
    
    if [ $? -eq 0 ]; then
        echo "  ✓ SSL 证书配置成功"
    else
        echo "  ⚠️  SSL 证书配置失败，您可以稍后手动配置"
    fi
else
    echo "[6/7] 跳过 SSL 配置"
fi

# 7. 启动 Docker 服务
echo "[7/7] 启动 Docker 服务..."
cd $PROJECT_DIR

if [ ! -f "docker-compose.yml" ]; then
    echo "  使用基础 docker-compose.yml"
    cat > docker-compose.yml <<'COMPOSE_EOF'
version: '3.8'

services:
  personality-assessment:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
COMPOSE_EOF
fi

docker-compose build
docker-compose up -d

# 等待服务启动
echo "  等待服务启动..."
sleep 10

# 检查服务状态
if docker-compose ps | grep -q "Up"; then
    echo "  ✓ 服务启动成功"
else
    echo "  ⚠️  服务可能未正常启动，请检查日志: docker-compose logs"
fi

# 配置防火墙
echo ""
echo "🔧 配置防火墙..."
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
    echo "  ✓ FirewallD 配置完成"
elif command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    ufw --force enable
    echo "  ✓ UFW 配置完成"
fi

echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo ""
echo "📍 访问地址:"
if [ "$USE_HTTPS" = true ]; then
    echo "   https://${DOMAIN}"
else
    echo "   http://${DOMAIN}"
fi
echo ""
echo "📊 管理命令:"
echo "   查看日志: docker-compose logs -f"
echo "   重启服务: docker-compose restart"
echo "   查看状态: docker-compose ps"
echo ""
echo "⚠️  注意事项:"
echo "   1. 确保域名 DNS 已解析到本服务器 IP"
echo "   2. 如使用云服务器，请确保安全组已开放 80/443 端口"
echo "   3. 首次访问可能需要等待域名解析生效（5-30分钟）"
echo ""
