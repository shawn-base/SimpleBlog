import { NextRequest, NextResponse } from 'next/server';
import { deleteTag } from '@/lib/db';

// 配置为动态路由
export const dynamic = "force-dynamic";

// 删除标签
export async function DELETE(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    // 在Next.js 15中，需要先await params
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tag ID' },
        { status: 400 }
      );
    }
    
    // 删除标签
    await deleteTag(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
} 