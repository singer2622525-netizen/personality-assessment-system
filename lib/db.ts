import bcrypt from 'bcryptjs'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

// 数据库文件路径
const dbPath = path.join(process.cwd(), 'data', 'assessment.db')

// 确保data目录存在
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// 创建数据库连接
let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL') // 启用WAL模式，提高并发性能
    initializeDatabase(db)
  }
  return db
}

// 初始化数据库表
function initializeDatabase(db: Database.Database) {
  // 创建管理员用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      company_name TEXT,
      role TEXT DEFAULT 'admin',
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `)

  // 创建评测会话表
  db.exec(`
    CREATE TABLE IF NOT EXISTS assessment_sessions (
      id TEXT PRIMARY KEY,
      unique_id TEXT UNIQUE NOT NULL,
      candidate_name TEXT NOT NULL,
      candidate_email TEXT NOT NULL,
      candidate_phone TEXT NOT NULL,
      position TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      answers TEXT, -- JSON格式存储答案
      results TEXT, -- JSON格式存储结果
      created_at TEXT NOT NULL,
      completed_at TEXT,
      updated_at TEXT
    )
  `)

  // 创建评测任务表
  db.exec(`
    CREATE TABLE IF NOT EXISTS assessment_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      candidate_name TEXT NOT NULL,
      candidate_email TEXT NOT NULL,
      position TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      session_id TEXT,
      created_at TEXT NOT NULL,
      sent_at TEXT,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES admin_users(id)
    )
  `)

  // 创建访问日志表
  db.exec(`
    CREATE TABLE IF NOT EXISTS access_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      resource TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL
    )
  `)

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_unique_id ON assessment_sessions(unique_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON assessment_sessions(status);
    CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON assessment_sessions(created_at);
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON assessment_tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON assessment_tasks(status);
    CREATE INDEX IF NOT EXISTS idx_logs_created_at ON access_logs(created_at);
  `)

  // 创建默认管理员账户（如果不存在）
  const defaultAdmin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get('admin')
  if (!defaultAdmin) {
    const defaultPassword = bcrypt.hashSync('admin123', 10)
    db.prepare(`
      INSERT INTO admin_users (id, username, email, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'admin-001',
      'admin',
      'admin@company.com',
      defaultPassword,
      'admin',
      new Date().toISOString()
    )
  }
}

// 关闭数据库连接
export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}
