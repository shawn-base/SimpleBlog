"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 增强版的slug生成函数
function generateSlugFromTitle(title: string): string {
  if (!title) return '';
  
  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  // 移除特殊字符
    .replace(/\s+/g, '-')      // 把空格替换为 -
    .replace(/-+/g, '-')       // 避免重复的 -
    .trim();                    // 移除首尾空格
  
  // 确保生成的slug至少有3个字符
  if (slug.length < 3) {
    // 如果太短，添加时间戳
    const timestamp = Date.now().toString(36).substring(2, 8);
    slug = `${slug || 'post'}-${timestamp}`;
  }
  
  return slug;
}

export default function NewPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    is_published: false,
    tags: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    // 如果标题改变，自动生成slug
    if (name === 'title') {
      // 只有在slug为空或之前是根据标题自动生成的情况下才更新slug
      if (!formData.slug || formData.slug === generateSlugFromTitle(formData.title)) {
        const generatedSlug = generateSlugFromTitle(value);
        
        setFormData(prev => ({
          ...prev,
          slug: generatedSlug,
          [name]: value
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // 准备要提交的数据
      const postData = {
        ...formData,
        // 将标签字符串转为数组，并过滤掉空标签
        tags: formData.tags 
          ? formData.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0)
          : []
      };
      
      // 恢复使用API
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '创建文章失败');
      }
      
      const result = await response.json();
      
      // 提交成功，重定向到文章列表
      router.push('/admin/posts');
      router.refresh();
      
    } catch (error) {
      console.error('提交错误:', error);
      alert(`创建文章时出错: ${error instanceof Error ? error.message : '请重试'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">创建新文章</h1>
        <Link href="/admin/posts" className="text-blue-500 hover:underline">
          返回文章列表
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            {/* 标题 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                标题 *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                id="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">用于URL的唯一标识符，只能包含字母、数字、连字符</p>
            </div>
            
            {/* 摘要 */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                摘要
              </label>
              <textarea
                name="excerpt"
                id="excerpt"
                rows={2}
                value={formData.excerpt}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {/* 正文 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                正文内容 *
              </label>
              <textarea
                name="content"
                id="content"
                rows={15}
                required
                value={formData.content}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono"
                placeholder="支持 Markdown 格式..."
              />
            </div>
            
            {/* 特色图片 */}
            <div>
              <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 mb-1">
                特色图片URL
              </label>
              <input
                type="text"
                name="featured_image"
                id="featured_image"
                value={formData.featured_image}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            {/* 标签 */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                标签
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="标签1, 标签2, 标签3"
              />
              <p className="mt-1 text-xs text-gray-500">多个标签请用逗号分隔</p>
            </div>
            
            {/* 发布状态 */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_published"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={handleChange as any}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_published" className="ml-2 block text-sm font-medium text-gray-700">
                  立即发布
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                不勾选则保存为草稿状态
              </p>
            </div>
            
            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3 pt-4">
              <Link
                href="/admin/posts"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? '保存中...' : '保存文章'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 