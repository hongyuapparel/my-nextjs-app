import { AddressVerification } from '../components/address-verification/address-verification'

export default function AddressVerificationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            全球地址查询验证
          </h1>
          <p className="text-gray-600">
            验证全球运输地址，查询城市邮编，确保客户地址准确性
          </p>
        </div>
        
        <AddressVerification />
      </div>
    </div>
  )
} 