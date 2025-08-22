/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.alicdn.com']
  },
<<<<<<< HEAD
  // 不再通过 env 暴露任何 API 密钥，密钥仅在前端界面填写并存储于 localStorage
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
    }
    return config
=======
  env: {
    // API密钥从环境变量读取，避免暴露在代码中
    AIHUBMIX_API_KEY: process.env.AIHUBMIX_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
  }
}
 
module.exports = nextConfig 