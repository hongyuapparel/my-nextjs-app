-- 修复物流管理系统数据库
-- 删除旧表重新创建

-- 1. 删除旧表（如果存在）
DROP TABLE IF EXISTS public.logistics_records CASCADE;

-- 2. 重新创建表（不依赖auth.users）
CREATE TABLE public.logistics_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT DEFAULT 'anonymous', -- 改为TEXT类型，不依赖auth表
  tracking_number VARCHAR(255) NOT NULL,
  carrier VARCHAR(100) NOT NULL,
  carrier_name VARCHAR(255),
  status VARCHAR(100),
  destination VARCHAR(255),
  origin VARCHAR(255),
  recipient VARCHAR(255),
  notes TEXT,
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  is_delivered BOOLEAN DEFAULT FALSE,
  delivery_date TIMESTAMP,
  estimated_delivery TIMESTAMP,
  last_update TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  query_count INTEGER DEFAULT 0,
  last_queried TIMESTAMP,
  is_api_available BOOLEAN DEFAULT TRUE,
  api_status VARCHAR(50) DEFAULT 'active',
  official_url TEXT,
  events JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. 创建索引
CREATE INDEX idx_logistics_records_user_id ON public.logistics_records(user_id);
CREATE INDEX idx_logistics_records_tracking_number ON public.logistics_records(tracking_number);
CREATE INDEX idx_logistics_records_created_at ON public.logistics_records(created_at DESC);

-- 4. 设置 RLS
ALTER TABLE public.logistics_records ENABLE ROW LEVEL SECURITY;

-- 5. 创建允许所有操作的策略（演示用）
CREATE POLICY "Allow all operations for demo" 
ON public.logistics_records 
FOR ALL 
TO anon, authenticated
USING (true) 
WITH CHECK (true);

-- 6. 启用 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.logistics_records;

-- 7. 创建示例数据
INSERT INTO public.logistics_records (
  tracking_number, carrier, carrier_name, status, destination, recipient
) VALUES 
  ('DHL1234567890', 'dhl', 'DHL Express', '运输中', '上海市', '张三'),
  ('SF2345678901', 'shunfeng', '顺丰速运', '已签收', '深圳市', '李四')
ON CONFLICT (id) DO NOTHING;

-- 8. 验证创建结果
SELECT '✅ 表创建成功，记录数：' || COUNT(*) as result FROM public.logistics_records; 