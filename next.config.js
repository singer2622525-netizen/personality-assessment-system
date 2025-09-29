/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Vercel 部署配置
  // 移除 output: 'standalone' 因为它会导致静态资源路由问题
}

module.exports = nextConfig
