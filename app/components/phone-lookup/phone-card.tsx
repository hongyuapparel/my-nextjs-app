'use client'

import { Copy, Phone, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { PhoneData } from '../../../lib/data/phone-codes'
import { cn } from '../../../lib/utils'

interface PhoneCardProps {
  phone: PhoneData
  onCopy: (text: string, label: string) => void
}

export function PhoneCard({ phone, onCopy }: PhoneCardProps) {
  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* 国家信息 */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">{phone.flag}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{phone.name}</h3>
              <p className="text-sm text-muted-foreground">{phone.nameEn}</p>
              <p className="text-xs text-muted-foreground">{phone.countryCode}</p>
            </div>
          </div>

          {/* 电话代码 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">国际代码</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(phone.dialCode, `${phone.name}国际代码`)}
                className="flex items-center gap-1 h-7"
              >
                <span className="font-mono text-lg font-bold text-primary">
                  {phone.dialCode}
                </span>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* 号码格式 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">号码格式</span>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="font-mono text-sm">{phone.format}</div>
              <div className="text-xs text-muted-foreground mt-1">
                示例: {phone.example}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(phone.example, `${phone.name}示例号码`)}
              className="w-full text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              复制示例号码
            </Button>
          </div>

          {/* 备注信息 */}
          {phone.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">备注</span>
              </div>
              <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                {phone.notes}
              </div>
            </div>
          )}

          {/* 地区标签 */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {phone.region}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(
                `${phone.name} ${phone.dialCode}\n格式: ${phone.format}\n示例: ${phone.example}`,
                `${phone.name}完整信息`
              )}
              className="text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              复制全部
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 