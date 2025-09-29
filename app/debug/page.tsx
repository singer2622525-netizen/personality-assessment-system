'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DebugTestPage() {
  const router = useRouter()
  const [testData, setTestData] = useState<any>(null)
  const [allStorage, setAllStorage] = useState<any>({})

  useEffect(() => {
    // 检查所有localStorage数据
    const storage: any = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        try {
          storage[key] = JSON.parse(localStorage.getItem(key) || '{}')
        } catch (e) {
          storage[key] = localStorage.getItem(key)
        }
      }
    }
    setAllStorage(storage)

    // 测试创建会话数据
    const testSessionId = 'test-session-123'
    const testSessionData = {
      id: testSessionId,
      candidateName: '测试用户',
      candidateEmail: 'test@example.com',
      candidatePhone: '13800138000',
      position: '测试岗位',
      status: 'in_progress',
      answers: [],
      createdAt: new Date().toISOString(),
      uniqueId: testSessionId
    }

    // 保存测试数据
    localStorage.setItem(`assessmentSession_${testSessionId}`, JSON.stringify(testSessionData))
    
    // 立即读取测试数据
    const savedData = localStorage.getItem(`assessmentSession_${testSessionId}`)
    if (savedData) {
      setTestData(JSON.parse(savedData))
    }
  }, [])

  const clearStorage = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">调试测试页面</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试数据存储</h2>
          <div className="mb-4">
            <h3 className="font-medium mb-2">测试会话数据：</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">所有 localStorage 数据</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(allStorage, null, 2)}
          </pre>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/assessment/start')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            测试开始页面
          </button>
          <button
            onClick={() => router.push('/assessment/test-session-123')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            测试评测页面
          </button>
          <button
            onClick={clearStorage}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            清空存储
          </button>
        </div>
      </div>
    </div>
  )
}
