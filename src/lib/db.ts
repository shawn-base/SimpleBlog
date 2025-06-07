import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { hashPassword, verifyPassword } from './auth';

// 确保数据库目录存在并可写
const DB_PATH = path.join(process.cwd(), 'data');
try {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
    console.log(`创建数据目录: ${DB_PATH}`);
  }
  
  // 检查目录权限
  fs.accessSync(DB_PATH, fs.constants.W_OK);
  console.log(`数据目录权限正常: ${DB_PATH}`);
  
  const DB_FILE = path.join(DB_PATH, 'blog.db');
  
  // 如果文件存在，检查文件权限
  if (fs.existsSync(DB_FILE)) {
    fs.accessSync(DB_FILE, fs.constants.R_OK | fs.constants.W_OK);
    console.log(`数据库文件权限正常: ${DB_FILE}`);
  } else {
    console.log(`数据库文件不存在，将在首次连接时创建: ${DB_FILE}`);
  }
} catch (error) {
  console.error('数据库目录或文件权限错误:', error);
}

const DB_FILE = path.join(DB_PATH, 'blog.db');

// 单例模式保持连接
let db: any = null;

export async function getDb() {
  if (!db) {
    try {
      db = await open({
        filename: DB_FILE,
        driver: sqlite3.Database
      });

      console.log('数据库连接成功');

      // 初始化数据库表
      await db.exec(`
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          featured_image TEXT,
          published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_published BOOLEAN DEFAULT 1
        );
        
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS post_tags (
          post_id INTEGER,
          tag_id INTEGER,
          PRIMARY KEY (post_id, tag_id),
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('数据库表初始化完成');
    } catch (error) {
      console.error('数据库连接或初始化失败:', error);
      throw new Error(`数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
  return db;
}

// 文章相关操作
export async function getAllPosts(limit = 100, offset = 0, publishedOnly = true) {
  const db = await getDb();
  const whereClause = publishedOnly ? 'WHERE is_published = 1' : '';
  
  return await db.all(`
    SELECT * FROM posts
    ${whereClause}
    ORDER BY published_at DESC
    LIMIT ? OFFSET ?
  `, [limit, offset]);
}

export async function getPostBySlug(slug: string) {
  const db = await getDb();
  const post = await db.get(`
    SELECT * FROM posts WHERE slug = ?
  `, [slug]);
  
  if (post) {
    // 获取文章标签
    post.tags = await db.all(`
      SELECT t.* FROM tags t
      JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `, [post.id]);
  }
  
  return post;
}

// 根据ID获取文章
export async function getPostById(id: number) {
  const db = await getDb();
  const post = await db.get(`
    SELECT * FROM posts WHERE id = ?
  `, [id]);
  
  if (post) {
    // 获取文章标签
    post.tags = await db.all(`
      SELECT t.* FROM tags t
      JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `, [post.id]);
  }
  
  return post;
}

// 确保slug唯一性的函数
export async function ensureUniqueSlug(slug: string): Promise<string> {
  const db = await getDb();
  let counter = 0;
  let uniqueSlug = slug;
  
  while (true) {
    const existing = await db.get('SELECT id FROM posts WHERE slug = ?', uniqueSlug);
    if (!existing) break;
    
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }
  
  return uniqueSlug;
}

export async function createPost(postData: any) {
  const db = await getDb();
  const { slug, title, content, excerpt, featured_image, is_published, tags } = postData;
  
  // 确保slug唯一
  const uniqueSlug = await ensureUniqueSlug(slug);
  
  const result = await db.run(`
    INSERT INTO posts (slug, title, content, excerpt, featured_image, is_published, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [uniqueSlug, title, content, excerpt, featured_image, is_published ? 1 : 0]);
  
  const postId = result.lastID;
  
  // 如果有标签，保存标签关联
  if (tags && Array.isArray(tags) && tags.length > 0) {
    for (const tag of tags) {
      if (!tag || typeof tag !== 'string' || tag.trim() === '') {
        continue; // 跳过空标签或无效标签
      }
      
      try {
        // 检查标签是否存在，不存在则创建
        let tagId = await getTagByName(tag);
        if (!tagId) {
          const slug = tag.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
          tagId = await createTag(tag, slug);
        }
        
        // 只有在成功获取到标签ID时才创建关联
        if (tagId) {
          await db.run(`
            INSERT INTO post_tags (post_id, tag_id)
            VALUES (?, ?)
          `, [postId, tagId]);
        }
      } catch (error) {
        console.error(`Error processing tag "${tag}":`, error);
        // 继续处理其他标签，不中断整个流程
      }
    }
  }
  
  return postId;
}

export async function updatePost(id: number, postData: any) {
  const db = await getDb();
  const { slug, title, content, excerpt, featured_image, is_published } = postData;
  
  await db.run(`
    UPDATE posts
    SET slug = ?, title = ?, content = ?, excerpt = ?, 
        featured_image = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [slug, title, content, excerpt, featured_image, is_published ? 1 : 0, id]);
  
  // 更新标签 (可选，根据需要实现)
  return id;
}

export async function deletePost(id: number) {
  const db = await getDb();
  
  // 删除文章-标签关联
  await db.run('DELETE FROM post_tags WHERE post_id = ?', [id]);
  
  // 删除文章
  await db.run('DELETE FROM posts WHERE id = ?', [id]);
  
  return true;
}

// 标签相关操作
export async function getAllTags() {
  const db = await getDb();
  return await db.all('SELECT * FROM tags ORDER BY name');
}

export async function getTagByName(name: string) {
  const db = await getDb();
  const tag = await db.get('SELECT id FROM tags WHERE name = ?', [name]);
  return tag ? tag.id : null;
}

export async function createTag(name: string, slug: string) {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO tags (name, slug) VALUES (?, ?)',
    [name, slug]
  );
  return result.lastID;
}

// 删除标签
export async function deleteTag(id: number) {
  const db = await getDb();
  
  // 删除标签和文章的关联
  await db.run('DELETE FROM post_tags WHERE tag_id = ?', [id]);
  
  // 删除标签
  await db.run('DELETE FROM tags WHERE id = ?', [id]);
  
  return true;
}

// 用户认证相关操作
export async function getUserCount() {
  const db = await getDb();
  const result = await db.get('SELECT COUNT(*) as count FROM users');
  return result.count;
}

export async function createUser(username: string, password: string) {
  const db = await getDb();
  try {
    // Hash the password before storing
    const hashedPassword = hashPassword(password);
    
    const result = await db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    return result.lastID;
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
}

export async function verifyUser(username: string, password: string) {
  const db = await getDb();
  try {
    const user = await db.get(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (!user) {
      return false;
    }
    
    // Verify the password using the stored hash
    return verifyPassword(user.password, password);
  } catch (error) {
    console.error('验证用户失败:', error);
    return false;
  }
} 