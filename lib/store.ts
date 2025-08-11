import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  metadata?: {
    agent?: {
      id: string
      name: string
      icon: string
    }
    source?: string
  }
}

interface AppState {
  // 暗色模式
  isDarkMode: boolean
  toggleDarkMode: () => void
  
  // 收藏的时区
  favoriteTimezones: string[]
  addFavoriteTimezone: (timezone: string) => void
  removeFavoriteTimezone: (timezone: string) => void
  
  // 聊天记录
  chatMessages: ChatMessage[]
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearChatMessages: () => void
  
  // 17track API 配置
  apiConfig: {
    apiKey: string
    isConfigured: boolean
  }
  setApiKey: (key: string) => void
  clearApiConfig: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      favoriteTimezones: ['Asia/Shanghai', 'America/New_York', 'Europe/London'],
      addFavoriteTimezone: (timezone) => 
        set((state) => ({ 
          favoriteTimezones: [...state.favoriteTimezones, timezone] 
        })),
      removeFavoriteTimezone: (timezone) => 
        set((state) => ({ 
          favoriteTimezones: state.favoriteTimezones.filter(tz => tz !== timezone) 
        })),
      
      chatMessages: [],
      addChatMessage: (message) => 
        set((state) => ({ 
          chatMessages: [...state.chatMessages, {
            ...message,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date()
          }] 
        })),
      clearChatMessages: () => set({ chatMessages: [] }),
      
      // 17track API 配置
      apiConfig: {
        apiKey: '',
        isConfigured: false
      },
      setApiKey: (key: string) => set((state) => ({
        apiConfig: {
          apiKey: key,
          isConfigured: !!key
        }
      })),
      clearApiConfig: () => set((state) => ({
        apiConfig: {
          apiKey: '',
          isConfigured: false
        }
      })),
    }),
    {
      name: 'app-storage',
    }
  )
) 