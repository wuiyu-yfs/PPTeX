/**
 * LaTeX 段落解析器
 * 将 LaTeX 源码按空行和环境边界分割为不可分段落
 */

import type { Paragraph } from '@/types'

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `para-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 环境名称正则 - 匹配 \begin{...} 和 \end{...}
 */
const ENV_BEGIN_REGEX = /\\begin\{([^}]+)\}/
const ENV_END_REGEX = /\\end\{([^}]+)\}/

/**
 * 已知的 LaTeX 环境列表 - 这些环境不能被切断
 */
const KNOWN_ENVIRONMENTS = [
  'equation',
  'equation*',
  'align',
  'align*',
  'gather',
  'gather*',
  'multline',
  'multline*',
  'pmatrix',
  'bmatrix',
  'vmatrix',
  'cases',
  'theorem',
  'definition',
  'lemma',
  'proof',
  'example',
  'block',
  'alertblock',
  'exampleblock',
  'figure',
  'table',
  'itemize',
  'enumerate',
  'description',
  'columns',
  'column',
  'frame',
]

/**
 * 检查是否是已知环境
 */
function isKnownEnvironment(envName: string): boolean {
  return KNOWN_ENVIRONMENTS.includes(envName) || KNOWN_ENVIRONMENTS.includes(envName.replace('*', ''))
}

/**
 * 解析 LaTeX 源码为段落数组
 *
 * 分段规则：
 * 1. 按空行分割
 * 2. 遇到 \begin{...} 时，必须与对应的 \end{...} 保持在同一段落
 * 3. 每个段落生成唯一 ID
 * 4. 记录每个段落源码中的位置范围
 *
 * @param source LaTeX 源码字符串
 * @returns 段落数组
 */
export function parseParagraphs(source: string): Paragraph[] {
  const paragraphs: Paragraph[] = []

  if (!source || source.trim() === '') {
    return paragraphs
  }

  // 按行分割源码
  const lines = source.split('\n')
  let currentParagraph: string[] = []
  let paragraphStart = 0
  let envStack: string[] = [] // 环境栈，用于跟踪嵌套环境

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // 检查是否开始一个环境
    const beginMatch = trimmedLine.match(ENV_BEGIN_REGEX)
    if (beginMatch) {
      const envName = beginMatch[1]
      if (isKnownEnvironment(envName)) {
        envStack.push(envName)
      }
    }

    // 检查是否结束一个环境
    const endMatch = trimmedLine.match(ENV_END_REGEX)
    if (endMatch) {
      const envName = endMatch[1]
      if (envStack.length > 0 && envStack[envStack.length - 1] === envName) {
        envStack.pop()
      }
    }

    // 如果遇到空行且环境栈为空，分割段落
    if (trimmedLine === '' && envStack.length === 0) {
      if (currentParagraph.length > 0) {
        const content = currentParagraph.join('\n')
        const paragraphEnd = paragraphStart + content.length

        paragraphs.push({
          id: generateId(),
          content,
          sourceStart: paragraphStart,
          sourceEnd: paragraphEnd,
        })

        // 更新起始位置（跳过空行）
        paragraphStart = paragraphEnd + 1 // +1 是空行的换行符
        currentParagraph = []
      } else {
        // 空段落，只更新起始位置
        paragraphStart++
      }
    } else {
      // 添加到当前段落
      currentParagraph.push(line)
    }
  }

  // 处理最后剩余的段落
  if (currentParagraph.length > 0) {
    const content = currentParagraph.join('\n')
    paragraphs.push({
      id: generateId(),
      content,
      sourceStart: paragraphStart,
      sourceEnd: source.length,
    })
  }

  return paragraphs
}

/**
 * 根据段落 ID 查找段落索引
 */
export function findParagraphIndex(paragraphs: Paragraph[], paragraphId: string): number {
  return paragraphs.findIndex(p => p.id === paragraphId)
}

/**
 * 根据段落索引更新源码中的对应部分
 */
export function updateSourceParagraph(
  source: string,
  paragraphs: Paragraph[],
  paragraphIndex: number,
  newContent: string
): string {
  if (paragraphIndex < 0 || paragraphIndex >= paragraphs.length) {
    return source
  }

  const paragraph = paragraphs[paragraphIndex]
  const before = source.slice(0, paragraph.sourceStart)
  const after = source.slice(paragraph.sourceEnd)

  return before + newContent + after
}

/**
 * 重建段落映射（源码变化后重新计算位置）
 */
export function rebuildParagraphMapping(source: string): Paragraph[] {
  return parseParagraphs(source)
}