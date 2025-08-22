<<<<<<< HEAD
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Search, Package, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface HsCodeResult {
  hs_code: string
  description: string
  description_cn: string
  category: string
  tariff_rate: {
    mfn_rate: string
    general_rate: string
    vat_rate: string
    consumption_tax: string
  }
  declaration_elements: {
    element: string
    description: string
    required: boolean
  }[]
  supervision_conditions: string[]
  inspection_quarantine: string[]
  examples: string[]
}

interface ProductCategory {
  name: string
  name_cn: string
  subcategories: string[]
  keywords: string[]
}

const CLOTHING_CATEGORIES: ProductCategory[] = [
  {
    name: 'T-shirts',
    name_cn: 'T恤衫',
    subcategories: ['男装T恤', '女装T恤', '圆领T恤', '运动T恤'],
    keywords: ['t-shirt', 't恤', '圆领', '汗衫', '背心']
  },
  {
    name: 'Shorts',
    name_cn: '短裤',
    subcategories: ['男士短裤', '运动短裤', '休闲短裤', '针织短裤'],
    keywords: ['shorts', '短裤', '男士', '运动', '休闲']
  },
  {
    name: 'Long Pants',
    name_cn: '长裤',
    subcategories: ['休闲裤', '牛仔裤', '西裤', '运动裤'],
    keywords: ['pants', '长裤', '休闲', '牛仔', '西裤']
  },
  {
    name: 'Sweaters',
    name_cn: '毛衣',
    subcategories: ['针织毛衣', '羊毛衫', '开衫', '套头衫'],
    keywords: ['sweater', '毛衣', '针织', '羊毛', '开衫']
  },
  {
    name: 'Jackets & Coats',
    name_cn: '外套大衣',
    subcategories: ['夹克', '风衣', '大衣', '羽绒服'],
    keywords: ['jacket', 'coat', '外套', '夹克', '风衣', '大衣']
  },
  {
    name: 'Tops',
    name_cn: '上衣',
    subcategories: ['衬衫', '女士上衣', '背心', '吊带'],
    keywords: ['top', '上衣', '衬衫', '背心', '吊带']
  },
  {
    name: 'Cotton Items',
    name_cn: '棉制服装',
    subcategories: ['棉T恤', '棉裤', '棉质衬衫', '棉质内衣'],
    keywords: ['cotton', '棉', '棉制', '纯棉', '棉质']
  },
  {
    name: 'Synthetic Fiber',
    name_cn: '化纤服装',
    subcategories: ['聚酯纤维', '尼龙', '化纤混纺', '合成纤维'],
    keywords: ['synthetic', '化纤', '聚酯', '尼龙', '涤纶']
  },
  {
    name: 'Bags',
    name_cn: '手提袋',
    subcategories: ['手提包', '背包', '购物袋', '旅行袋'],
    keywords: ['bag', '袋', '包', '手提', '背包']
  }
]

