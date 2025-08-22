<<<<<<< HEAD
// 共享验证码存储（生产环境建议使用Redis或数据库）
export const verificationCodes = new Map<string, { 
  code: string, 
  timestamp: number, 
  phone: string 
}>()

export function storeVerificationCode(
  deviceFingerprint: string, 
  code: string, 
  phone: string
) {
  verificationCodes.set(deviceFingerprint, {
    code,
    timestamp: Date.now(),
    phone
  })
}

export function getVerificationCode(deviceFingerprint: string) {
  return verificationCodes.get(deviceFingerprint)
}

export function deleteVerificationCode(deviceFingerprint: string) {
  verificationCodes.delete(deviceFingerprint)
=======
// 共享验证码存储（生产环境建议使用Redis或数据库）
export const verificationCodes = new Map<string, { 
  code: string, 
  timestamp: number, 
  phone: string 
}>()

export function storeVerificationCode(
  deviceFingerprint: string, 
  code: string, 
  phone: string
) {
  verificationCodes.set(deviceFingerprint, {
    code,
    timestamp: Date.now(),
    phone
  })
}

export function getVerificationCode(deviceFingerprint: string) {
  return verificationCodes.get(deviceFingerprint)
}

export function deleteVerificationCode(deviceFingerprint: string) {
  verificationCodes.delete(deviceFingerprint)
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
} 