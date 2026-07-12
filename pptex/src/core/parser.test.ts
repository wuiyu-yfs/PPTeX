/**
 * 段落解析器单元测试
 */

import { describe, it, expect } from 'vitest'
import { parseParagraphs, updateSourceParagraph } from './parser'

describe('parseParagraphs', () => {
  it('应该解析空字符串为空数组', () => {
    const result = parseParagraphs('')
    expect(result).toEqual([])
  })

  it('应该解析空源码为空数组', () => {
    const result = parseParagraphs('   ')
    expect(result).toEqual([])
  })

  it('应该解析单个段落', () => {
    const source = 'Hello World'
    const result = parseParagraphs(source)

    expect(result).toHaveLength(1)
    expect(result[0].content).toBe('Hello World')
    expect(result[0].sourceStart).toBe(0)
    expect(result[0].sourceEnd).toBe(source.length)
    expect(result[0].id).toMatch(/^para-/)
  })

  it('应该按空行分割多个段落', () => {
    const source = '第一段内容\n\n第二段内容\n\n第三段内容'
    const result = parseParagraphs(source)

    expect(result).toHaveLength(3)
    expect(result[0].content).toBe('第一段内容')
    expect(result[1].content).toBe('第二段内容')
    expect(result[2].content).toBe('第三段内容')
  })

  it('应该保留段落内的换行符', () => {
    const source = '段落第一行\n段落第二行\n\n另一个段落'
    const result = parseParagraphs(source)

    expect(result).toHaveLength(2)
    expect(result[0].content).toBe('段落第一行\n段落第二行')
    expect(result[1].content).toBe('另一个段落')
  })

  it('不应该切断 equation 环境', () => {
    const source = `
开始文本

\\begin{equation}
E = mc^2
\\end{equation}

结束文本
`
    const result = parseParagraphs(source.trim())

    // 应该有 3 个段落：开始文本、公式块、结束文本
    expect(result).toHaveLength(3)
    expect(result[0].content).toContain('开始文本')
    expect(result[1].content).toContain('\\begin{equation}')
    expect(result[1].content).toContain('\\end{equation}')
    expect(result[1].content).toContain('E = mc^2')
    expect(result[2].content).toContain('结束文本')
  })

  it('不应该切断 align 环境', () => {
    const source = `第一段

\\begin{align}
a &= b \\
c &= d
\\end{align}

第二段`

    const result = parseParagraphs(source)

    expect(result).toHaveLength(3)
    // align 环境应该完整保留在同一段落
    const alignParagraph = result.find(p => p.content.includes('\\begin{align}'))
    expect(alignParagraph?.content).toContain('\\end{align}')
  })

  it('应该正确处理嵌套环境', () => {
    const source = `外层文本

\\begin{theorem}
定理内容

\\begin{proof}
证明内容
\\end{proof}

定理继续
\\end{theorem}

后续文本`

    const result = parseParagraphs(source)

    // theorem 和 proof 的嵌套环境应该完整保留
    expect(result.length).toBeGreaterThan(0)

    // theorem 环境不应该被切断
    const theoremParagraph = result.find(p => p.content.includes('\\begin{theorem}'))
    expect(theoremParagraph?.content).toContain('\\end{theorem}')

    // theorem 内部的 proof 环境也应该在同一段落
    expect(theoremParagraph?.content).toContain('\\begin{proof}')
    expect(theoremParagraph?.content).toContain('\\end{proof}')
  })

  it('应该正确处理 itemize 环境', () => {
    const source = `引言

\\begin{itemize}
\\item 第一点
\\item 第二点
\\item 第三点
\\end{itemize}

总结`

    const result = parseParagraphs(source)

    expect(result).toHaveLength(3)
    expect(result[1].content).toContain('\\begin{itemize}')
    expect(result[1].content).toContain('\\end{itemize}')
  })

  it('应该正确处理多个连续空行', () => {
    const source = '段落一\n\n\n\n\n段落二'
    const result = parseParagraphs(source)

    expect(result).toHaveLength(2)
    expect(result[0].content).toBe('段落一')
    expect(result[1].content).toBe('段落二')
  })

  it('应该正确计算 sourceStart 和 sourceEnd', () => {
    const source = 'AAAA\n\nBBBB\n\nCCCC'
    const result = parseParagraphs(source)

    expect(result[0].sourceStart).toBe(0)
    expect(result[0].sourceEnd).toBe(4)
    expect(result[1].sourceStart).toBeGreaterThan(4)
    expect(result[1].sourceEnd).toBeGreaterThan(result[1].sourceStart)
    expect(result[2].sourceEnd).toBe(source.length)
  })

  it('应该为每个段落生成唯一 ID', () => {
    const source = '段落一\n\n段落二\n\n段落三'
    const result = parseParagraphs(source)

    const ids = result.map(p => p.id)
    const uniqueIds = new Set(ids)

    expect(uniqueIds.size).toBe(result.length)
  })
})

describe('updateSourceParagraph', () => {
  it('应该更新指定段落的内容', () => {
    const source = '段落一\n\n段落二\n\n段落三'
    const paragraphs = parseParagraphs(source)

    const newSource = updateSourceParagraph(source, paragraphs, 1, '新的段落二')

    expect(newSource).toContain('段落一')
    expect(newSource).toContain('新的段落二')
    expect(newSource).toContain('段落三')
  })

  it('应该返回原字符串当索引无效', () => {
    const source = '内容'
    const paragraphs = parseParagraphs(source)

    const newSource1 = updateSourceParagraph(source, paragraphs, -1, '新内容')
    const newSource2 = updateSourceParagraph(source, paragraphs, 100, '新内容')

    expect(newSource1).toBe(source)
    expect(newSource2).toBe(source)
  })
})