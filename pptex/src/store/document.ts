/**
 * PPTeX 状态管理 - Zustand Store
 */

import { create } from 'zustand'
import type { Document, Module, Slide, EditMode, GridLayout, Theme } from '@/types'

/**
 * 预设默认主题
 */
export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'classic',
    name: '经典学术',
    colors: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      background: '#ffffff',
      text: '#1f2937',
      accent: '#1d4ed8',
    },
    fonts: {
      heading: 'system-ui, sans-serif',
      body: 'system-ui, sans-serif',
      mono: 'ui-monospace, monospace',
    },
    slide: {
      borderRadius: '8px',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: 'minimal',
    name: '极简现代',
    colors: {
      primary: '#6b7280',
      secondary: '#9ca3af',
      background: '#ffffff',
      text: '#374151',
      accent: '#4b5563',
    },
    fonts: {
      heading: 'system-ui, sans-serif',
      body: 'system-ui, sans-serif',
      mono: 'ui-monospace, monospace',
    },
    slide: {
      borderRadius: '4px',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: 'dark',
    name: '深色护眼',
    colors: {
      primary: '#60a5fa',
      secondary: '#3b82f6',
      background: '#1f2937',
      text: '#f3f4f6',
      accent: '#93c5fd',
    },
    fonts: {
      heading: 'system-ui, sans-serif',
      body: 'system-ui, sans-serif',
      mono: 'ui-monospace, monospace',
    },
    slide: {
      borderRadius: '8px',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    },
  },
]

/**
 * 默认 Grid 布局
 */
export const DEFAULT_GRID: GridLayout = {
  columns: ['1fr'],
  rows: ['auto'],
  gap: '16px',
}

/**
 * 创建默认文档
 */
export function createDefaultDocument(): Document {
  const now = new Date().toISOString()
  return {
    manifest: {
      title: '未命名演示文稿',
      theme: 'classic',
      slideWidth: 1280,
      slideHeight: 720,
      printLayout: '2x3',
      createdAt: now,
      updatedAt: now,
    },
    modules: [],
    slides: [],
  }
}

/**
 * 创建新模块
 */
export function createNewModule(type: Module['type'], title: string): Module {
  return {
    id: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title,
    source: '',
    baseGrid: DEFAULT_GRID,
    slides: [],
    manualBreaks: [],
  }
}

/**
 * 创建新幻灯片
 */
export function createNewSlide(moduleId: string): Slide {
  return {
    id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    moduleId,
    contentRange: {
      startParagraphIndex: 0,
      endParagraphIndex: 0,
    },
    regions: [],
    isOverflow: false,
  }
}

/**
 * Store 状态定义
 */
interface DocumentState {
  /** 文档数据 */
  document: Document
  /** 当前选中的模块 ID */
  selectedModuleId: string | null
  /** 当前选中的幻灯片 ID */
  selectedSlideId: string | null
  /** 当前编辑模式 */
  editMode: EditMode
  /** 当前主题 */
  currentTheme: Theme
  /** 所有主题列表 */
  themes: Theme[]
  /** 是否正在同步 */
  isSyncing: boolean
  /** 是否已修改（未保存） */
  isDirty: boolean
}

/**
 * Store Actions 定义
 */
interface DocumentActions {
  /** 设置文档 */
  setDocument: (document: Document) => void
  /** 添加模块 */
  addModule: (type: Module['type'], title?: string) => void
  /** 更新模块源码 */
  updateModuleSource: (moduleId: string, source: string) => void
  /** 删除模块 */
  deleteModule: (moduleId: string) => void
  /** 选中模块 */
  selectModule: (moduleId: string | null) => void
  /** 选中幻灯片 */
  selectSlide: (slideId: string | null) => void
  /** 设置编辑模式 */
  setEditMode: (mode: EditMode) => void
  /** 设置主题 */
  setTheme: (themeId: string) => void
  /** 更新幻灯片 */
  updateSlide: (slideId: string, slide: Partial<Slide>) => void
  /** 更新模块手动分页 */
  updateModuleManualBreaks: (moduleId: string, breaks: number[]) => void
  /** 标记为已修改 */
  markDirty: () => void
  /** 标记为已保存 */
  markSaved: () => void
  /** 重置文档 */
  resetDocument: () => void
}

