"use client";

import { useEffect, useRef } from 'react';

interface AutoImageGeneratorProps {
  title: string;
  width: number;
  height: number;
  className?: string;
  id?: string;
}

// 生成一个与标题相关的颜色
function getColorFromTitle(title: string): string {
  // 使用标题的哈希值来生成一个颜色
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }

  // 确保颜色不会太亮或太暗
  const h = Math.abs(hash) % 360;
  const s = 50 + (Math.abs(hash) % 30); // 50-80%
  const l = 45 + (Math.abs(hash) % 15); // 45-60%

  return `hsl(${h}, ${s}%, ${l}%)`;
}

// 获取文本颜色（深色背景用白字，浅色背景用黑字）
function getTextColor(bgColor: string): string {
  // 简单判断：HSL颜色的亮度值L低于50%用白字，否则用黑字
  const match = bgColor.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/);
  if (match) {
    const lightness = parseInt(match[1]);
    return lightness < 50 ? '#ffffff' : '#333333';
  }
  return '#ffffff'; // 默认白色
}

export default function AutoImageGenerator({ title, width, height, className = '', id }: AutoImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置画布尺寸
    canvas.width = width;
    canvas.height = height;
    
    // 生成背景色
    const bgColor = getColorFromTitle(title);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    // 设置文字样式
    const textColor = getTextColor(bgColor);
    ctx.fillStyle = textColor;
    const fontSize = Math.min(width / 15, 32); // 动态计算字体大小，但不超过32px
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 绘制标题
    // 如果标题太长，进行截断或换行处理
    const maxCharPerLine = Math.floor(width / (fontSize * 0.6));
    const lines = [];
    
    let remaining = title;
    while (remaining.length > 0) {
      let line = remaining.slice(0, maxCharPerLine);
      
      // 如果还有更多内容并且当前行不是在单词中间截断的
      if (line.length < remaining.length && remaining[line.length] !== ' ' && line[line.length - 1] !== ' ') {
        // 尝试找到上一个空格
        const lastSpace = line.lastIndexOf(' ');
        if (lastSpace !== -1) {
          line = line.slice(0, lastSpace);
        }
      }
      
      lines.push(line);
      remaining = remaining.slice(line.length).trim();
      
      // 限制行数
      if (lines.length >= 3) {
        if (remaining.length > 0) {
          lines[lines.length - 1] += '...';
        }
        break;
      }
    }
    
    // 计算行间距和起始Y位置
    const lineHeight = fontSize * 1.2;
    const startY = height / 2 - (lines.length - 1) * lineHeight / 2;
    
    // 绘制每一行
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });
    
    // 绘制底部的网站标识
    ctx.font = `${fontSize * 0.4}px Arial, sans-serif`;
    ctx.fillText('AI问答分享', width / 2, height - 20);
    
  }, [title, width, height]);
  
  return <canvas ref={canvasRef} className={className} id={id} />;
} 