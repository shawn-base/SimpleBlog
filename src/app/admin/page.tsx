import Link from 'next/link';
import { getAllPosts } from '@/lib/db';

// 确保页面是动态的，不会被缓存
export const dynamic = "force-dynamic";

// 定义文章类型接口
interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  updated_at: string;
  is_published: boolean;
  tags?: any[];
}

export default async function AdminDashboard() {
  const posts = await getAllPosts(5, 0, false) as Post[];
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">仪表盘</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 快速统计 */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4 dark:text-white">内容概览</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-300">文章总数</p>
              <p className="text-2xl font-bold dark:text-white">{posts.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-300">已发布</p>
              <p className="text-2xl font-bold dark:text-white">{posts.filter((p: Post) => p.is_published).length}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-300">草稿</p>
              <p className="text-2xl font-bold dark:text-white">{posts.filter((p: Post) => !p.is_published).length}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-300">最近更新</p>
              <p className="text-2xl font-bold dark:text-white">{posts.length > 0 ? new Date(posts[0].updated_at).toLocaleDateString() : '无'}</p>
            </div>
          </div>
        </div>
        
        {/* 快速操作 */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4 dark:text-white">快速操作</h2>
          <div className="space-y-3">
            <Link 
              href="/admin/posts/new" 
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded-md transition-colors"
            >
              创建新文章
            </Link>
            <Link 
              href="/admin/posts" 
              className="block w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-center py-2 px-4 rounded-md transition-colors"
            >
              管理所有文章
            </Link>
            <Link 
              href="/admin/tags" 
              className="block w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-center py-2 px-4 rounded-md transition-colors"
            >
              管理标签
            </Link>
            <Link 
              href="/" 
              className="block w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-center py-2 px-4 rounded-md transition-colors"
            >
              查看网站
            </Link>
          </div>
        </div>
      </div>
      
      {/* 最近文章 */}
      <div className="mt-8 bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium dark:text-white">最近文章</h2>
          <Link href="/admin/posts" className="text-blue-500 hover:underline text-sm">
            查看全部
          </Link>
        </div>
        {posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">标题</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">状态</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">更新时间</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 dark:text-gray-300">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post: Post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm dark:text-white">{post.title}</td>
                    <td className="px-4 py-3 text-sm">
                      {post.is_published ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full text-xs">已发布</span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded-full text-xs">草稿</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.updated_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <Link 
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-blue-500 hover:underline mr-3"
                      >
                        编辑
                      </Link>
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="text-gray-500 dark:text-gray-400 hover:underline"
                        target="_blank"
                      >
                        查看
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            暂无文章，点击"创建新文章"开始写作
          </div>
        )}
      </div>
    </div>
  );
} 