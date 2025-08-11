'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { useAppStore } from '@/lib/store'
import Link from 'next/link'

export function Header() {
  const { isDarkMode, toggleDarkMode } = useAppStore()

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative flex flex-col items-start group">
              {/* 品牌名称 - 纯文字logo */}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                HONGYU
              </h1>
              <p className="text-sm text-gray-600 font-medium -mt-1">鸿宇工具箱</p>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-pulse"></div>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text">
              外贸工具集合
            </span>
            </div>
          </nav>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-medium text-blue-700">在线服务</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="h-9 w-9 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-orange-500" />
              ) : (
                <Moon className="h-4 w-4 text-blue-600" />
              )}
              <span className="sr-only">切换主题</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 