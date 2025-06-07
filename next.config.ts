import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    // 移除静态导出模式，使用服务器端渲染
    // output: 'export',
    distDir: 'dist',
    images: { unoptimized: true }
};

export default nextConfig;
