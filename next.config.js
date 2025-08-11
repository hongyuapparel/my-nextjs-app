/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.alicdn.com']
  },
  env: {
    // API密钥从环境变量读取，避免暴露在代码中
    AIHUBMIX_API_KEY: process.env.AIHUBMIX_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
  }
}
 
module.exports = nextConfig 