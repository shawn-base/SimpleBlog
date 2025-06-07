import { NextResponse } from 'next/server';
import { getUserCount, createUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Check if users already exist
    const userCount = await getUserCount();
    if (userCount > 0) {
      return NextResponse.json(
        { message: '管理员账户已存在，无法重新设置' },
        { status: 400 }
      );
    }

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

    // Create the admin user
    await createUser(username, password);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting up admin user:', error);
    return NextResponse.json(
      { message: '创建管理员账户失败' },
      { status: 500 }
    );
  }
} 