/**
 * 幻灯片大纲组件
 * 左侧缩略图列表
 */

import { useMemo } from 'react'
import type { Document } from '@/types'

interface SlideOutlineProps {
  /** 文档数据 */
  document: Document
  /** 当前选中的幻灯片 ID */
  selectedSlideId?: string | null
  /** 点击幻灯片回调 */
  onSlideClick?: (slideId: string) => void
}

/**
 * 幻灯片大纲
 */
export default function SlideOutline({
  document,
  selectedSlideId,
  onSlideClick,
}: SlideOutlineProps) {
  // 计算所有幻灯片（按模块分组）
  const outlineItems = useMemo(() => {
    return document.modules.map(module => ({
      module,
      slideCount: Math.ceil(module.source.length / 500) || 1, // 简单估算
    }))
  }, [document.modules])

  return (
    <div className="w-48 bg-gray-50 border-r border-gray-200 overflow-y-auto">
      {/* 标题 */}
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">大纲</h2>
      </div>

      {/* 模块和幻灯片列表 */}
      <div className="p-2 space-y-2">
        {outlineItems.map(({ module, slideCount }) => (
          <div key={module.id} className="space-y-1">
            {/* 模块标题 */}
            <div className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
              {module.title}
            </div>

            {/* 幻灯片缩略图 */}
            <div className="space-y-1">
              {Array.from({ length: Math.min(slideCount, 5) }).map((_, index) => (
                <div
                  key={`${module.id}-${index}`}
                  className={`cursor-pointer p-1 rounded border ${
                    selectedSlideId === `${module.id}-${index}`
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onSlideClick?.(`${module.id}-${index}`)}
                >
                  {/* 缩略图 */}
                  <div
                    className="bg-white aspect-video flex items-center justify-center text-gray-400 text-xs"
                    style={{ fontSize: '10px' }}
                  >
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 空文档提示 */}
      {document.modules.length === 0 && (
        <div className="p-4 text-center text-gray-400 text-sm">
          暂无幻灯片
        </div>
      )}
    </div>
  )
}