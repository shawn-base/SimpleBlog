import { NextRequest, NextResponse } from 'next/server';
import { createPost, getAllPosts } from '@/lib/db';

// 配置为动态路由，在静态导出模式下也能工作
export const dynamic = "force-dynamic";

// 获取所有文章
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const publishedOnly = searchParams.get('published') !== 'false';
    
    const posts = await getAllPosts(limit, offset, publishedOnly);
    
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// 创建新文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // 创建文章 - 唯一性检查已在createPost函数中处理
    const postId = await createPost(body);
    
    return NextResponse.json(
      { success: true, data: { id: postId } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
} 