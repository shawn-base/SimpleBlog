"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllPosts } from '@/lib/db';

// 定义Post类型
interface Post {
  id: number;
  title: string;
  slug: string;
  is_published: boolean;
  updated_at: string;
}

// 删除按钮组件
function DeleteButton({ postId, onDeleted }: { postId: number, onDeleted: () => void }) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
          cache: 'no-store'
        });
        if (response.ok) {
          // 调用回调函数通知父组件刷新数据
          onDeleted();
        } else {
          alert('删除失败，请重试');
        }
      } catch (error) {
        console.error('删除错误:', error);
        alert('删除失败，请重试');
      }
    }
  };

  return (
    <button
      type="button"
      className="text-red-500 hover:underline"
      onClick={handleDelete}
    >
      删除
    </button>
  );
}

// 主页面组件
export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        const response = await fetch('/api/posts?published=false', {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        if (response.ok) {
          const data = await response.json();
          setPosts(data.data || []);
        } else {
          console.error('加载文章失败: 服务器返回错误状态码', response.status);
          alert('加载文章失败，请刷新页面重试');
        }
      } catch (error) {
        console.error('加载文章失败:', error);
        alert('加载文章失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);
  
  // 手动刷新数据的函数
  const refreshData = () => {
    router.refresh();
    window.location.reload();
  };

  if (loading) {
    return <div className="text-center py-10">加载中...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">文章管理</h1>
          <button 
            onClick={refreshData}
            className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm transition-colors"
            title="刷新列表"
          >
            刷新
          </button>
        </div>
        <Link 
          href="/admin/posts/new" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          创建新文章
        </Link>
      </div>
      
      {posts.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    标题
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {post.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {post.is_published ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          已发布
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          草稿
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.updated_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-blue-500 hover:underline mr-4"
                      >
                        编辑
                      </Link>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-gray-500 hover:underline mr-4"
                        target="_blank"
                      >
                        查看
                      </Link>
                      <DeleteButton postId={post.id} onDeleted={refreshData} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">暂无文章</p>
          <Link
            href="/admin/posts/new"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            创建第一篇文章
          </Link>
        </div>
      )}
    </div>
  );
} 