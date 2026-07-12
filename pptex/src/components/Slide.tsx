/**
 * 幻灯片组件
 * 渲染单张幻灯片，支持 Grid 布局
 */

import { useMemo } from 'react'
import type { Slide as SlideType, Module, Paragraph } from '@/types'
import ParagraphRenderer from './ParagraphRenderer'
import { parseParagraphs } from '@/core/parser'

interface SlideProps {
  /** 幻灯片数据 */
  slide: SlideType
  /** 所属模块数据 */
  module: Module
  /** 缩放比例 */
  scale?: number
  /** 是否显示 Grid 参考线 */
  showGridLines?: boolean
  /** 是否为大纲缩略图模式 */
  isThumbnail?: boolean
}

/**
 * 幻灯片组件
 */
export default function Slide({
  slide,
  module,
  scale = 1,
  showGridLines = false,
  isThumbnail = false,
}: SlideProps) {
  // 解析模块源码为段落
  const paragraphs = useMemo(() => {
    return parseParagraphs(module.source)
  }, [module.source])

  // 获取当前幻灯片的段落内容
  const slideParagraphs = useMemo(() => {
    const { startParagraphIndex, endParagraphIndex } = slide.contentRange
    return paragraphs.slice(startParagraphIndex, endParagraphIndex + 1)
  }, [paragraphs, slide.contentRange])

  // 计算 Grid 布局样式
  const gridStyle = useMemo(() => {
    const grid = slide.gridOverride || module.baseGrid
    return {
      display: 'grid',
      gridTemplateColumns: grid.columns.join(' '),
      gridTemplateRows: grid.rows.join(' '),
      gap: grid.gap,
    }
  }, [slide.gridOverride, module.baseGrid])

  // 计算幻灯片尺寸
  const slideWidth = 1280 * scale
  const slideHeight = 720 * scale

  return (
    <div
      className={`slide-container bg-white ${isThumbnail ? 'shadow-sm' : 'shadow-lg'} ${showGridLines ? 'border-2 border-blue-200' : ''}`}
      style={{
        width: slideWidth,
        height: slideHeight,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        ...gridStyle,
      }}
    >
      {/* 渲染段落内容 */}
      {slideParagraphs.map((para: Paragraph) => (
        <div
          key={para.id}
          className={`p-4 ${isThumbnail ? 'text-sm' : ''}`}
          style={{
            // 默认占据整个宽度
            gridColumn: '1 / -1',
            gridRow: 'auto',
          }}
        >
          {isThumbnail ? (
            // 缩略图模式：简单文本显示
            <div className="truncate text-gray-600">
              {para.content.slice(0, 50)}...
            </div>
          ) : (
            // 正常模式：完整渲染
            <ParagraphRenderer content={para.content} />
          )}
        </div>
      ))}

      {/* 空幻灯片提示 */}
      {slideParagraphs.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400">
          <span>空幻灯片</span>
        </div>
      )}

      {/* Grid 参考线 */}
      {showGridLines && (
        <div className="absolute inset-0 pointer-events-none">
          {/* 垂直线 */}
          {module.baseGrid.columns.map((_, colIndex) => (
            <div
              key={`v-${colIndex}`}
              className="absolute top-0 bottom-0 w-px bg-blue-100 opacity-50"
              style={{ left: `${colIndex * 100 / module.baseGrid.columns.length}%` }}
            />
          ))}
          {/* 水平线 */}
          {module.baseGrid.rows.map((_, rowIndex) => (
            <div
              key={`h-${rowIndex}`}
              className="absolute left-0 right-0 h-px bg-blue-100 opacity-50"
              style={{ top: `${rowIndex * 100 / module.baseGrid.rows.length}%` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}