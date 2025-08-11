'use client'

import { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { TRAINING_DATA, getCategories, getTrainingByCategory, type TrainingItem } from '../../lib/training-data'
import { BookOpen, ChevronDown, ChevronRight, Tag, Search, FileText } from 'lucide-react'

export function TrainingBrowser() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const categories = getCategories()

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const renderTrainingItem = (item: TrainingItem) => {
    const isExpanded = expandedItems.has(item.id)
    
    return (
      <Card key={item.id} className="mb-4 border border-gray-200">
        <div className="p-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleItemExpansion(item.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                {item.tags.length} 标签
              </span>
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {item.content}
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">关键词：</span>
                </div>
                {item.keywords.map((keyword, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">标签：</span>
                </div>
                {item.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 分类浏览 */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">培训资料浏览</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="justify-start"
          >
            <Search className="w-4 h-4 mr-2" />
            全部资料 ({TRAINING_DATA.length})
          </Button>
          {categories.map((category) => {
            const count = getTrainingByCategory(category).length
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="justify-start"
              >
                {category} ({count})
              </Button>
            )
          })}
        </div>
      </Card>

      {/* 培训资料列表 */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-4">
          {selectedCategory ? `${selectedCategory} 相关资料` : '全部培训资料'}
        </h4>
        
        {selectedCategory ? (
          getTrainingByCategory(selectedCategory).map(renderTrainingItem)
        ) : (
          TRAINING_DATA.map(renderTrainingItem)
        )}
      </div>
      
      {/* 使用提示 */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">使用提示</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• 点击资料标题可以展开查看详细内容</p>
              <p>• 关键词和标签可以帮助您快速理解内容要点</p>
              <p>• 您也可以在AI助手中直接提问，系统会自动匹配相关资料</p>
              <p>• 如果没有找到需要的信息，请联系HR部门完善培训资料</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 