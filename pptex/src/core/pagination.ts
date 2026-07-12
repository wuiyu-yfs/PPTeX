/**
 * 自动分页引擎
 * 根据段落高度和幻灯片尺寸计算分页
 */

import type { Module, Slide, Paragraph, GridLayout } from '@/types'
import { parseParagraphs } from './parser'

/**
 * 默认 Grid 布局
 */
const DEFAULT_GRID: GridLayout = {
  columns: ['1fr'],
  rows: ['auto'],
  gap: '16px',
}

/**
 * 分页配置
 */
interface PaginationConfig {
  /** 幻灯片高度（像素） */
  slideHeight: number
  /** 幻灯片宽度（像素） */
  slideWidth: number
  /** 内边距 */
  padding: number
  /** 最小段落间距 */
  minParagraphGap: number
}

/**
 * 默认分页配置
 */
const DEFAULT_CONFIG: PaginationConfig = {
  slideHeight: 720,
  slideWidth: 1280,
  padding: 32,
  minParagraphGap: 16,
}

/**
 * 生成唯一幻灯片 ID
 */
function generateSlideId(moduleId: string, index: number): string {
  return `slide-${moduleId}-${index}-${Date.now()}`
}

/**
 * 创建单张幻灯片
 */
function createSlide(
  moduleId: string,
  index: number,
  startParaIndex: number,
  endParaIndex: number,
  isOverflow: boolean = false
): Slide {
  return {
    id: generateSlideId(moduleId, index),
    moduleId,
    contentRange: {
      startParagraphIndex: startParaIndex,
      endParagraphIndex: endParaIndex,
    },
    regions: [],
    gridOverride: DEFAULT_GRID,
    isOverflow,
  }
}

/**
 * 测量段落高度（使用离屏渲染）
 * 在浏览器环境中，创建隐藏的 DOM 元素来测量实际高度
 */
export function measureParagraphHeight(
  paragraph: Paragraph,
  config: PaginationConfig
): number {
  // 在非浏览器环境中，使用估算
  if (typeof document === 'undefined') {
    // 基于内容长度估算
    const lines = paragraph.content.split('\n').length
    const charsPerLine = Math.ceil(config.slideWidth / 10)
    const estimatedLines = Math.ceil(paragraph.content.length / charsPerLine) + lines
    return estimatedLines * 24 + config.minParagraphGap
  }

  // 创建离屏渲染容器
  const container = document.createElement('div')
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    width: ${config.slideWidth - 2 * config.padding}px;
    font-family: system-ui, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    padding: ${config.padding}px;
    visibility: hidden;
    overflow: hidden;
  `
  container.className = 'paragraph'

  // 简单渲染段落内容（不含 KaTeX）
  // TODO: 使用 KaTeX 渲染后测量
  container.textContent = paragraph.content

  document.body.appendChild(container)
  const height = container.getBoundingClientRect().height + config.minParagraphGap
  document.body.removeChild(container)

  return height
}

/**
 * 自动分页算法 - 贪心策略
 *
 * 步骤：
 * 1. 将模块源码解析为段落数组
 * 2. 测量每个段落的高度
 * 3. 贪心累加段落高度，超过 slideHeight 就分页
 * 4. 超大段落（单段超过一页）单独成页，标记 overflow
 *
 * @param module 模块数据
 * @param config 分页配置
 * @returns 生成的幻灯片数组
 */
export function paginateModule(
  module: Module,
  config: PaginationConfig = DEFAULT_CONFIG
): Slide[] {
  // 解析段落
  const paragraphs = parseParagraphs(module.source)

  if (paragraphs.length === 0) {
    // 空模块，返回一个空幻灯片
    return [createSlide(module.id, 0, 0, 0, false)]
  }

  // 计算可用高度（减去内边距）
  const availableHeight = config.slideHeight - 2 * config.padding

  // 测量段落高度
  const paragraphHeights = paragraphs.map(p => measureParagraphHeight(p, config))

  // 获取手动分页断点
  const manualBreaks = module.manualBreaks || []

  // 分页结果
  const slides: Slide[] = []
  let currentStart = 0
  let currentHeight = 0
  let slideIndex = 0

  for (let i = 0; i < paragraphs.length; i++) {
    const paraHeight = paragraphHeights[i]

    // 检查是否是手动分页点
    const isManualBreak = manualBreaks.includes(i)

    // 检查段落是否超长
    const isOverflow = paraHeight > availableHeight

    if (isOverflow) {
      // 超长段落，单独成页
      if (currentStart < i) {
        // 先结束当前页
        slides.push(createSlide(module.id, slideIndex++, currentStart, i - 1, false))
      }
      // 超长段落单独成页
      slides.push(createSlide(module.id, slideIndex++, i, i, true))
      currentStart = i + 1
      currentHeight = 0
    } else if (isManualBreak) {
      // 手动分页点，强制分页
      if (currentStart < i) {
        slides.push(createSlide(module.id, slideIndex++, currentStart, i - 1, false))
      }
      currentStart = i
      currentHeight = paraHeight
    } else if (currentHeight + paraHeight > availableHeight) {
      // 自动分页
      slides.push(createSlide(module.id, slideIndex++, currentStart, i - 1, false))
      currentStart = i
      currentHeight = paraHeight
    } else {
      // 继续累加
      currentHeight += paraHeight
    }
  }

  // 处理最后剩余的段落
  if (currentStart < paragraphs.length) {
    slides.push(createSlide(module.id, slideIndex++, currentStart, paragraphs.length - 1, false))
  }

  return slides
}

/**
 * 更新模块的分页（当内容变化时）
 */
export function updateModuleSlides(
  module: Module,
  config: PaginationConfig = DEFAULT_CONFIG
): Module {
  const slides = paginateModule(module, config)
  return {
    ...module,
    slides: slides.map(s => s.id),
  }
}

/**
 * 查找最近的段落间隙（用于吸附分页线）
 */
export function findNearestParagraphGap(
  paragraphs: Paragraph[],
  position: number,
  config: PaginationConfig = DEFAULT_CONFIG
): number {
  // position 是 Y 坐标，需要找到最近的段落间隙

  let cumulativeHeight = 0

  for (let i = 0; i < paragraphs.length; i++) {
    const paraHeight = measureParagraphHeight(paragraphs[i], config)

    // 检查当前位置是否在段落的开始或结束附近
    const paraStart = cumulativeHeight
    const paraEnd = cumulativeHeight + paraHeight

    // 如果在段落开始附近
    if (Math.abs(position - paraStart) < config.minParagraphGap / 2) {
      return i
    }

    // 如果在段落结束附近
    if (Math.abs(position - paraEnd) < config.minParagraphGap / 2) {
      return i + 1
    }

    cumulativeHeight += paraHeight
  }

  // 默认返回最后一个段落之后
  return paragraphs.length
}