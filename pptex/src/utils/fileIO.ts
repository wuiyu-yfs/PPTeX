/**
 * PPTeX 文件处理 - .pptex 格式读写
 *
 * .pptex 是一个 ZIP 压缩包，内部结构：
 * - manifest.json: 文档元数据
 * - modules/mod-xxx.json: 模块数据
 * - slides/slide-xxx.json: 幻灯片数据
 * - assets/: 资源文件目录
 */

import JSZip from 'jszip'
import type { Document, Module, Slide } from '@/types'

/**
 * 将 Document 对象序列化为 ZIP Blob
 */
export async function serializeDocument(doc: Document): Promise<Blob> {
  const zip = new JSZip()

  // 写入 manifest.json
  zip.file('manifest.json', JSON.stringify(doc.manifest, null, 2))

  // 写入模块文件
  const modulesFolder = zip.folder('modules')
  if (modulesFolder) {
    for (const module of doc.modules) {
      modulesFolder.file(`${module.id}.json`, JSON.stringify(module, null, 2))
    }
  }

  // 写入幻灯片文件
  const slidesFolder = zip.folder('slides')
  if (slidesFolder) {
    for (const slide of doc.slides) {
      slidesFolder.file(`${slide.id}.json`, JSON.stringify(slide, null, 2))
    }
  }

  // 创建空的 assets 目录
  zip.folder('assets')

  // 生成 ZIP Blob
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  return blob
}

/**
 * 从 ZIP Blob 反序列化为 Document 对象
 */
export async function deserializeDocument(blob: Blob): Promise<Document> {
  const zip = await JSZip.loadAsync(blob)

  // 读取 manifest.json
  const manifestFile = zip.file('manifest.json')
  if (!manifestFile) {
    throw new Error('无效的 .pptex 文件：缺少 manifest.json')
  }

  const manifestContent = await manifestFile.async('string')
  const manifest = JSON.parse(manifestContent)

  // 读取所有模块
  const modules: Module[] = []
  const modulesFolder = zip.folder('modules')
  if (modulesFolder) {
    const moduleFiles = modulesFolder.file(/\.json$/)
    for (const file of moduleFiles) {
      const content = await file.async('string')
      modules.push(JSON.parse(content) as Module)
    }
  }

  // 读取所有幻灯片
  const slides: Slide[] = []
  const slidesFolder = zip.folder('slides')
  if (slidesFolder) {
    const slideFiles = slidesFolder.file(/\.json$/)
    for (const file of slideFiles) {
      const content = await file.async('string')
      slides.push(JSON.parse(content) as Slide)
    }
  }

  return {
    manifest,
    modules,
    slides,
  }
}

/**
 * 下载 Blob 为文件
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 验证 Document 结构完整性
 */
export function validateDocument(doc: Document): boolean {
  // 检查 manifest 必要字段
  if (!doc.manifest.title || !doc.manifest.slideWidth || !doc.manifest.slideHeight) {
    return false
  }

  // 检查模块 ID 与幻灯片的关联
  for (const slide of doc.slides) {
    const moduleExists = doc.modules.some(m => m.id === slide.moduleId)
    if (!moduleExists) {
      return false
    }
  }

  return true
}