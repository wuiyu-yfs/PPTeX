/**
 * PPTeX 核心数据类型定义
 */

/**
 * 模块类型枚举
 */
export type ModuleType = 'knowledge' | 'example' | 'exercise' | 'solution' | 'summary'

/**
 * 编辑模式枚举
 */
export type EditMode = 'group' | 'page'

/**
 * 打印布局类型
 */
export type PrintLayout = '2x2' | '2x3'

/**
 * Grid 区域定义
 */
export interface Region {
  /** 区域 ID */
  id: string
  /** 网格起始行 */
  rowStart: number
  /** 网格起始列 */
  colStart: number
  /** 网格结束行 */
  rowEnd: number
  /** 网格结束列 */
  colEnd: number
  /** 段落内容引用 */
  paragraphId?: string
  /** 区域背景色 */
  backgroundColor?: string
  /** 垂直对齐方式 */
  verticalAlign?: 'start' | 'center' | 'end'
}

/**
 * Grid 布局定义
 */
export interface GridLayout {
  /** 列配置数组，CSS Grid 格式如 ['1fr', '1fr', '1fr'] */
  columns: string[]
  /** 行配置数组 */
  rows: string[]
  /** 间距 */
  gap: string
}

/**
 * 内容范围定义 - 标识幻灯片包含的段落范围
 */
export interface ContentRange {
  /** 起始段落索引 */
  startParagraphIndex: number
  /** 结束段落索引 */
  endParagraphIndex: number
}

/**
 * 幻灯片定义 - 放映的最小单元
 */
export interface Slide {
  /** 幻灯片 ID */
  id: string
  /** 所属模块 ID */
  moduleId: string
  /** 内容范围 */
  contentRange: ContentRange
  /** Grid 布局覆盖（可选，覆盖模块默认布局） */
  gridOverride?: GridLayout
  /** 区域分配 */
  regions: Region[]
  /** 是否溢出（单段落超过一页） */
  isOverflow?: boolean
}

/**
 * 模块定义 - 教学语义单元
 */
export interface Module {
  /** 模块 ID */
  id: string
  /** 模块类型 */
  type: ModuleType
  /** 模块标题 */
  title: string
  /** LaTeX 源码内容 */
  source: string
  /** 默认 Grid 布局 */
  baseGrid: GridLayout
  /** 关联的幻灯片 ID 列表 */
  slides: string[]
  /** 手动分页断点（段落索引数组） */
  manualBreaks: number[]
}

/**
 * 段落定义 - 分页的最小单元
 */
export interface Paragraph {
  /** 段落 ID */
  id: string
  /** 段落内容 */
  content: string
  /** 在源码中的起始位置 */
  sourceStart: number
  /** 在源码中的结束位置 */
  sourceEnd: number
}

/**
 * 主题定义
 */
export interface Theme {
  /** 主题 ID */
  id: string
  /** 主题名称 */
  name: string
  /** 颜色配置 */
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    accent: string
  }
  /** 字体配置 */
  fonts: {
    heading: string
    body: string
    mono: string
  }
  /** 幻灯片样式 */
  slide: {
    borderRadius: string
    shadow: string
  }
}

/**
 * 文档元数据
 */
export interface Manifest {
  /** 文档标题 */
  title: string
  /** 当前主题 */
  theme: string
  /** 幻灯片宽度（像素） */
  slideWidth: number
  /** 幻灯片高度（像素） */
  slideHeight: number
  /** 打印布局 */
  printLayout: PrintLayout
  /** 创建时间 */
  createdAt: string
  /** 最后修改时间 */
  updatedAt: string
}

/**
 * 文档定义 - 整个演示文稿
 */
export interface Document {
  /** 元数据 */
  manifest: Manifest
  /** 所有模块 */
  modules: Module[]
  /** 所有幻灯片 */
  slides: Slide[]
}

/**
 * 源码错误定义
 */
export interface SourceError {
  /** 行号 */
  lineNumber: number
  /** 错误信息 */
  message: string
}