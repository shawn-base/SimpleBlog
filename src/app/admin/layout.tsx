"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查服务器连接和认证状态
    const checkAuth = async () => {
      // 先检查本地存储
      const isLoggedIn = localStorage.getItem('admin_authenticated');
      
      // 如果没有登录状态且不在登录页面，直接重定向
      if (!isLoggedIn && pathname !== '/admin/login') {
        router.push('/admin/login');
        return;
      }
      
      // 即使有本地存储的登录状态，也验证服务器是否可连接
      if (isLoggedIn && pathname !== '/admin/login') {
        try {
          const response = await fetch('/api/auth/check');
          // 如果服务器响应失败，可能是数据库问题，清除登录状态并重定向
          if (!response.ok) {
            console.error('Server auth check failed');
            localStorage.removeItem('admin_authenticated');
            router.push('/admin/login');
            return;
          }
        } catch (error) {
          // 如果无法连接服务器，也清除登录状态并重定向
          console.error('Server connection error:', error);
          localStorage.removeItem('admin_authenticated');
          router.push('/admin/login');
          return;
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Don't render the layout until we've checked authentication
  if (isLoading && pathname !== '/admin/login') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  // Don't show the admin navigation on the login page
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="py-6">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      <nav className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="text-xl font-bold text-gray-800 dark:text-white">
                  管理后台
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link
                  href="/admin"
                  className={`${
                    pathname === '/admin'
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  仪表盘
                </Link>
                <Link
                  href="/admin/posts"
                  className={`${
                    pathname.startsWith('/admin/posts')
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  文章管理
                </Link>
                <Link
                  href="/admin/tags"
                  className={`${
                    pathname.startsWith('/admin/tags')
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  标签管理
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  localStorage.removeItem('admin_authenticated');
                  router.push('/admin/login');
                }}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                退出登录
              </button>
              <Link
                href="/"
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                返回网站
              </Link>
              <div className="flex sm:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-200 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <span className="sr-only">打开菜单</span>
                  {isMenuOpen ? (
                    <svg
                      className="block h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="block h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/admin"
              className={`${
                pathname === '/admin'
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-200'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              仪表盘
            </Link>
            <Link
              href="/admin/posts"
              className={`${
                pathname.startsWith('/admin/posts')
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-200'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              文章管理
            </Link>
            <Link
              href="/admin/tags"
              className={`${
                pathname.startsWith('/admin/tags')
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-200'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              标签管理
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('admin_authenticated');
                router.push('/admin/login');
                setIsMenuOpen(false);
              }}
              className="border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left"
            >
              退出登录
            </button>
          </div>
        </div>
      </nav>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 清理localStorage中的文章数据，确保使用数据库 */}
          <script dangerouslySetInnerHTML={{
            __html: `
              // 清理localStorage中的文章数据，确保使用数据库
              if(localStorage.getItem('blog_posts')) {
                localStorage.removeItem('blog_posts');
                console.log('已清理本地存储的文章数据');
              }
            `
          }} />
          {children}
        </div>
      </div>
    </div>
  );
} 