# ⚠️ 重要：配置 PM2 开机自启

## 📍 为什么需要配置？

系统更新或重启后，PM2 应用可能不会自动启动，导致 502 错误。

配置开机自启后，系统重启时 PM2 会自动启动应用。

---

## 🚀 配置步骤

### 步骤 1：SSH 连接到服务器

```bash
ssh songtuo@192.168.13.44
```

### 步骤 2：生成开机自启配置

```bash
pm2 startup
```

**输出示例：**
```
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u songtuo --hp /home/songtuo
```

### 步骤 3：执行输出的命令

复制 `pm2 startup` 输出的命令（通常是 `sudo` 开头的），然后执行：

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u songtuo --hp /home/songtuo
```

**注意**：命令可能不同，请复制实际输出的命令。

### 步骤 4：保存当前进程列表

```bash
pm2 save
```

---

## ✅ 验证配置

配置完成后，可以验证：

```bash
# 查看 PM2 状态
pm2 list

# 查看开机自启配置
systemctl status pm2-songtuo
```

---

## 🔄 测试（可选）

如果想测试开机自启是否生效：

```bash
# 重启系统（谨慎操作）
sudo reboot
```

重启后，检查 PM2 是否自动启动：

```bash
pm2 list
```

---

## 📝 说明

- 配置只需要执行一次
- 以后系统重启时，PM2 会自动启动应用
- 如果添加新的 PM2 应用，记得执行 `pm2 save` 保存

---

## 🎯 快速配置命令（一键执行）

```bash
ssh songtuo@192.168.13.44 << 'ENDSSH'
pm2 startup
pm2 save
ENDSSH
```

**注意**：`pm2 startup` 输出的命令需要以 root 权限执行，请复制并执行它。

