import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        ok: false,
        error: 'Supabase configuration not found',
        message: '请在Vercel环境变量中设置SUPABASE_URL和SUPABASE_ANON'
      }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      supabaseUrl,
      supabaseAnonKey: supabaseAnonKey.substring(0, 10) + '...' // 只显示前10个字符
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: 'Internal server error',
      message: '服务器内部错误'
    }, { status: 500 });
  }
} 