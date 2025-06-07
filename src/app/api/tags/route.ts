import { NextRequest, NextResponse } from 'next/server';
import { getAllTags, createTag } from '@/lib/db';

// 配置为动态路由
export const dynamic = "force-dynamic";

// 获取所有标签
export async function GET(request: NextRequest) {
  try {
    const tags = await getAllTags();
    
    return NextResponse.json({ success: true, data: tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// 创建新标签
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Tag name is required' },
        { status: 400 }
      );
    }
    
    // 生成slug
    const slug = body.slug || body.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 移除特殊字符
      .replace(/\s+/g, '-')     // 把空格替换为 -
      .replace(/-+/g, '-')      // 避免重复的 -
      .trim();                   // 移除首尾空格
    
    // 创建标签
    const tagId = await createTag(body.name, slug);
    
    return NextResponse.json(
      { success: true, data: { id: tagId } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tag:', error);
    
    // 检查是否是唯一性约束错误
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { success: false, error: 'Tag name or slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create tag' },
      { status: 500 }
    );
  }
} 