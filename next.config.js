/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除已废弃的 appDir 配置，Next.js 13+ 默认启用
  images: {
    domains: ['localhost'],
  },
  // 生产环境配置
  output: 'standalone', // 用于Docker部署
  // 确保静态资源路径正确
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  // 确保basePath正确
  basePath: '',
}

module.exports = nextConfig
