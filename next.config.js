/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除已废弃的 appDir 配置，Next.js 13+ 默认启用
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // 开发环境配置
  experimental: {
    allowedDevOrigins: ['192.168.0.155'], // 允许开发环境跨域访问
  },
  // 生产环境配置
  output: 'standalone', // 用于Docker部署
}

module.exports = nextConfig



