import { useEffect } from 'react'
import { Editor } from '@/components'
import { useDocumentStore } from '@/store'

function App() {
  const { document, addModule, updateModuleSource } = useDocumentStore()

  // 初始化添加示例模块
  useEffect(() => {
    if (document.modules.length === 0) {
      // 添加示例模块
      addModule('knowledge', '牛顿运动定律')

      // 等待模块添加后更新源码
      setTimeout(() => {
        const moduleId = useDocumentStore.getState().document.modules[0]?.id
        if (moduleId) {
          updateModuleSource(moduleId, `
牛顿第一定律：一切物体在没有受到外力作用时，总保持匀速直线运动状态或静止状态。

\\begin{equation}
F = ma
\\end{equation}

牛顿第二定律的数学表达式：

$$
\\vec{F} = m\\vec{a}
$$

其中：
- $F$ 表示外力
- $m$ 表示质量
- $a$ 表示加速度

动能定理：$E_k = \\frac{1}{2}mv^2$

\\begin{align}
E &= mc^2 \\
p &= mv
\\end{align}
`)
        }
      }, 100)
    }
  }, [])

  return <Editor />
}

export default App