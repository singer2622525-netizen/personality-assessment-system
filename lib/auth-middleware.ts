import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthUser {
  userId: string
  username: string
  role: string
}

// 验证JWT token
export function verifyToken(request: NextRequest): AuthUser | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    return {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    }
  } catch (error) {
    return null
  }
}

// 获取当前用户（从cookie或header）
export function getCurrentUser(request: NextRequest): AuthUser | null {
  // 优先从Authorization header获取
  const user = verifyToken(request)
  if (user) {
    return user
  }

  // 如果没有，尝试从cookie获取（前端可以设置）
  const token = request.cookies.get('auth_token')?.value
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      }
    } catch (error) {
      return null
    }
  }

  return null
}


