/**
 * LaTeX 代码生成器
 * 支持生成 Beamer 和 Article 格式
 */

import type { Document, Module } from '@/types'

/**
 * 生成 Beamer 文档
 */
export function generateBeamer(doc: Document): string {
  const lines: string[] = []

  // 导言区
  lines.push('\\documentclass{beamer}')
  lines.push('\\usepackage{ctex}')
  lines.push('\\usepackage{amsmath}')
  lines.push('\\usepackage{amssymb}')
  lines.push('\\usepackage{graphicx}')
  lines.push('')
  lines.push(`\\title{${doc.manifest.title}}`)
  lines.push('\\author{}')
  lines.push('\\date{}')
  lines.push('')
  lines.push('\\begin{document}')
  lines.push('\\maketitle')
  lines.push('')

  // 为每个模块生成幻灯片
  for (const module of doc.modules) {
    lines.push(`% 模块: ${module.title}`)
    lines.push('')

    // 根据模块的幻灯片生成 frame
    const slides = doc.slides.filter(s => s.moduleId === module.id)

    if (slides.length > 0) {
      for (const _slide of slides) {
        lines.push('\\begin{frame}')
        lines.push(generateSlideContent(module))
        lines.push('\\end{frame}')
        lines.push('')
      }
    } else {
      // 如果没有分页数据，整个模块作为一个 frame
      lines.push('\\begin{frame}')
      lines.push(`\\frametitle{${module.title}}`)
      lines.push(module.source)
      lines.push('\\end{frame}')
      lines.push('')
    }
  }

  lines.push('\\end{document}')

  return lines.join('\n')
}

/**
 * 生成 Article 文档
 */
export function generateArticle(doc: Document): string {
  const lines: string[] = []

  // 导言区
  lines.push('\\documentclass{article}')
  lines.push('\\usepackage{ctex}')
  lines.push('\\usepackage{amsmath}')
  lines.push('\\usepackage{amssymb}')
  lines.push('\\usepackage{graphicx}')
  lines.push('\\usepackage[margin=1in]{geometry}')
  lines.push('')
  lines.push(`\\title{${doc.manifest.title}}`)
  lines.push('\\author{}')
  lines.push('\\date{}')
  lines.push('')
  lines.push('\\begin{document}')
  lines.push('\\maketitle')
  lines.push('')

  // 每个模块作为一个 section
  for (const module of doc.modules) {
    lines.push(`\\section{${module.title}}`)
    lines.push('')
    lines.push(module.source)
    lines.push('')
  }

  lines.push('\\end{document}')

  return lines.join('\n')
}

/**
 * 生成幻灯片内容
 */
function generateSlideContent(module: Module): string {
  // 简单实现：直接返回模块源码
  // 实际应该根据 contentRange 提取对应的段落
  return module.source
}

/**
 * 生成放映版 HTML
 */
export function generatePresentationHTML(doc: Document): string {
  const slidesHTML = doc.modules.map((module, index) => `
    <div class="slide" data-index="${index}">
      <div class="slide-content">
        <h2>${module.title}</h2>
        <div class="slide-body">
          ${module.source}
        </div>
      </div>
    </div>
  `).join('\n')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.manifest.title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; }
    .slide-container { width: 100vw; height: 100vh; overflow: hidden; }
    .slide { display: none; width: 100%; height: 100%; padding: 48px; }
    .slide.active { display: flex; flex-direction: column; justify-content: center; }
    .slide-content { max-width: 1200px; margin: 0 auto; }
    h2 { margin-bottom: 24px; color: #1f2937; }
    .slide-body { line-height: 1.8; }
    .controls { position: fixed; bottom: 24px; right: 24px; }
    .controls button { padding: 8px 16px; margin-left: 8px; }
    .progress { position: fixed; bottom: 0; left: 0; height: 3px; background: #3b82f6; }
  </style>
</head>
<body>
  <div class="slide-container">
    ${slidesHTML}
  </div>
  <div class="controls">
    <button onclick="prevSlide()">上一页</button>
    <button onclick="nextSlide()">下一页</button>
    <span id="page-num"></span>
  </div>
  <div class="progress" id="progress"></div>
  <script>
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const total = slides.length;

    function showSlide(index) {
      if (index < 0) index = 0;
      if (index >= total) index = total - 1;
      currentSlide = index;

      slides.forEach((s, i) => {
        s.classList.toggle('active', i === currentSlide);
      });

      document.getElementById('page-num').textContent = (currentSlide + 1) + ' / ' + total;
      document.getElementById('progress').style.width = ((currentSlide + 1) / total * 100) + '%';
    }

    function nextSlide() { showSlide(currentSlide + 1); }
    function prevSlide() { showSlide(currentSlide - 1); }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'f') document.documentElement.requestFullscreen();
    });

    showSlide(0);
  </script>
</body>
</html>`
}