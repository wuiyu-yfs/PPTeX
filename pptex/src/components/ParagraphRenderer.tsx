/**
 * 段落渲染组件
 * 使用 KaTeX 渲染 LaTeX 公式
 */

import { useMemo } from 'react'
import katex from 'katex'

interface ParagraphRendererProps {
  /** LaTeX 内容 */
  content: string
  /** 是否为块级公式 */
  isBlock?: boolean
  /** 额外的 CSS 类名 */
  className?: string
}

/**
 * 处理行内公式：将 $...$ 替换为 KaTeX 渲染的 HTML
 */
function renderInlineLatex(text: string): string {
  // 匹配行内公式 $...$
  const inlinePattern = /\$([^$]+)\$/g

  let result = text
  let match

  while ((match = inlinePattern.exec(text)) !== null) {
    const latex = match[1]
    try {
      const html = katex.renderToString(latex, {
        displayMode: false,
        throwOnError: false,
        errorColor: '#cc0000',
      })
      result = result.replace(match[0], html)
    } catch (e) {
      // 渲染失败时保留原始文本
      const errorMsg = e instanceof Error ? e.message : '渲染错误'
      result = result.replace(match[0], `<span class="text-red-500" title="${errorMsg}">${latex}</span>`)
    }
  }

  return result
}

/**
 * 处理块级公式：将 $$...$$ 替换为 KaTeX 渲染的 HTML
 */
function renderBlockLatex(text: string): string {
  // 匹配块级公式 $$...$$
  const blockPattern = /\$\$([^$]+)\$\$/g

  let result = text
  let match

  while ((match = blockPattern.exec(text)) !== null) {
    const latex = match[1]
    try {
      const html = katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
        errorColor: '#cc0000',
      })
      result = result.replace(match[0], `<div class="katex-block">${html}</div>`)
    } catch (e) {
      // 渲染失败时保留原始文本
      const errorMsg = e instanceof Error ? e.message : '渲染错误'
      result = result.replace(match[0], `<div class="text-red-500 border border-red-300 p-2 rounded">${latex}<br><small>${errorMsg}</small></div>`)
    }
  }

  return result
}

/**
 * 处理 LaTeX 命令：将 \textbf{} 等转换为 HTML
 */
function renderLatexCommands(text: string): string {
  let result = text

  // 处理 \textbf{...} -> <strong>...</strong>
  result = result.replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>')

  // 处理 \textit{...} -> <em>...</em>
  result = result.replace(/\\textit\{([^}]*)\}/g, '<em>$1</em>')

  // 处理 \underline{...} -> <u>...</u>
  result = result.replace(/\\underline\{([^}]*)\}/g, '<u>$1</u>')

  // 处理简单的换行符 -> <br>
  // 注意：只在非公式部分处理
  // result = result.replace(/\n/g, '<br>')

  return result
}

/**
 * 渲染完整的段落内容
 */
function renderParagraphContent(content: string): string {
  let result = content

  // 先处理块级公式
  result = renderBlockLatex(result)

  // 再处理行内公式
  result = renderInlineLatex(result)

  // 处理 LaTeX 命令
  result = renderLatexCommands(result)

  return result
}

/**
 * 段落渲染组件
 */
export default function ParagraphRenderer({
  content,
  isBlock = false,
  className = '',
}: ParagraphRendererProps) {
  const renderedContent = useMemo(() => {
    return renderParagraphContent(content)
  }, [content])

  return (
    <div
      className={`paragraph ${isBlock ? 'formula-block' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  )
}