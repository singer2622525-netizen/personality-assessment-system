# IIS 反向代理配置指南

> 在 Windows Server 2016 上使用 IIS 作为反向代理，将外部请求转发到 Docker 容器

---

## 📋 前提条件

1. ✅ IIS 已安装
2. ✅ Docker 容器正在运行在 3000 端口
3. ✅ 已安装 URL Rewrite 模块

---

## 🔧 安装必需的 IIS 模块

### 第一步：安装 URL Rewrite 模块

1. **下载 URL Rewrite**
   - 访问：https://www.iis.net/downloads/microsoft/url-rewrite
   - 下载并安装 "URL Rewrite Module 2.1"

2. **安装完成后重启 IIS**
   ```powershell
   iisreset
   ```

### 第二步：安装 Application Request Routing (ARR)（可选）

如果需要更强大的代理功能：

1. **下载 ARR**
   - 访问：https://www.iis.net/downloads/microsoft/application-request-routing
   - 下载并安装

2. **启用代理**
   - 打开 IIS 管理器
   - 选择服务器节点
   - 双击"Application Request Routing Cache"
   - 点击右侧"Server Proxy Settings"
   - 勾选"Enable proxy"
   - 点击"Apply"

---

## 🌐 配置 IIS 网站

### 方法 1: 使用 web.config（推荐）

在项目目录创建 `web.config` 文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="ReverseProxyInboundRule1" stopProcessing="true">
                    <match url="(.*)" />
                    <action type="Rewrite" url="http://localhost:3000/{R:1}" />
                    <serverVariables>
                        <set name="HTTP_X_FORWARDED_PROTO" value="HTTPS" />
                    </serverVariables>
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```

### 方法 2: 使用 IIS 管理器配置

1. **创建网站**
   - 打开 IIS 管理器
   - 右键"网站" → "添加网站"
   - 配置：
     ```
     网站名称: PersonalityAssessment
     物理路径: C:\WebApps\personality-assessment\public
     绑定类型: http
     IP 地址: 全部未分配
     端口: 80
     ```
   - 点击"确定"

2. **配置 URL 重写**
   - 选择刚创建的网站
   - 双击"URL 重写"
   - 点击右侧"添加规则"
   - 选择"空白规则"
   - 配置：
     ```
     名称: ReverseProxy
     请求的URL: 与模式匹配
     使用: 正则表达式
     模式: (.*)
     ```
   - 点击"操作"，选择"重写"
   - 重写URL: `http://localhost:3000/{R:1}`
   - 点击"应用"保存

---

## 🔒 配置 HTTPS（可选）

### 创建 HTTPS 绑定

1. 在 IIS 管理器中选择网站
2. 右键 → "绑定"
3. 点击"添加"
4. 配置：
   ```
   类型: https
   IP 地址: 全部未分配
   端口: 443
   SSL 证书: 选择您的证书
   主机名: yourdomain.com
   ```

### 更新 web.config 支持 HTTPS

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <!-- HTTP 重定向到 HTTPS -->
                <rule name="HTTP to HTTPS redirect" stopProcessing="true">
                    <match url="(.*)" />
                    <conditions>
                        <add input="{HTTPS}" pattern="off" />
                    </conditions>
                    <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" />
                </rule>
                
                <!-- 反向代理 -->
                <rule name="ReverseProxyInboundRule1" stopProcessing="true">
                    <match url="(.*)" />
                    <action type="Rewrite" url="http://localhost:3000/{R:1}" />
                    <serverVariables>
                        <set name="HTTP_X_FORWARDED_PROTO" value="https" />
                        <set name="HTTP_X_FORWARDED_FOR" value="{REMOTE_ADDR}" />
                    </serverVariables>
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```

---

## 🌍 配置域名

### 内网部署

1. **配置 Hosts 文件**
   ```
   C:\Windows\System32\drivers\etc\hosts
   ```
   
   添加：
   ```
   192.168.1.100    assessment.company.com
   ```

2. **在 IIS 绑定中添加主机名**
   - 右键网站 → 绑定
   - 编辑绑定 → 主机名填写：`assessment.company.com`

### 公网部署

1. **购买域名**
2. **配置 DNS 解析**（在域名管理平台）
3. **在 IIS 绑定域名**

---

## ✅ 测试配置

### 1. 测试本地访问
```powershell
Invoke-WebRequest http://localhost
```

### 2. 测试域名访问
```powershell
Invoke-WebRequest http://assessment.company.com
```

### 3. 检查反向代理
打开浏览器访问网站，检查：
- ✅ 可以访问
- ✅ 页面正常显示
- ✅ 所有功能正常

---

## 🔧 常见问题

### Q1: 502 Bad Gateway
**解决方案**：
1. 确保 Docker 容器正在运行
   ```powershell
   docker-compose ps
   ```

2. 测试应用是否响应
   ```powershell
   Invoke-WebRequest http://localhost:3000
   ```

### Q2: 静态文件无法加载
**解决方案**：
将静态文件复制到 IIS 网站目录：
```powershell
Copy-Item -Path "C:\WebApps\personality-assessment\.next\static" `
          -Destination "C:\WebApps\personality-assessment\public" -Recurse
```

