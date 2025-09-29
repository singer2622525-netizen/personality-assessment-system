'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Users, BarChart3, FileText } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'admin' | 'candidate'>('admin')

  const handleAdminLogin = () => {
    router.push('/admin/login')
  }

  const handleCandidateAccess = () => {
    router.push('/assessment/start')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* 头部 */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            欢迎参加5型人格评测
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-2">
            广州联创舞台设备有限公司
          </p>
          <p className="text-sm md:text-lg text-gray-500 px-4">
            我们重视每一位候选人的成长与发展，通过科学的人格评测，为您提供更精准的职业发展建议
          </p>
        </div>

        {/* 主要功能区域 - 突出候选人关怀 */}
        <div className="max-w-2xl mx-auto mb-8 md:mb-12">
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <User className="w-8 h-8 md:w-10 md:h-10 text-orange-600" />
              </div>
              <h2 className="text-xl md:text-3xl font-semibold text-gray-900 mb-4">
                开始您的人格评测之旅
              </h2>
              <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-8 px-4">
                通过科学的5型人格评测，深入了解自己的性格特征，获得专业的职业发展建议
              </p>
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <div className="flex items-center justify-center text-gray-600 text-sm md:text-base">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>50道专业题目，约10-15分钟完成</span>
                </div>
                <div className="flex items-center justify-center text-gray-600 text-sm md:text-base">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>基于大五人格理论，科学可靠</span>
                </div>
                <div className="flex items-center justify-center text-gray-600 text-sm md:text-base">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span>个性化分析报告，助力职业发展</span>
                </div>
              </div>
              <button
                onClick={handleCandidateAccess}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 md:py-4 px-6 md:px-8 rounded-lg font-medium hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg text-base md:text-lg"
              >
                立即开始评测
              </button>
            </div>
          </div>
        </div>

        {/* 公司关怀信息 */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 md:p-8 mb-6 md:mb-8">
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
              我们关心您的成长
            </h3>
            <p className="text-sm md:text-lg text-gray-600 mb-4 md:mb-6 px-4">
              广州联创舞台设备有限公司致力于为每一位员工提供良好的发展平台
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">团队协作</h4>
                <p className="text-sm text-gray-600">
                  我们重视团队合作，营造和谐的工作氛围
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">职业发展</h4>
                <p className="text-sm text-gray-600">
                  提供完善的培训体系和晋升通道
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">科学评估</h4>
                <p className="text-sm text-gray-600">
                  通过科学评测，为您的职业规划提供参考
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 管理后台入口 - 放在页面底部 */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mt-6 md:mt-8">
          <div className="text-center">
            <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-3 md:mb-4">
              招聘管理人员入口
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 px-4">
              如果您是招聘管理人员，请点击下方按钮登录管理后台
            </p>
            <button
              onClick={handleAdminLogin}
              className="px-4 md:px-6 py-2 md:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm md:text-base"
            >
              登录管理后台
            </button>
          </div>
        </div>

        {/* 页脚 */}
        <div className="text-center mt-8 text-gray-500">
          <p>© 2024 广州联创舞台设备有限公司</p>
        </div>
      </div>
    </div>
  )
}
