import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '5型人格评测系统 - 广州联创舞台设备有限公司',
  description: '专业的5型人格评测系统，为舞台机械设备行业招聘提供科学的人格分析',
  keywords: '人格评测,招聘,5型人格,大五人格,心理测试,舞台设备,机械设备',
  authors: [{ name: '广州联创舞台设备有限公司' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
          {children}
        </div>
      </body>
    </html>
  )
}
