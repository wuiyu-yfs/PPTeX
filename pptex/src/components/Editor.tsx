/**
 * 主编辑器组件
 */

import { useState } from 'react'
import { useDocumentStore } from '@/store'
import Toolbar from './Toolbar'
import SlideOutline from './SlideOutline'
import GroupEditView from './GroupEditView'

/**
 * 主编辑器
 */
export default function Editor() {
  const { document, selectedModuleId, selectedSlideId, editMode } = useDocumentStore()
  const [activeTab, setActiveTab] = useState<'visual' | 'source'>('visual')

  return (
    <div className="flex flex-col h-screen">
      {/* 工具栏 */}
      <Toolbar />

      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧大纲 */}
        <SlideOutline
          document={document}
          selectedSlideId={selectedSlideId}
        />

        {/* 中间编辑区 */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {editMode === 'group' ? (
            <GroupEditView
              document={document}
              selectedModuleId={selectedModuleId}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>页编辑模式（待实现）</p>
            </div>
          )}
        </div>

        {/* 右侧面板 */}
        <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
          {/* 标签切换 */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 px-4 py-2 text-sm ${
                activeTab === 'visual'
                  ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('visual')}
            >
              属性
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm ${
                activeTab === 'source'
                  ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('source')}
            >
              源码
            </button>
          </div>

          {/* 内容区 */}
          <div className="p-4">
            {activeTab === 'visual' ? (
              <div>
                {selectedModuleId ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">模块属性</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <label className="text-gray-500">类型</label>
                        <div className="mt-1">
                          {document.modules.find(m => m.id === selectedModuleId)?.type}
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-500">标题</label>
                        <input
                          className="w-full px-2 py-1 border border-gray-200 rounded"
                          defaultValue={
                            document.modules.find(m => m.id === selectedModuleId)?.title
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">未选中模块</p>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">
                <p>源码编辑器（Monaco Editor 待集成）</p>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {document.modules.find(m => m.id === selectedModuleId)?.source || '无内容'}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}