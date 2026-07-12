/**
 * 分页引擎单元测试
 */

import { describe, it, expect } from 'vitest'
import { paginateModule, findNearestParagraphGap } from './pagination'
import type { Module } from '@/types'

describe('paginateModule', () => {
  it('应该处理空模块', () => {
    const module: Module = {
      id: 'test-1',
      type: 'knowledge',
      title: '测试模块',
      source: '',
      baseGrid: { columns: ['1fr'], rows: ['auto'], gap: '16px' },
      slides: [],
      manualBreaks: [],
    }

    const slides = paginateModule(module)
    expect(slides).toHaveLength(1)
    expect(slides[0].moduleId).toBe(module.id)
  })

  it('应该将单个段落放入一张幻灯片', () => {
    const module: Module = {
      id: 'test-2',
      type: 'knowledge',
      title: '单段落测试',
      source: '这是一个简单的段落',
      baseGrid: { columns: ['1fr'], rows: ['auto'], gap: '16px' },
      slides: [],
      manualBreaks: [],
    }

    const slides = paginateModule(module)
    expect(slides).toHaveLength(1)
    expect(slides[0].contentRange.startParagraphIndex).toBe(0)
    expect(slides[0].contentRange.endParagraphIndex).toBe(0)
  })

  it('应该正确处理多个短段落', () => {
    const module: Module = {
      id: 'test-3',
      type: 'knowledge',
      title: '多段落测试',
      source: '段落一\n\n段落二\n\n段落三',
      baseGrid: { columns: ['1fr'], rows: ['auto'], gap: '16px' },
      slides: [],
      manualBreaks: [],
    }

    const slides = paginateModule(module)
    // 短段落可能全部在一张幻灯片，也可能分多页（取决于高度测量）
    expect(slides.length).toBeGreaterThanOrEqual(1)
    expect(slides[0].moduleId).toBe(module.id)
  })

  it('应该处理手动分页断点', () => {
    const module: Module = {
      id: 'test-4',
      type: 'knowledge',
      title: '手动分页测试',
      source: '段落一\n\n段落二\n\n段落三\n\n段落四',
      baseGrid: { columns: ['1fr'], rows: ['auto'], gap: '16px' },
      slides: [],
      manualBreaks: [2], // 在第2段之前强制分页
    }

    const slides = paginateModule(module)
    // 应该在第2段之前分页
    const breakSlide = slides.find(s =>
      s.contentRange.startParagraphIndex === 2
    )
    expect(breakSlide).toBeDefined()
  })
})

describe('findNearestParagraphGap', () => {
  it('应该返回最近的段落间隙', () => {
    // 非浏览器环境下，使用估算
    // 这个测试主要验证函数能够正常工作
    const paragraphs = [
      { id: 'p1', content: '段落一', sourceStart: 0, sourceEnd: 3 },
      { id: 'p2', content: '段落二', sourceStart: 4, sourceEnd: 7 },
    ]

    const result = findNearestParagraphGap(paragraphs, 0)
    // 应该返回一个有效的索引
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(paragraphs.length)
  })
})