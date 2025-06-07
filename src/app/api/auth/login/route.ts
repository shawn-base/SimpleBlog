import { NextResponse } from 'next/server';
import { verifyUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // Verify user credentials
    const isValid = await verifyUser(username, password);
    
    if (!isValid) {
      return NextResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: '登录成功' 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: '登录过程中出现错误' },
      { status: 500 }
    );
  }
} 