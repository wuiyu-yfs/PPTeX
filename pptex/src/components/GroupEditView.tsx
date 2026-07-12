/**
 * 组编辑视图组件
 * 垂直连续滚动显示所有模块的幻灯片
 */

import { useMemo } from 'react'
import type { Document, Module, Slide as SlideType } from '@/types'
import Slide from './Slide'
import { parseParagraphs } from '@/core/parser'

interface GroupEditViewProps {
  /** 文档数据 */
  document: Document
  /** 当前选中的模块 ID */
  selectedModuleId?: string | null
  /** 点击幻灯片回调 */
  onSlideClick?: (slideId: string) => void
}

/**
 * 模块分割线组件
 */
function ModuleDivider({ module }: { module: Module }) {
  return (
    <div className="flex items-center gap-2 py-4 px-2 bg-gray-50 border-y border-gray-200">
      <div className="flex-1 h-px bg-gray-300" />
      <span className="text-sm text-gray-500 font-medium">{module.title}</span>
      <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-200 rounded">
        {module.type}
      </span>
      <div className="flex-1 h-px bg-gray-300" />
    </div>
  )
}

/**
 * 幻灯片分割线组件
 */
function SlideDivider() {
  return (
    <div className="h-8 flex items-center justify-center">
      <div className="w-full h-px border-t-2 border-dashed border-gray-300" />
    </div>
  )
}

/**
 * 组编辑视图
 */
export default function GroupEditView({
  document,
  selectedModuleId,
  onSlideClick,
}: GroupEditViewProps) {
  // 为每个模块生成幻灯片（基于段落分页）
  const slidesByModule = useMemo(() => {
    const result: Array<{ module: Module; slides: SlideType[] }> = []

    for (const module of document.modules) {
      // 解析段落
      const paragraphs = parseParagraphs(module.source)

      // 创建临时幻灯片（每个段落一张）
      const slides: SlideType[] = paragraphs.map((_, index) => ({
        id: `temp-slide-${module.id}-${index}`,
        moduleId: module.id,
        contentRange: {
          startParagraphIndex: index,
          endParagraphIndex: index,
        },
        regions: [],
        isOverflow: false,
      }))

      result.push({ module, slides })
    }

    return result
  }, [document.modules])

  return (
    <div className="flex flex-col gap-0 overflow-y-auto">
      {slidesByModule.map(({ module, slides }) => (
        <div key={module.id}>
          {/* 模块分割线 */}
          <ModuleDivider module={module} />

          {/* 模块标题 */}
          <div
            className={`px-4 py-2 ${
              selectedModuleId === module.id
                ? 'bg-primary-100 border-l-4 border-primary-500'
                : 'bg-white'
            }`}
          >
            <h3 className="text-lg font-semibold">{module.title}</h3>
          </div>

          {/* 幻灯片列表 */}
          <div className="flex flex-col items-center gap-0 py-4">
            {slides.map((slide, index) => (
              <div key={slide.id} className="w-full flex flex-col items-center">
                {/* 幻灯片 */}
                <div
                  className="cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => onSlideClick?.(slide.id)}
                >
                  <Slide
                    slide={slide}
                    module={module}
                    scale={0.5}
                  />
                </div>

                {/* 幻灯片分割线 */}
                {index < slides.length - 1 && <SlideDivider />}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 空文档提示 */}
      {document.modules.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg">暂无内容</p>
          <p className="text-sm">点击"添加模块"开始创建</p>
        </div>
      )}
    </div>
  )
}