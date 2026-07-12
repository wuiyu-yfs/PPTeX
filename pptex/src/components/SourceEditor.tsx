/**
 * Monaco Editor 源码编辑器组件
 * 支持 LaTeX 语法高亮和错误标记
 */

import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import type { SourceError } from '@/types'

// 懒加载 Monaco Editor
const MonacoEditor = lazy(() => import('@monaco-editor/react'))

interface SourceEditorProps {
  /** 源码内容 */
  value: string
  /** 内容变化回调 */
  onChange?: (value: string) => void
  /** 错误列表 */
  errors?: SourceError[]
  /** 是否只读 */
  readOnly?: boolean
  /** 额外的 CSS 类名 */
  className?: string
}

/**
 * 源码编辑器组件
 */
export default function SourceEditor({
  value,
  onChange,
  errors = [],
  readOnly = false,
  className = '',
}: SourceEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  /**
   * 编辑器挂载回调
   */
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
    setIsLoaded(true)

    // 配置 LaTeX 语法高亮（如果 Monaco 没有内置）
    // 使用内置的 'latex' 或回退到 'markdown'
  }

  /**
   * 更新错误标记
   */
  useEffect(() => {
    if (!editorRef.current || !isLoaded) return

    const monaco = (window as unknown as { monaco?: typeof import('monaco-editor') }).monaco
    if (!monaco) return

    // 清除旧的错误标记
    const model = editorRef.current.getModel()
    if (!model) return

    // 添加新的错误标记
    const decorations = errors.map(error => ({
      range: new monaco.Range(error.lineNumber, 1, error.lineNumber, 999),
      options: {
        isWholeLine: true,
        className: 'bg-red-100',
        glyphMarginClassName: 'bg-red-500',
        hoverMessage: { value: error.message },
      },
    }))

    editorRef.current.deltaDecorations([], decorations)
  }, [errors, isLoaded])

  return (
    <div className={`h-full ${className}`}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-gray-400">加载编辑器...</div>
          </div>
        }
      >
        <MonacoEditor
          height="100%"
          language="latex"
          value={value}
          onChange={(val) => onChange?.(val || '')}
          onMount={handleEditorMount}
          theme="vs-light"
          options={{
            readOnly,
            fontSize: 14,
            fontFamily: 'ui-monospace, monospace',
            minimap: { enabled: false },
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 8 },
            folding: true,
            renderLineHighlight: 'line',
            tabSize: 2,
          }}
        />
      </Suspense>
    </div>
  )
}