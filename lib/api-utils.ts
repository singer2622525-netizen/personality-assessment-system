// API工具函数 - 用于前端调用API

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api'

// 获取token
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  // 如果有token，添加到请求头
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { message: `请求失败: ${response.status} ${response.statusText}` }
      }
      console.error('API请求失败:', {
        url,
        status: response.status,
        statusText: response.statusText,
        error,
      })
      throw new Error(error.message || error.error || `请求失败: ${response.status}`)
    }

    return response.json()
  } catch (error: any) {
    // 网络错误或其他错误
    console.error('API请求异常:', {
      url,
      error: error.message,
      stack: error.stack,
    })
    throw new Error(error.message || '网络请求失败，请检查网络连接')
  }
}

// 会话相关API
export const sessionApi = {
  // 创建会话
  create: async (data: {
    candidateName: string
    candidateEmail: string
    candidatePhone: string
    position: string
  }) => {
    return apiRequest<{ sessionId: string; uniqueId: string }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 获取会话
  get: async (sessionId: string) => {
    return apiRequest<any>(`/sessions/${sessionId}`)
  },

  // 更新会话
  update: async (sessionId: string, data: any) => {
    return apiRequest(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 保存答案
  saveAnswers: async (sessionId: string, answers: any[]) => {
    return apiRequest(`/sessions/${sessionId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    })
  },

  // 提交评测
  submit: async (sessionId: string, answers: any[]) => {
    return apiRequest(`/sessions/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    })
  },

  // 获取所有会话（管理员）
  getAll: async () => {
    return apiRequest<any[]>('/sessions')
  },
}

// 认证相关API
export const authApi = {
  // 登录
  login: async (username: string, password: string) => {
    return apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  // 注册
  register: async (data: {
    username: string
    email: string
    password: string
    companyName?: string
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 登出
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    })
  },

  // 获取当前用户
  getCurrentUser: async () => {
    return apiRequest<any>('/auth/me')
  },
}

// 任务相关API
export const taskApi = {
  // 创建任务
  create: async (data: {
    candidateName: string
    candidateEmail: string
    position: string
  }) => {
    return apiRequest<{ taskId: string; sessionId: string }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 获取所有任务
  getAll: async () => {
    return apiRequest<any[]>('/tasks')
  },
}
