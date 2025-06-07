import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl text-gray-600 mb-8">页面不存在</h2>
      <p className="text-lg text-gray-500 mb-8 text-center max-w-md">
        您访问的页面可能已被删除、名称已更改或暂时不可用。
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          返回首页
        </Link>
        <a
          href="https://ds.dannyhkk.cn"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors"
        >
          去聊天
        </a>
      </div>
    </div>
  );
}
