"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

type Theme = 'light' | 'dark';
type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isClient, setIsClient] = useState(false);
  
  // 在组件挂载时检查cookie
  useEffect(() => {
    setIsClient(true);
    // 从cookie中读取主题设置
    const savedTheme = Cookies.get('theme') as Theme | undefined;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // 如果没有保存的主题，则检查系统偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
      // 将主题保存到cookie，有效期30天
      Cookies.set('theme', prefersDark ? 'dark' : 'light', { expires: 30 });
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    // 将新主题保存到cookie，有效期30天
    Cookies.set('theme', newTheme, { expires: 30 });
  };

  // 避免客户端和服务器端渲染不一致
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  // 如果context不存在，返回默认值而不是抛出错误
  if (context === undefined) {
    // 提供默认主题状态和空函数，保证界面不会崩溃
    return { 
      theme: 'light' as Theme, 
      toggleTheme: () => console.warn('ThemeProvider not found, theme toggle had no effect')
    };
  }
  
  return context;
} 