/**
 * PPTeX 主 Store
 */
export const useDocumentStore = create<DocumentState & DocumentActions>((set) => ({
  // 初始状态
  document: createDefaultDocument(),
  selectedModuleId: null,
  selectedSlideId: null,
  editMode: 'group',
  currentTheme: DEFAULT_THEMES[0],
  themes: DEFAULT_THEMES,
  isSyncing: false,
  isDirty: false,

  // Actions
  setDocument: (document) => set({ document, isDirty: false }),

  addModule: (type, title) => set((state) => {
    const module = createNewModule(type, title || getDefaultModuleTitle(type))
    const newModules = [...state.document.modules, module]
    return {
      document: {
        ...state.document,
        modules: newModules,
        manifest: {
          ...state.document.manifest,
          updatedAt: new Date().toISOString(),
        },
      },
      selectedModuleId: module.id,
      isDirty: true,
    }
  }),

  updateModuleSource: (moduleId, source) => set((state) => {
    const modules = state.document.modules.map(m =>
      m.id === moduleId ? { ...m, source } : m
    )
    return {
      document: {
        ...state.document,
        modules,
        manifest: {
          ...state.document.manifest,
          updatedAt: new Date().toISOString(),
        },
      },
      isDirty: true,
    }
  }),

  deleteModule: (moduleId) => set((state) => {
    const modules = state.document.modules.filter(m => m.id !== moduleId)
    const slides = state.document.slides.filter(s => s.moduleId !== moduleId)
    return {
      document: {
        ...state.document,
        modules,
        slides,
        manifest: {
          ...state.document.manifest,
          updatedAt: new Date().toISOString(),
        },
      },
      selectedModuleId: state.selectedModuleId === moduleId ? null : state.selectedModuleId,
      isDirty: true,
    }
  }),

  selectModule: (moduleId) => set({ selectedModuleId: moduleId }),

  selectSlide: (slideId) => set({ selectedSlideId: slideId }),

  setEditMode: (mode) => set({ editMode: mode }),

  setTheme: (themeId) => set((state) => {
    const theme = state.themes.find(t => t.id === themeId) || state.currentTheme
    return {
      currentTheme: theme,
      document: {
        ...state.document,
        manifest: {
          ...state.document.manifest,
          theme: themeId,
          updatedAt: new Date().toISOString(),
        },
      },
      isDirty: true,
    }
  }),

  updateSlide: (slideId, slideUpdate) => set((state) => {
    const slides = state.document.slides.map(s =>
      s.id === slideId ? { ...s, ...slideUpdate } : s
    )
    return {
      document: {
        ...state.document,
        slides,
        manifest: {
          ...state.document.manifest,
          updatedAt: new Date().toISOString(),
        },
      },
      isDirty: true,
    }
  }),

  updateModuleManualBreaks: (moduleId, breaks) => set((state) => {
    const modules = state.document.modules.map(m =>
      m.id === moduleId ? { ...m, manualBreaks: breaks } : m
    )
    return {
      document: {
        ...state.document,
        modules,
        manifest: {
          ...state.document.manifest,
          updatedAt: new Date().toISOString(),
        },
      },
      isDirty: true,
    }
  }),

  markDirty: () => set({ isDirty: true }),

  markSaved: () => set({ isDirty: false }),

  resetDocument: () => set({
    document: createDefaultDocument(),
    selectedModuleId: null,
    selectedSlideId: null,
    isDirty: false,
  }),
}))

/**
 * 获取模块类型的默认标题
 */
function getDefaultModuleTitle(type: Module['type']): string {
  const titles: Record<Module['type'], string> = {
    knowledge: '知识点讲解',
    example: '例题',
    exercise: '课堂练习',
    solution: '解析',
    summary: '章节总结',
  }
  return titles[type] || '模块'
}