-- =====================================
-- 物流管理系统 - Supabase 数据库设置
-- =====================================

-- 1. 用户表 (利用 Supabase 内置的 auth.users)
-- Supabase 已提供 auth.users 表，我们创建扩展表

-- 2. 物流记录表
CREATE TABLE IF NOT EXISTS public.logistics_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tracking_number VARCHAR(255) NOT NULL,
  carrier VARCHAR(100) NOT NULL,
  carrier_name VARCHAR(255),
  status VARCHAR(100),
  destination VARCHAR(255),
  origin VARCHAR(255),
  recipient VARCHAR(255),
  notes TEXT,
  tags TEXT[], -- 标签数组
  is_favorite BOOLEAN DEFAULT FALSE,
  is_delivered BOOLEAN DEFAULT FALSE,
  delivery_date TIMESTAMP,
  estimated_delivery TIMESTAMP,
  last_update TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 查询统计
  query_count INTEGER DEFAULT 0,
  last_queried TIMESTAMP,
  
  -- API 状态
  is_api_available BOOLEAN DEFAULT TRUE,
  api_status VARCHAR(50) DEFAULT 'active',
  official_url TEXT,
  
  -- 物流事件 JSON
  events JSONB DEFAULT '[]'::jsonb,
  
  -- 元数据
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_logistics_records_user_id ON public.logistics_records(user_id);
CREATE INDEX IF NOT EXISTS idx_logistics_records_tracking_number ON public.logistics_records(tracking_number);
CREATE INDEX IF NOT EXISTS idx_logistics_records_carrier ON public.logistics_records(carrier);
CREATE INDEX IF NOT EXISTS idx_logistics_records_status ON public.logistics_records(status);
CREATE INDEX IF NOT EXISTS idx_logistics_records_created_at ON public.logistics_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logistics_records_is_favorite ON public.logistics_records(is_favorite) WHERE is_favorite = TRUE;

-- 4. 设置 RLS (Row Level Security)
ALTER TABLE public.logistics_records ENABLE ROW LEVEL SECURITY;

-- 5. 创建 RLS 政策 - 用户只能访问自己的记录
DROP POLICY IF EXISTS "Users can view own logistics records" ON public.logistics_records;
CREATE POLICY "Users can view own logistics records" 
ON public.logistics_records FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own logistics records" ON public.logistics_records;
CREATE POLICY "Users can insert own logistics records" 
ON public.logistics_records FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own logistics records" ON public.logistics_records;
CREATE POLICY "Users can update own logistics records" 
ON public.logistics_records FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own logistics records" ON public.logistics_records;
CREATE POLICY "Users can delete own logistics records" 
ON public.logistics_records FOR DELETE 
USING (auth.uid() = user_id);

-- 6. 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_logistics_records_updated_at ON public.logistics_records;
CREATE TRIGGER update_logistics_records_updated_at
    BEFORE UPDATE ON public.logistics_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. 启用 Realtime (实时同步)
ALTER PUBLICATION supabase_realtime ADD TABLE public.logistics_records;

-- 8. 为匿名用户创建临时访问策略(仅用于演示)
DROP POLICY IF EXISTS "Allow anonymous read for demo" ON public.logistics_records;
CREATE POLICY "Allow anonymous read for demo" 
ON public.logistics_records FOR SELECT 
TO anon
USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert for demo" ON public.logistics_records;
CREATE POLICY "Allow anonymous insert for demo" 
ON public.logistics_records FOR INSERT 
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update for demo" ON public.logistics_records;
CREATE POLICY "Allow anonymous update for demo" 
ON public.logistics_records FOR UPDATE 
TO anon
USING (true);

DROP POLICY IF EXISTS "Allow anonymous delete for demo" ON public.logistics_records;
CREATE POLICY "Allow anonymous delete for demo" 
ON public.logistics_records FOR DELETE 
TO anon
USING (true);

-- 9. 创建一些示例数据
INSERT INTO public.logistics_records (
  id, user_id, tracking_number, carrier, carrier_name, status, destination, recipient
) VALUES 
  (
    gen_random_uuid(), 
    NULL, -- 匿名用户
    'DHL1234567890', 
    'dhl', 
    'DHL Express', 
    '运输中', 
    '上海市', 
    '张三'
  ),
  (
    gen_random_uuid(), 
    NULL, -- 匿名用户
    'SF2345678901', 
    'shunfeng', 
    '顺丰速运', 
    '已签收', 
    '深圳市', 
    '李四'
  )
ON CONFLICT (id) DO NOTHING;

-- 完成提示
SELECT '✅ 物流管理系统数据库设置完成！' as status; 