export function CustomsHsCode() {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<HsCodeResult[]>([])
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('请输入产品名称、描述或HS编码')
      return
    }

    setLoading(true)
    setExpandedItems(new Set()) // 重置展开状态
    
    try {
      // 判断是否是HS编码（数字且长度为8-10位）
      const isHsCode = /^\d{8,10}$/.test(searchQuery.trim())
      
      const response = await fetch('/api/customs-hs-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: isHsCode ? 'lookup_hs_code' : 'search_product',
          query: isHsCode ? undefined : searchQuery,
          hs_code: isHsCode ? searchQuery : undefined,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        if (isHsCode && data.result) {
          // HS编码查询返回单个结果
          setSearchResults([data.result])
          toast.success('查询成功')
        } else if (data.results) {
          // 产品名称查询返回多个结果
          setSearchResults(data.results)
          toast.success(`找到 ${data.results.length} 个相关编码`)
        }
      } else {
        toast.error(data.error || '查询失败')
        setSearchResults([])
      }
    } catch (error) {
      console.error('查询错误:', error)
      toast.error('查询服务暂时不可用')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category: ProductCategory) => {
    setSearchQuery(category.name_cn)
  }

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  const renderDeclarationElements = (elements: HsCodeResult['declaration_elements']) => {
    const requiredElements = elements.filter(e => e.required)
    const optionalElements = elements.filter(e => !e.required)

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">申报要素</h4>
        {requiredElements.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-red-600">必填要素</h5>
            <div className="space-y-1">
              {requiredElements.map((element, idx) => (
                <div key={idx} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                  <span className="font-medium text-red-700">{element.element}:</span>{' '}
                  <span className="text-red-600">{element.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {optionalElements.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-blue-600">可选要素</h5>
            <div className="space-y-1">
              {optionalElements.map((element, idx) => (
                <div key={idx} className="text-sm p-2 bg-blue-50 border border-blue-200 rounded">
                  <span className="font-medium text-blue-700">{element.element}:</span>{' '}
                  <span className="text-blue-600">{element.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            服装产品HS编码查询
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">产品名称、描述或HS编码</label>
            <div className="flex gap-2">
              <Input
                placeholder="输入服装产品名称（如：男士棉制T恤）或10位HS编码（如：6109100010）"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={loading}
                className="px-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">常见服装类别</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CLOTHING_CATEGORIES.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category)}
                  className="p-3 text-left border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-sm">{category.name_cn}</div>
                  <div className="text-xs text-gray-500">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    为您找到 {searchResults.length} 个HS编码选项
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  💡 点击任意结果查看详细申报要素、税率等信息
                </p>
              </div>
              {searchResults.map((result, index) => {
                const isExpanded = expandedItems.has(index)
                return (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div 
                        className="cursor-pointer"
                        onClick={() => toggleExpanded(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg font-bold text-blue-600">{result.hs_code}</span>
                              <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {result.category}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900">{result.description_cn}</p>
                            <p className="text-sm text-gray-600">{result.description}</p>
                          </div>
                          <div className="ml-4 text-gray-400">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t space-y-4">
                          {result.declaration_elements.length > 0 && renderDeclarationElements(result.declaration_elements)}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">最惠国税率:</span>
                              <p className="font-medium">{result.tariff_rate.mfn_rate}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">普通税率:</span>
                              <p className="font-medium">{result.tariff_rate.general_rate}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">增值税率:</span>
                              <p className="font-medium">{result.tariff_rate.vat_rate}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">消费税:</span>
                              <p className="font-medium">{result.tariff_rate.consumption_tax}</p>
                            </div>
                          </div>

                          {result.supervision_conditions.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">监管条件</h4>
                              <div className="flex flex-wrap gap-2">
                                {result.supervision_conditions.map((condition, idx) => (
                                  <span key={idx} className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                    {condition}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {result.examples.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">商品举例</h4>
                              <div className="text-sm text-gray-600">
                                {result.examples.join('、')}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
=======
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Search, Package, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface HsCodeResult {
  hs_code: string
  description: string
  description_cn: string
  category: string
  tariff_rate: {
    mfn_rate: string
    general_rate: string
    vat_rate: string
    consumption_tax: string
  }
  declaration_elements: {
    element: string
    description: string
    required: boolean
  }[]
  supervision_conditions: string[]
  inspection_quarantine: string[]
  examples: string[]
}

interface ProductCategory {
  name: string
  name_cn: string
  subcategories: string[]
  keywords: string[]
}

const CLOTHING_CATEGORIES: ProductCategory[] = [
  {
    name: 'T-shirts',
    name_cn: 'T恤衫',
    subcategories: ['男装T恤', '女装T恤', '圆领T恤', '运动T恤'],
    keywords: ['t-shirt', 't恤', '圆领', '汗衫', '背心']
  },
  {
    name: 'Shorts',
    name_cn: '短裤',
    subcategories: ['男士短裤', '运动短裤', '休闲短裤', '针织短裤'],
    keywords: ['shorts', '短裤', '男士', '运动', '休闲']
  },
  {
    name: 'Long Pants',
    name_cn: '长裤',
    subcategories: ['休闲裤', '牛仔裤', '西裤', '运动裤'],
    keywords: ['pants', '长裤', '休闲', '牛仔', '西裤']
  },
  {
    name: 'Sweaters',
    name_cn: '毛衣',
    subcategories: ['针织毛衣', '羊毛衫', '开衫', '套头衫'],
    keywords: ['sweater', '毛衣', '针织', '羊毛', '开衫']
  },
  {
    name: 'Jackets & Coats',
    name_cn: '外套大衣',
    subcategories: ['夹克', '风衣', '大衣', '羽绒服'],
    keywords: ['jacket', 'coat', '外套', '夹克', '风衣', '大衣']
  },
  {
    name: 'Tops',
    name_cn: '上衣',
    subcategories: ['衬衫', '女士上衣', '背心', '吊带'],
    keywords: ['top', '上衣', '衬衫', '背心', '吊带']
  },
  {
    name: 'Cotton Items',
    name_cn: '棉制服装',
    subcategories: ['棉T恤', '棉裤', '棉质衬衫', '棉质内衣'],
    keywords: ['cotton', '棉', '棉制', '纯棉', '棉质']
  },
  {
    name: 'Synthetic Fiber',
    name_cn: '化纤服装',
    subcategories: ['聚酯纤维', '尼龙', '化纤混纺', '合成纤维'],
    keywords: ['synthetic', '化纤', '聚酯', '尼龙', '涤纶']
  },
  {
    name: 'Bags',
    name_cn: '手提袋',
    subcategories: ['手提包', '背包', '购物袋', '旅行袋'],
    keywords: ['bag', '袋', '包', '手提', '背包']
  }
]

export function CustomsHsCode() {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<HsCodeResult[]>([])
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('请输入产品名称、描述或HS编码')
      return
    }

    setLoading(true)
    setExpandedItems(new Set()) // 重置展开状态
    
    try {
      // 判断是否是HS编码（数字且长度为8-10位）
      const isHsCode = /^\d{8,10}$/.test(searchQuery.trim())
      
      const response = await fetch('/api/customs-hs-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: isHsCode ? 'lookup_hs_code' : 'search_product',
          query: isHsCode ? undefined : searchQuery,
          hs_code: isHsCode ? searchQuery : undefined,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        if (isHsCode && data.result) {
          // HS编码查询返回单个结果
          setSearchResults([data.result])
          toast.success('查询成功')
        } else if (data.results) {
          // 产品名称查询返回多个结果
          setSearchResults(data.results)
          toast.success(`找到 ${data.results.length} 个相关编码`)
        }
      } else {
        toast.error(data.error || '查询失败')
        setSearchResults([])
      }
    } catch (error) {
      console.error('查询错误:', error)
      toast.error('查询服务暂时不可用')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category: ProductCategory) => {
    setSearchQuery(category.name_cn)
  }

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  const renderDeclarationElements = (elements: HsCodeResult['declaration_elements']) => {
    const requiredElements = elements.filter(e => e.required)
    const optionalElements = elements.filter(e => !e.required)

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">申报要素</h4>
        {requiredElements.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-red-600">必填要素</h5>
            <div className="space-y-1">
              {requiredElements.map((element, idx) => (
                <div key={idx} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                  <span className="font-medium text-red-700">{element.element}:</span>{' '}
                  <span className="text-red-600">{element.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {optionalElements.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-blue-600">可选要素</h5>
            <div className="space-y-1">
              {optionalElements.map((element, idx) => (
                <div key={idx} className="text-sm p-2 bg-blue-50 border border-blue-200 rounded">
                  <span className="font-medium text-blue-700">{element.element}:</span>{' '}
                  <span className="text-blue-600">{element.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            服装产品HS编码查询
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">产品名称、描述或HS编码</label>
            <div className="flex gap-2">
              <Input
                placeholder="输入服装产品名称（如：男士棉制T恤）或10位HS编码（如：6109100010）"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={loading}
                className="px-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">常见服装类别</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CLOTHING_CATEGORIES.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category)}
                  className="p-3 text-left border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-sm">{category.name_cn}</div>
                  <div className="text-xs text-gray-500">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    为您找到 {searchResults.length} 个HS编码选项
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  💡 点击任意结果查看详细申报要素、税率等信息
                </p>
              </div>
              {searchResults.map((result, index) => {
                const isExpanded = expandedItems.has(index)
                return (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div 
                        className="cursor-pointer"
                        onClick={() => toggleExpanded(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg font-bold text-blue-600">{result.hs_code}</span>
                              <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {result.category}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900">{result.description_cn}</p>
                            <p className="text-sm text-gray-600">{result.description}</p>
                          </div>
                          <div className="ml-4 text-gray-400">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t space-y-4">
                          {result.declaration_elements.length > 0 && renderDeclarationElements(result.declaration_elements)}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">最惠国税率:</span>
                              <p className="font-medium">{result.tariff_rate.mfn_rate}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">普通税率:</span>
                              <p className="font-medium">{result.tariff_rate.general_rate}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">增值税率:</span>
                              <p className="font-medium">{result.tariff_rate.vat_rate}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">消费税:</span>
                              <p className="font-medium">{result.tariff_rate.consumption_tax}</p>
                            </div>
                          </div>

                          {result.supervision_conditions.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">监管条件</h4>
                              <div className="flex flex-wrap gap-2">
                                {result.supervision_conditions.map((condition, idx) => (
                                  <span key={idx} className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                    {condition}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {result.examples.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">商品举例</h4>
                              <div className="text-sm text-gray-600">
                                {result.examples.join('、')}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
} 