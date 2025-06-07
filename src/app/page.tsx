import Link from 'next/link';
import { getAllPosts } from '@/lib/db';
import BlogCard from './components/BlogCard';

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

export default async function Home() {
  // 修改:只加载首页需要展示的4篇文章，减少数据库查询和加载时间
  const maxArticlesToShow = 4;
  const posts = await getAllPosts(maxArticlesToShow, 0, true) as Post[];
  
  // 获取文章总数来确定是否有更多文章
  const hasMorePosts = posts.length >= maxArticlesToShow;

  return (
    <main className="min-h-screen relative">
      {/* 装饰背景元素 - 仅使用CSS实现，不影响性能 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 opacity-70 dark:opacity-30"></div>
        
        {/* 轻量级几何图形装饰 */}
        <div className="hidden md:block absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-100 dark:bg-indigo-900/20 blur-3xl opacity-30"></div>
        <div className="hidden md:block absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl opacity-40"></div>
        <div className="hidden md:block absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-purple-100 dark:bg-purple-900/20 blur-3xl opacity-30"></div>
        
        {/* 轻量级网格背景 */}
        <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.015] dark:opacity-[0.03]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <section className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 dark:text-white relative">
            欢迎来到AI问答分享
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
          </h1>
          <p className="text-center text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            这里是我分享AI知识、经验和想法的地方。浏览下面的文章，或者前往
            <a href="https://ds.dannyhkk.cn" className="text-blue-500 hover:underline mx-1 dark:text-blue-300">
              聊天页面
            </a>
            与AI助手交流。
          </p>
        </section>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative pb-10">
            {/* 显示可用的文章 */}
            {posts.map((post: Post, index) => (
              <div 
                key={post.id} 
                className="relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <BlogCard post={post} />
              </div>
            ))}
            
            {/* 查看更多按钮卡片 */}
            <div className="relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center h-full ${!hasMorePosts ? 'opacity-70' : ''}`}>
                <div className="p-6 text-center">
                  <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">查看更多文章</h2>
                  <Link
                    href="/blog"
                    className={`${hasMorePosts ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700' : 'bg-gray-400 dark:bg-gray-600 cursor-default'} text-white px-6 py-3 rounded transition-colors inline-block`}
                  >
                    浏览全部
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">还没有文章</h2>
            <p className="text-gray-500 dark:text-gray-400">敬请期待！</p>
          </div>
        )}
      </div>
    </main>
  );
}
