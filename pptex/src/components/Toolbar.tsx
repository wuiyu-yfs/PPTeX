/**
 * 工具栏组件
 */

import { useDocumentStore } from '@/store'

/**
 * 工具栏组件
 */
export default function Toolbar() {
  const {
    document,
    editMode,
    currentTheme,
    isDirty,
    addModule,
    setEditMode,
    setTheme,
  } = useDocumentStore()

  return (
    <div className="toolbar bg-white border-b border-gray-200 px-4 py-2">
      {/* 文件操作 */}
      <div className="flex items-center gap-2">
        <button className="toolbar-btn">
          📄 新建
        </button>
        <button className="toolbar-btn">
          📂 打开
        </button>
        <button className="toolbar-btn">
          💾 保存{isDirty ? ' *' : ''}
        </button>
      </div>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-gray-200 mx-2" />

      {/* 模块操作 */}
      <div className="flex items-center gap-2">
        <button
          className="toolbar-btn bg-primary-500 text-white hover:bg-primary-600"
          onClick={() => addModule('knowledge')}
        >
          ➕ 添加模块
        </button>
      </div>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-gray-200 mx-2" />

      {/* 编辑模式切换 */}
      <div className="flex items-center gap-2">
        <button
          className={`toolbar-btn ${editMode === 'group' ? 'active' : ''}`}
          onClick={() => setEditMode('group')}
        >
          📝 组编辑
        </button>
        <button
          className={`toolbar-btn ${editMode === 'page' ? 'active' : ''}`}
          onClick={() => setEditMode('page')}
        >
          🖼️ 页编辑
        </button>
      </div>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-gray-200 mx-2" />

      {/* 主题切换 */}
      <div className="flex items-center gap-2">
        <select
          className="toolbar-btn text-sm"
          value={currentTheme.id}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="classic">经典学术</option>
          <option value="minimal">极简现代</option>
          <option value="dark">深色护眼</option>
        </select>
      </div>

      {/* 右侧信息 */}
      <div className="flex items-center gap-4 ml-auto text-sm text-gray-500">
        <span>模块数: {document.modules.length}</span>
        <span>{document.manifest.title}</span>
      </div>
    </div>
  )
}