### Q3: WebSocket 连接失败
**解决方案**：
安装 Application Request Routing (ARR) 并启用 WebSocket 支持

---

## 📊 性能优化

### 启用输出缓存

在 `web.config` 中添加：

```xml
<system.webServer>
    <caching>
        <profiles>
            <add extension=".js" policy="CacheUntilChange" kernelCachePolicy="CacheUntilChange" />
            <add extension=".css" policy="CacheUntilChange" kernelCachePolicy="CacheUntilChange" />
            <add extension=".png" policy="CacheUntilChange" kernelCachePolicy="CacheUntilChange" />
            <add extension=".jpg" policy="CacheUntilChange" kernelCachePolicy="CacheUntilChange" />
        </profiles>
    </caching>
</system.webServer>
```

### 启用 Gzip 压缩

在 IIS 管理器中：
1. 选择服务器节点
2. 双击"压缩"
3. 勾选"启用动态内容压缩"
4. 勾选"启用静态内容压缩"
5. 点击"应用"

---

## 📝 完整配置示例

`web.config`（完整版本）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <!-- URL 重写和反向代理 -->
        <rewrite>
            <rules>
                <!-- HTTPS 重定向（可选） -->
                <rule name="HTTP to HTTPS redirect" stopProcessing="true">
                    <match url="(.*)" />
                    <conditions>
                        <add input="{HTTPS}" pattern="off" />
                    </conditions>
                    <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
                </rule>
                
                <!-- 反向代理到 Docker 容器 -->
                <rule name="ReverseProxyInboundRule1" stopProcessing="true">
                    <match url="(.*)" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="http://localhost:3000/{R:1}" />
                    <serverVariables>
                        <set name="HTTP_X_FORWARDED_PROTO" value="https" />
                        <set name="HTTP_X_FORWARDED_FOR" value="{REMOTE_ADDR}" />
                        <set name="HTTP_X_REAL_IP" value="{REMOTE_ADDR}" />
                    </serverVariables>
                </rule>
            </rules>
            <outboundRules>
                <!-- 确保重写响应 -->
                <rule name="RewriteRelativePaths" preCondition="ResponseIsHtml1">
                    <match filterByTags="A, Img, Link" pattern="^http(s)?://.*/.*\.(css|js|png|jpg|gif)(.*)" />
                    <action type="Rewrite" value="/{R:3}.{R:4}{R:5}" />
                </rule>
                <preConditions>
                    <preCondition name="ResponseIsHtml1">
                        <add input="{RESPONSE_CONTENT_TYPE}" pattern="^text/html" />
                    </preCondition>
                </preConditions>
            </outboundRules>
        </rewrite>
        
        <!-- 压缩 -->
        <urlCompression doStaticCompression="true" doDynamicCompression="true" />
        
        <!-- 缓存配置 -->
        <caching>
            <profiles>
                <add extension=".js" policy="CacheUntilChange" kernelCachePolicy="CacheUntilChange" />
                <add extension=".css" policy="CacheUntilChange" kernelCachePolicy="CacheUntilChange" />
                <add extension=".png" policy="CacheUntilChange" kernelCachePolicy="CacheUntilChange" />
                <add extension=".jpg" policy="CacheUntilChange" kernelCachePolicy="CacheUntilChange" />
            </profiles>
        </caching>
        
        <!-- 默认文档 -->
        <defaultDocument>
            <files>
                <clear />
                <add value="index.html" />
            </files>
        </defaultDocument>
        
        <!-- 错误页面 -->
        <httpErrors errorMode="Detailed" />
    </system.webServer>
</configuration>
```

---

## ✅ 配置完成检查清单

- [ ] IIS 已安装并运行
- [ ] URL Rewrite 模块已安装
- [ ] 网站已创建
- [ ] 反向代理已配置
- [ ] 防火墙端口已开放（80/443）
- [ ] 域名已配置（或 Hosts 已配置）
- [ ] SSL 证书已配置（如果使用 HTTPS）
- [ ] 测试访问成功
- [ ] 功能测试通过

---

完成！现在可以通过 IIS 访问您的系统了。 🎉
