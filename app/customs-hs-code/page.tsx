import { CustomsHsCode } from '../components/customs-hs-code/customs-hs-code'

export default function CustomsHsCodePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            服装海关编码查询
          </h1>
          <p className="text-gray-600">
            查询HS编码和申报要素，符合中国海关和税局要求
          </p>
        </div>
        
        <CustomsHsCode />
      </div>
    </div>
  )
} 