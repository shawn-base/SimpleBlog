"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user count is 0 (first time setup)
    const checkIfSetup = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (!response.ok) {
          // 如果API返回错误，假设需要设置
          console.error('API error when checking setup status');
          setIsSetup(true);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setIsSetup(!data.hasUsers);
        setLoading(false);
      } catch (err) {
        console.error('Error checking user setup:', err);
        // 出现任何错误时，假设系统需要初始设置
        setIsSetup(true);
        setError('系统状态检查失败，将进入初始设置模式');
        setLoading(false);
      }
    };

    // Check if already logged in
    const isLoggedIn = localStorage.getItem('admin_authenticated');
    if (isLoggedIn) {
      router.push('/admin');
      return;
    }

    checkIfSetup();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!username || !password) {
      setError('用户名和密码不能为空');
      return;
    }

    if (isSetup && password !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    try {
      setLoading(true);
      const endpoint = isSetup ? '/api/auth/setup' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '登录失败');
      }

      // Set authenticated in localStorage
      localStorage.setItem('admin_authenticated', 'true');
      
      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || '登录过程中出现错误');
      setLoading(false);
    }
  };

  if (loading && !error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-8 mt-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        {isSetup ? '初次设置管理员账户' : '管理员登录'}
      </h1>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            用户名
          </label>
          <input
            type="text"
            id="username"
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            type="password"
            id="password"
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        {isSetup && (
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              确认密码
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
            disabled={loading}
          >
            {loading ? '处理中...' : isSetup ? '创建账户' : '登录'}
          </button>
        </div>
      </form>
    </div>
  );
} 