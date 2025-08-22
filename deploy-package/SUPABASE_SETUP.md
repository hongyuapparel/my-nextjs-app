# 🚀 一键配置 Supabase 云同步（同事无需设置）

## 📋 你要做的（只需要一次）

### 1️⃣ 获取你的 Supabase 信息
1. 打开你的 Supabase 仪表盘
2. 点击左侧 **"Project Settings"**
3. 点击 **"API"**
4. 复制这两个值：
   - **Project URL**（形如：`https://vmgezqjvmcwovjscdogo.supabase.co`）
   - **anon (public)** key（很长一串，以 `eyJ...` 开头）

### 2️⃣ 修改代码文件
1. 打开项目文件夹中的 `lib/supabase.ts` 文件
2. 找到这两行：
   ```typescript
   const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL_HERE'
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'
   ```
3. 替换为你的实际值：
   ```typescript
   const SUPABASE_URL = 'https://vmgezqjvmcwovjscdogo.supabase.co'
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   ```

### 3️⃣ 在 Supabase 中建表
1. 回到 Supabase 仪表盘
2. 点击左侧 **"SQL Editor"**
3. 粘贴下面的代码并运行：

```sql
-- 创建物流记录表
create table if not exists public.logistics_records (
  id text primary key,
  tracking_number text,
  carrier text,
  carrier_name text,
  status text,
  destination text,
  origin text,
  last_update text,
  estimated_delivery text,
  official_url text,
  recipient text,
  tags jsonb,
  is_favorite boolean default false,
  query_count int default 0,
  last_queried text,
  is_api_available boolean,
  api_status text,
  events jsonb,
  is_delivered boolean default false,
  delivery_date text
);

-- 开启实时同步
alter publication supabase_realtime add table public.logistics_records;

-- 允许所有人读写（演示用）
grant select, insert, update, delete on table public.logistics_records to anon;
```

### 4️⃣ 重新部署到 Vercel
1. 将整个项目文件夹压缩成 zip
2. 打开 Vercel → New Project → Upload
3. 选择你的 zip 文件
4. 直接 Deploy（无需设置环境变量）

## 🎉 完成后的效果

- **你的同事**：打开网站就能直接使用云同步，无需任何设置
- **跨设备同步**：公司电脑、家里电脑、手机都能看到相同的物流记录
- **实时更新**：任何设备添加/修改记录，其他设备立即同步

## 🔍 如何验证是否成功

1. 部署后打开物流模块
2. 顶部应该显示：**"云同步状态：✅ 已连接 Supabase"**
3. 添加一个快递单号
4. 在另一台设备/浏览器打开同一网站，应该能看到刚添加的记录

## ❓ 如果显示"连接失败"

检查 `lib/supabase.ts` 中的两行是否已替换为你的真实值，不是 `YOUR_SUPABASE_PROJECT_URL_HERE` 这样的占位符。 