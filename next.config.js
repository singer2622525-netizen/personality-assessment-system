/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // 生产环境配置
  output: 'standalone', // 用于Docker部署
}

module.exports = nextConfig
