import { NextRequest, NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost, ensureUniqueSlug } from '@/lib/db';

// 配置为动态路由，在静态导出模式下也能工作
export const dynamic = "force-dynamic";

// 获取单篇文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 在Next.js 15中，需要先await params
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      );
    }
    
    const post = await getPostById(id);
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 在Next.js 15中，需要先await params
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const body = await request.json();
    
    // 验证必填字段
    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // 检查文章是否存在
    const existingPost = await getPostById(parseInt(id));
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // 如果slug已经改变，确保唯一性
    let slugToUse = body.slug;
    if (existingPost.slug !== body.slug) {
      slugToUse = await ensureUniqueSlug(body.slug);
    }
    
    // 更新文章，使用可能修改过的slug
    const postData = {
      ...body,
      slug: slugToUse
    };
    
    await updatePost(parseInt(id), postData);
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 在Next.js 15中，需要先await params
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      );
    }
    
    // 删除文章
    await deletePost(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
} 