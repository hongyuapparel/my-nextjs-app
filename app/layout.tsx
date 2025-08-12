import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from './components/layout/header'
import { ThemeProvider } from './components/layout/theme-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '鸿宇外贸助手 - Hongyu',
  description: '鸿宇服饰专业外贸工具平台，包含世界时钟、电话查询、AI助手等实用功能',
  keywords: ['鸿宇', '外贸', '工具', '时区', '电话', 'AI', '外贸助手'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
              {children}
            </main>
            <Toaster position="top-right" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 