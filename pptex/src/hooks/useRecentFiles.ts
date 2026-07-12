/**
 * 最近文件列表 Hook
 * 使用 IndexedDB 存储
 */

import { useCallback, useState, useEffect } from 'react'
import { get, set, del } from 'idb-keyval'

interface RecentFile {
  /** 文件名 */
  name: string
  /** 打开时间 */
  openedAt: string
}

const RECENT_FILES_KEY = 'pptex-recent-files'
const MAX_RECENT_FILES = 10

/**
 * 最近文件列表 Hook
 */
export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([])

  // 初始化时加载最近文件列表
  useEffect(() => {
    loadRecentFiles()
  }, [])

  /**
   * 加载最近文件列表
   */
  const loadRecentFiles = useCallback(async () => {
    try {
      const files = await get<RecentFile[]>(RECENT_FILES_KEY)
      setRecentFiles(files || [])
    } catch {
      setRecentFiles([])
    }
  }, [])

  /**
   * 添加最近文件
   */
  const addRecentFile = useCallback(async (name: string) => {
    try {
      const files = recentFiles.filter(f => f.name !== name)
      const newFile: RecentFile = {
        name,
        openedAt: new Date().toISOString(),
      }

      const updatedFiles = [newFile, ...files].slice(0, MAX_RECENT_FILES)
      await set(RECENT_FILES_KEY, updatedFiles)
      setRecentFiles(updatedFiles)
    } catch {
      // 静默失败
    }
  }, [recentFiles])

  /**
   * 清除最近文件列表
   */
  const clearRecentFiles = useCallback(async () => {
    try {
      await del(RECENT_FILES_KEY)
      setRecentFiles([])
    } catch {
      // 静默失败
    }
  }, [])

  /**
   * 删除单个最近文件
   */
  const removeRecentFile = useCallback(async (name: string) => {
    try {
      const updatedFiles = recentFiles.filter(f => f.name !== name)
      await set(RECENT_FILES_KEY, updatedFiles)
      setRecentFiles(updatedFiles)
    } catch {
      // 静默失败
    }
  }, [recentFiles])

  return {
    recentFiles,
    addRecentFile,
    clearRecentFiles,
    removeRecentFile,
    loadRecentFiles,
  }
}