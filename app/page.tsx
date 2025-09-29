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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)' }}>
      <div style={{ maxWidth: '1024px', width: '100%' }}>
        {/* 头部 */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            欢迎参加5型人格评测
          </h1>
          <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '8px' }}>
            广州联创舞台设备有限公司
          </p>
          <p style={{ fontSize: '16px', color: '#9ca3af', padding: '0 16px' }}>
            我们重视每一位候选人的成长与发展，通过科学的人格评测，为您提供更精准的职业发展建议
          </p>
        </div>

        {/* 主要功能区域 */}
        <div style={{ maxWidth: '768px', margin: '0 auto 48px' }}>
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '32px', transition: 'box-shadow 0.3s' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <User style={{ width: '40px', height: '40px', color: '#ea580c' }} />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                开始您的人格评测之旅
              </h2>
              <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px', padding: '0 16px' }}>
                通过科学的5型人格评测，深入了解自己的性格特征，获得专业的职业发展建议
              </p>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#f97316', borderRadius: '50%', marginRight: '12px' }}></div>
                  <span>50道专业题目，约10-15分钟完成</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#f97316', borderRadius: '50%', marginRight: '12px' }}></div>
                  <span>基于大五人格理论，科学可靠</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '14px' }}>
                  <div style={{ width: '8px', height: '8px', background: '#f97316', borderRadius: '50%', marginRight: '12px' }}></div>
                  <span>个性化分析报告，助力职业发展</span>
                </div>
              </div>
              <button
                onClick={handleCandidateAccess}
                style={{ width: '100%', background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)', color: 'white', padding: '16px 32px', borderRadius: '8px', fontWeight: '500', fontSize: '18px', border: 'none', cursor: 'pointer', transition: 'all 0.3s', transform: 'scale(1)' }}
                onMouseOver={(e) => { e.target.style.background = 'linear-gradient(135deg, #ea580c 0%, #ca8a04 100%)'; e.target.style.transform = 'scale(1.05)' }}
                onMouseOut={(e) => { e.target.style.background = 'linear-gradient(135deg, #f97316 0%, #eab308 100%)'; e.target.style.transform = 'scale(1)' }}
              >
                立即开始评测
              </button>
            </div>
          </div>
        </div>

        {/* 公司关怀信息 */}
        <div style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)', borderRadius: '12px', padding: '32px', marginBottom: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
              我们关心您的成长
            </h3>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px', padding: '0 16px' }}>
              广州联创舞台设备有限公司致力于为每一位员工提供良好的发展平台
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: '#fed7aa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Users style={{ width: '24px', height: '24px', color: '#ea580c' }} />
                </div>
                <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>团队协作</h4>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  我们重视团队合作，营造和谐的工作氛围
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <BarChart3 style={{ width: '24px', height: '24px', color: '#eab308' }} />
                </div>
                <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>职业发展</h4>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  提供完善的培训体系和晋升通道
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: '#fed7aa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <FileText style={{ width: '24px', height: '24px', color: '#ea580c' }} />
                </div>
                <h4 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>科学评估</h4>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  通过科学评测，为您的职业规划提供参考
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 管理后台入口 */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '24px', marginTop: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
              招聘管理人员入口
            </h3>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '16px', padding: '0 16px' }}>
              如果您是招聘管理人员，请点击下方按钮登录管理后台
            </p>
            <button
              onClick={handleAdminLogin}
              style={{ padding: '12px 24px', background: '#4b5563', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', transition: 'background-color 0.3s' }}
              onMouseOver={(e) => { e.target.style.background = '#374151' }}
              onMouseOut={(e) => { e.target.style.background = '#4b5563' }}
            >
              登录管理后台
            </button>
          </div>
        </div>

        {/* 页脚 */}
        <div style={{ textAlign: 'center', marginTop: '32px', color: '#9ca3af' }}>
          <p>© 2024 广州联创舞台设备有限公司</p>
        </div>
      </div>
    </div>
  )
}
