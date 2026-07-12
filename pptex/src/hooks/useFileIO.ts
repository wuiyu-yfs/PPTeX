/**
 * 文件 I/O Hook
 * 使用 File System Access API（支持时）或降级方案
 */

import { useCallback, useState } from 'react'
import { serializeDocument, deserializeDocument, downloadBlob } from '@/utils/fileIO'
import type { Document } from '@/types'

interface FileIOState {
  /** 当前打开的文件句柄（仅 File System Access API 支持） */
  fileHandle: FileSystemFileHandle | null
  /** 当前文件名 */
  fileName: string
  /** 是否支持 File System Access API */
  supportsFileSystemAccess: boolean
}

/**
 * 检查是否支持 File System Access API
 */
function checkFileSystemAccessSupport(): boolean {
  return 'showOpenFilePicker' in window && 'showSaveFilePicker' in window
}

/**
 * 文件 I/O Hook
 */
export function useFileIO() {
  const [state, setState] = useState<FileIOState>({
    fileHandle: null,
    fileName: '',
    supportsFileSystemAccess: checkFileSystemAccessSupport(),
  })

  /**
   * 打开文件
   */
  const openFile = useCallback(async (): Promise<Document | null> => {
    try {
      if (state.supportsFileSystemAccess) {
        // 使用 File System Access API
        const [handle] = await (window as unknown as {
          showOpenFilePicker: (options: unknown) => Promise<[FileSystemFileHandle]>
        }).showOpenFilePicker({
          types: [
            {
              description: 'PPTeX 文件',
              accept: { 'application/zip': ['.pptex'] },
            },
          ],
        })

        const file = await handle.getFile()
        const doc = await deserializeDocument(file)

        setState({
          fileHandle: handle,
          fileName: file.name,
          supportsFileSystemAccess: true,
        })

        return doc
      } else {
        // 降级方案：使用 input 元素
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.pptex'

        return new Promise<Document | null>((resolve) => {
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) {
              resolve(null)
              return
            }

            try {
              const doc = await deserializeDocument(file)
              setState({
                fileHandle: null,
                fileName: file.name,
                supportsFileSystemAccess: false,
              })
              resolve(doc)
            } catch {
              resolve(null)
            }
          }

          input.click()
        })
      }
    } catch {
      return null
    }
  }, [state.supportsFileSystemAccess])

  /**
   * 保存文件（使用当前文件句柄）
   */
  const saveFile = useCallback(async (doc: Document): Promise<boolean> => {
    try {
      if (state.fileHandle) {
        // 使用已有的文件句柄保存
        const blob = await serializeDocument(doc)
        const writable = await state.fileHandle.createWritable()
        await writable.write(blob)
        await writable.close()
        return true
      } else {
        // 使用另存为
        return saveAsFile(doc, state.fileName || 'presentation.pptex')
      }
    } catch {
      return false
    }
  }, [state.fileHandle, state.fileName])

  /**
   * 另存为文件
   */
  const saveAsFile = useCallback(async (doc: Document, suggestedName?: string): Promise<boolean> => {
    try {
      const defaultName = suggestedName || 'presentation.pptex'

      if (state.supportsFileSystemAccess) {
        // 使用 File System Access API
        const handle = await (window as unknown as {
          showSaveFilePicker: (options: unknown) => Promise<FileSystemFileHandle>
        }).showSaveFilePicker({
          suggestedName: defaultName,
          types: [
            {
              description: 'PPTeX 文件',
              accept: { 'application/zip': ['.pptex'] },
            },
          ],
        })

        const blob = await serializeDocument(doc)
        const writable = await handle.createWritable()
        await writable.write(blob)
        await writable.close()

        setState({
          fileHandle: handle,
          fileName: handle.name,
          supportsFileSystemAccess: true,
        })

        return true
      } else {
        // 降级方案：使用下载
        const blob = await serializeDocument(doc)
        downloadBlob(blob, defaultName)

        setState({
          fileHandle: null,
          fileName: defaultName,
          supportsFileSystemAccess: false,
        })

        return true
      }
    } catch {
      return false
    }
  }, [state.supportsFileSystemAccess])

  /**
   * 清除文件状态（关闭文件）
   */
  const clearFileState = useCallback(() => {
    setState({
      fileHandle: null,
      fileName: '',
      supportsFileSystemAccess: state.supportsFileSystemAccess,
    })
  }, [state.supportsFileSystemAccess])

  return {
    ...state,
    openFile,
    saveFile,
    saveAsFile,
    clearFileState,
  }
}