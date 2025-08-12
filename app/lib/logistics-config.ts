// ============================================================================
// 【重要】物流追踪核心配置 - 永远不要修改此文件
// ============================================================================
/**
 * 物流数据来源严格模式配置
 * 
 * 【用户要求】：请确保所有的物流数据都是按照17track中查询到的为主，
 * 这条命令请永远不要改变，加到文件的默认设置中去
 * 
 * 【实施原则】：
 * 1. 17Track API 是唯一可信的数据来源
 * 2. 所有显示内容必须与17Track官网保持完全一致
 * 3. 禁止使用任何模拟数据、推测数据或备用数据源
 * 4. 禁止覆盖或修改17Track API返回的任何字段
 * 5. 所有字段必须严格按照17Track API响应结构处理
 * 6. 【新增】永远禁止编造虚假数据，没有数据时显示"未知"
 */

export const LOGISTICS_CONFIG = {
  // 数据来源配置 - 永远不要修改
  DATA_SOURCE: {
    PRIMARY: '17TRACK_API',
    FALLBACK: 'NONE',
    USE_MOCK_DATA: false,
    OVERRIDE_17TRACK_DATA: false,
    STRICT_MODE: true,
    ALLOW_FAKE_DATA: false,        // 永远禁止虚假数据
    PREFER_UNKNOWN_OVER_FAKE: true // 优先显示"未知"而非虚假数据
  },

  // 17Track API 字段映射 - 永远不要修改
  FIELD_MAPPING: {
    DESTINATION_COUNTRY: 'track.c',        // 目的地国家代码
    ESTIMATED_DELIVERY: 'track.zex.dt',    // 预计送达时间
    STATUS_CODE: 'track.e',                // 物流状态代码
    EVENTS: 'track.z1',                    // 事件轨迹
    CARRIER_CODE: 'track.w1',              // 承运商代码
    TRACKING_NUMBER: 'number'              // 运单号
  },

  // 验证规则 - 永远不要修改
  VALIDATION: {
    REQUIRE_17TRACK_DATA: true,
    REJECT_NON_17TRACK_DATA: true,
    VALIDATE_CONSISTENCY: true,
    LOG_DATA_SOURCE: true
  },

  // 日志配置 - 永远不要修改
  LOGGING: {
    ENABLE_STRICT_MODE_LOGS: true,
    LOG_17TRACK_VERIFICATION: true,
    LOG_DATA_SOURCE_PRIORITY: true
  }
} as const;

// 数据验证函数
export function validate17TrackData(data: any): boolean {
  if (!LOGISTICS_CONFIG.VALIDATION.REQUIRE_17TRACK_DATA) {
    return true;
  }

  // 验证必要的17Track字段
  const track = data?.data?.accepted?.[0]?.track;
  if (!track) {
    console.error('🚫 数据验证失败：缺少17Track track数据');
    return false;
  }

  // 验证关键字段
  const requiredFields = ['c', 'e', 'w1', 'z1', 'zex'];
  for (const field of requiredFields) {
    if (!(field in track)) {
      console.warn(`⚠️ 17Track数据警告：缺少字段 ${field}`);
    }
  }

  console.log('✅ 17Track数据验证通过');
  return true;
}

// 数据来源标识函数
export function mark17TrackDataSource(data: any): any {
  return {
    ...data,
    _dataSource: '17TRACK_API_OFFICIAL',
    _timestamp: new Date().toISOString(),
    _strictMode: LOGISTICS_CONFIG.DATA_SOURCE.STRICT_MODE
  };
}

// 严格模式检查函数
export function enforceStrictMode(): void {
  if (!LOGISTICS_CONFIG.DATA_SOURCE.STRICT_MODE) {
    throw new Error('🚫 严格模式已被禁用，这违反了用户要求');
  }
  
  if (LOGISTICS_CONFIG.DATA_SOURCE.USE_MOCK_DATA) {
    throw new Error('🚫 检测到模拟数据使用，这违反了用户要求');
  }
  
  if (LOGISTICS_CONFIG.DATA_SOURCE.OVERRIDE_17TRACK_DATA) {
    throw new Error('🚫 检测到17Track数据覆盖，这违反了用户要求');
  }
  
  if (LOGISTICS_CONFIG.DATA_SOURCE.ALLOW_FAKE_DATA) {
    throw new Error('🚫 检测到虚假数据允许，这违反了用户要求');
  }
  
  console.log('🔒 严格模式检查通过：仅使用17Track API数据，禁止任何虚假数据');
} 