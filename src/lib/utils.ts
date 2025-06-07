/**
 * 从Markdown内容生成纯文本摘要
 * @param content Markdown格式的文章内容
 * @param maxLength 摘要最大长度，默认200个字符
 * @returns 处理后的文本摘要
 */
export function generateExcerpt(content: string, maxLength: number = 200): string {
  // 如果内容为空，返回默认文本
  if (!content || content.trim() === '') {
    return '暂无摘要';
  }
  
  // 第一步：先处理常见的特殊结构，这些结构可能会影响段落的划分
  let preprocessedContent = content
    // 处理代码块 - 将代码块替换为占位符
    .replace(/```[\s\S]*?```/g, '[代码块]')
    // 处理表格 - 将整个表格替换为表格描述
    .replace(/\|.*\|[\s\S]*?\n\|[-:|\s]*\|[\s\S]*?(?:\n\n|\n$|$)/g, '[表格] ')
    // 处理水平线
    .replace(/^\s*[-*_]{3,}\s*$/gm, '');
  
  // 第二步：移除Markdown语法中的格式标记
  let plainText = preprocessedContent
    .replace(/#{1,6}\s+/g, '') // 移除标题标记
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // 移除加粗
    .replace(/(\*|_)(.*?)\1/g, '$2') // 移除斜体
    .replace(/~~(.*?)~~/g, '$1') // 移除删除线
    .replace(/`([^`]+)`/g, '$1') // 移除行内代码
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // 将链接转为纯文本
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '') // 移除图片
    .replace(/^\s*>\s+/gm, '') // 移除引用
    .replace(/^\s*[-*+]\s+/gm, '') // 移除无序列表
    .replace(/^\s*\d+\.\s+/gm, '') // 移除有序列表
    .replace(/\n\s*\n/g, '\n\n'); // 规范化段落空行
  
  // 分割成段落，过滤空段落
  let paragraphs = plainText.split('\n\n').filter(p => p.trim().length > 0);
  
  // 如果没有有效段落，尝试不同的分割方式
  if (paragraphs.length === 0) {
    paragraphs = plainText.split('\n').filter(p => p.trim().length > 0);
  }
  
  // 如果仍然没有有效段落，返回默认文本
  if (paragraphs.length === 0) {
    return '暂无摘要';
  }
  
  // 如果所有段落都很短，尝试合并一些段落
  if (paragraphs.every(p => p.length < 20) && paragraphs.length > 1) {
    // 合并段落直到达到合理的长度
    let combinedParagraphs = [];
    let currentParagraph = '';
    
    for (const p of paragraphs) {
      if (currentParagraph.length + p.length + 1 <= maxLength) {
        currentParagraph += (currentParagraph ? ' ' : '') + p.trim();
      } else {
        if (currentParagraph) {
          combinedParagraphs.push(currentParagraph);
        }
        currentParagraph = p.trim();
      }
    }
    
    if (currentParagraph) {
      combinedParagraphs.push(currentParagraph);
    }
    
    paragraphs = combinedParagraphs;
  }
  
  // 从第一段开始，直到达到最大长度或最多2段
  let excerpt = '';
  let paragraphCount = 0;
  
  for (const paragraph of paragraphs) {
    if (excerpt.length + paragraph.length <= maxLength && paragraphCount < 2) {
      excerpt += (excerpt ? ' ' : '') + paragraph.trim();
      paragraphCount++;
    } else {
      break;
    }
  }
  
  // 如果第一段就很长，需要截断
  if (excerpt.length > maxLength) {
    excerpt = excerpt.substring(0, maxLength - 3) + '...';
  }
  
  // 确保摘要不为空
  if (!excerpt.trim()) {
    // 如果所有处理后仍无法提取摘要，直接从原始内容获取纯文本
    const rawText = content.replace(/[#*_`>|[\]\(\)]/g, '').trim();
    if (rawText) {
      excerpt = rawText.substring(0, maxLength - 3) + '...';
    } else {
      excerpt = '暂无摘要';
    }
  }
  
  return excerpt;
} 