import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI问答分享",
  description: "AI问答分享博客",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 服务器端总是返回无类名的HTML，客户端会根据cookie动态调整
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        {/* 预连接提升性能 */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <Script
            id="gtag-core"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
        />
        <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
            }}
        />
        {/* 主题初始化脚本 - 使用cookie并添加suppressHydrationWarning */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getCookie(name) {
                  const value = "; " + document.cookie;
                  const parts = value.split("; " + name + "=");
                  if (parts.length === 2) return parts.pop().split(";").shift();
                  return null;
                }
                
                const savedTheme = getCookie('theme');
                
                if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  // 不管是light还是没有设置，都使用浅色主题
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <ThemeProvider>
          <Navbar />
          <div className="pt-16">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
