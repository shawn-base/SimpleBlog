import { NextResponse } from 'next/server';
import { getUserCount } from '@/lib/db';

export async function GET() {
  try {
    const userCount = await getUserCount();
    
    return NextResponse.json({
      hasUsers: userCount > 0,
    });
  } catch (error) {
    console.error('Error checking user count:', error);
    return NextResponse.json(
      { error: 'Failed to check user setup status' },
      { status: 500 }
    );
  }
} 