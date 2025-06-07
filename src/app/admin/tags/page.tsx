"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 确保页面是动态的，不会被缓存
export const dynamic = "force-dynamic";

// 标签类型接口
interface Tag {
  id: number;
  name: string;
  slug: string;
}

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 加载标签数据
  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTags(data.data || []);
        setError(null);
      } else {
        console.error('加载标签失败: 服务器返回错误状态码', response.status);
        setError('加载标签失败，请刷新页面重试');
      }
    } catch (error) {
      console.error('加载标签失败:', error);
      setError('加载标签失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadTags();
  }, []);
  
  // 创建新标签
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      setError('标签名称不能为空');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      
      if (response.ok) {
        // 重新加载标签列表
        await loadTags();
        // 清空输入框
        setNewTagName('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || '创建标签失败');
      }
    } catch (error) {
      console.error('创建标签错误:', error);
      setError('创建标签失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 删除标签
  const handleDeleteTag = async (id: number) => {
    if (!confirm('确定要删除此标签吗？此操作会解除与文章的关联，但不会删除文章。')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
        cache: 'no-store'
      });
      
      if (response.ok) {
        // 重新加载标签列表
        await loadTags();
      } else {
        const errorData = await response.json();
        setError(errorData.error || '删除标签失败');
      }
    } catch (error) {
      console.error('删除标签错误:', error);
      setError('删除标签失败，请重试');
    }
  };
  
  // 手动刷新数据
  const refreshData = () => {
    loadTags();
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">标签管理</h1>
        <button 
          onClick={refreshData}
          className="ml-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-md text-sm transition-colors"
          title="刷新列表"
        >
          刷新
        </button>
      </div>
      
      {/* 创建新标签 */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-4 dark:text-white">创建新标签</h2>
        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleCreateTag} className="flex items-center">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="输入新标签名称"
            className="flex-1 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newTagName.trim()}
            className={`ml-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              (isSubmitting || !newTagName.trim()) ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? '创建中...' : '创建标签'}
          </button>
        </form>
      </div>
      
      {/* 标签列表 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        <div className="p-6 pb-3">
          <h2 className="text-lg font-medium dark:text-white">标签列表</h2>
        </div>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            加载中...
          </div>
        ) : tags.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    标签名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">
                      {tag.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {tag.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="text-red-500 hover:underline"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            暂无标签，请创建第一个标签
          </div>
        )}
      </div>
    </div>
  );
} 