# 博客与聊天集成应用 

这是一个基于Next.js的现代Web应用，集成了博客系统和AI聊天功能, 请使用。

## 主要功能

- **博客系统**：支持Markdown格式的文章撰写和展示
- **AI聊天**：集成OpenAI API的智能对话功能
- **混合渲染**：结合SSR和CSR优化性能和SEO
- **安全管理后台**：使用客户端证书保护的内容管理系统

## 技术栈

- Next.js 15
- React 19
- TypeScript
- SQLite (轻量级数据库)
- TailwindCSS
- OpenAI API

## 本地开发

首先，克隆仓库并安装依赖：

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

运行开发服务器：

```bash
npm run dev
```

在浏览器中访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
.
├── src/
│   ├── app/             # Next.js 应用目录
│   │   ├── admin/       # 管理后台
│   │   ├── api/         # API 路由
│   │   ├── blog/        # 博客文章页面
│   │   ├── chat/        # 聊天应用
│   │   ├── components/  # 共享组件
│   │   └── ...
│   ├── lib/             # 工具函数和共享代码
│   │   └── db.ts        # 数据库操作
│   └── ...
├── public/              # 静态资源
│   └── ...
├── data/                # SQLite 数据库文件
├── package.json
└── ...
```

## 部署

### 方法一：Node.js服务器部署

1. 构建项目：
   ```bash
   npm run build
   ```

2. 将以下文件/目录复制到服务器：
   - `.next/` 目录
   - `public/` 目录
   - `package.json`和`package-lock.json`
   - `next.config.ts`
   - `data/` 目录（数据库文件）

3. 在服务器上安装依赖：
   ```bash
   npm ci --production
   ```

4. 使用PM2等工具启动服务：
   ```bash
   pm2 start npm --name "nextjs-blog" -- start
   ```

5. 配置Nginx反向代理（参考`nginx.conf.example`）

### 方法二：静态导出（不支持完整SSR）

如果服务器不支持Node.js，可以考虑静态导出：

1. 修改`next.config.ts`：
   ```js
   const nextConfig = {
     output: 'export',
   };
   ```

2. 构建静态版本：
   ```bash
   npm run build
   ```

3. 将`out/`目录下所有文件复制到Nginx `/www/ds`目录

## 管理后台访问

管理后台使用客户端证书保护：

1. 按照`cert-commands.txt`中的说明生成客户端证书
2. 将证书导入到浏览器
3. 配置Nginx启用客户端证书验证（参考`nginx.conf.example`）
4. 访问 https://yourdomain.com/admin

## 许可证

[MIT](LICENSE)
