import { getAllPosts } from '@/lib/db';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 获取所有已发布的文章
  const posts = await getAllPosts(1000, 0, true);
  
  // 基础URL
  const baseUrl = 'https://ds.dannyhkk.cn';
  
  // 静态页面
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
  ];
  
  // 文章页面
  const postPages = posts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  return [...staticPages, ...postPages];
} 