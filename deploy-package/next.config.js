/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.alicdn.com']
  },
  // 不再通过 env 暴露任何 API 密钥，密钥仅在前端界面填写并存储于 localStorage
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
    }
    return config
  }
}
 
module.exports = nextConfig 