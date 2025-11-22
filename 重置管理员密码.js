// 重置管理员密码脚本
// 使用方法：node 重置管理员密码.js [新密码]

const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

// 数据库路径
const dbPath = path.join(__dirname, 'data', 'assessment.db')

// 检查数据库是否存在
if (!fs.existsSync(dbPath)) {
  console.error('❌ 数据库文件不存在：', dbPath)
  console.log('💡 提示：请先运行一次应用程序，数据库会自动创建')
  process.exit(1)
}

// 连接数据库
const db = new Database(dbPath)

// 获取新密码（从命令行参数或使用默认值）
const newPassword = process.argv[2] || 'admin123'

// 生成密码哈希
const passwordHash = bcrypt.hashSync(newPassword, 10)

try {
  // 查找管理员账户
  const admin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get('admin')

  if (!admin) {
    // 如果不存在，创建管理员账户
    console.log('📝 管理员账户不存在，正在创建...')
    db.prepare(`
      INSERT INTO admin_users (id, username, email, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'admin-001',
      'admin',
      'admin@company.com',
      passwordHash,
      'admin',
      new Date().toISOString()
    )
    console.log('✅ 管理员账户创建成功！')
  } else {
    // 更新密码
    console.log('📝 正在重置管理员密码...')
    db.prepare(`
      UPDATE admin_users
      SET password_hash = ?, updated_at = ?
      WHERE username = ?
    `).run(passwordHash, new Date().toISOString(), 'admin')
    console.log('✅ 密码重置成功！')
  }

  console.log('')
  console.log('=== ✅ 管理员账户信息 ===')
  console.log('用户名：admin')
  console.log('密码：' + newPassword)
  console.log('邮箱：admin@company.com')
  console.log('')
  console.log('💡 提示：')
  console.log('  - 默认密码是：admin123')
  console.log('  - 如果要设置新密码，运行：node 重置管理员密码.js 你的新密码')

} catch (error) {
  console.error('❌ 重置密码失败：', error.message)
  process.exit(1)
} finally {
  db.close()
}


