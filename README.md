# PPTeX 项目方案



# 一、项目概述

PPTeX 是一款所见即所得的幻灯片编辑器，专为物理竞赛讲义课件设计。它在编辑体验上无限接近 PowerPoint（直观的富文本编辑、拖拽布局、工具栏与快捷键），底层却生成干净、可复用的 LaTeX 源码，并原生支持放映版幻灯片与打印讲义两种输出模式。

**核心价值主张：**用 PPT 的方式编辑，用 LaTeX 的方式沉淀，用 HTML 的方式交付。

本项目采用 Web 优先架构，所有核心功能均可在现代浏览器中直接运行，后期通过薄壳封装可轻松扩展为桌面应用（Electron）或移动端应用（React Native）。

# 二、项目背景与目标

## 2\.1 背景分析

**学术演示痛点：**传统 Beamer 编写效率低，代码编辑缺乏直观反馈；PowerPoint 操作直观但难以满足复杂公式排版与学术出版要求。

**物理竞赛教学特殊需求：**课程内容包含大量公式、图表、例题解析，需要频繁粘贴 LaTeX 代码片段，同时要求放映版与打印讲义两种输出形态无缝切换。

**现有工具局限：**Overleaf 等在线 LaTeX 编辑器侧重源码编辑，可视化能力弱；Marp 等 Markdown 转幻灯片工具对 Beamer 高级结构支持不足。

## 2\.2 项目目标

- 提供类 PPT 的富文本编辑体验：格式化按钮、快捷键、实时预览

- 保留 LaTeX 完整控制力：所有内容以 LaTeX 源码形式存储，支持直接编辑源码，实现双向同步

- 双模式编辑："组编辑"用于快速内容输入与自动分页，"页编辑"用于精细布局微调

- 多态输出：放映版 HTML/PDF，打印讲义 PDF（2×2/2×3 无缝拼接），可导出标准 Beamer 或 Article 的 \.tex 源文件

- 跨平台潜力：首期在 Web 端实现全部功能，架构支持未来迁移至桌面和移动端

# 三、核心概念定义

|术语|定义|
|---|---|
|模块（Module）|一个教学语义单元（如"知识点讲解""例题""解析"），包含一段完整的 LaTeX 源码，可以跨越多张幻灯片|
|幻灯片（Slide）|放映的最小单元，由模块内容自动分页生成，拥有独立的 Grid 布局（可覆盖默认布局）|
|组编辑（Group Edit）|创作期模式：以模块为单位连续显示内容，支持粘贴 LaTeX 源码、自动分页、整体样式调整|
|页编辑（Page Edit）|微调模式：单独编辑某张幻灯片的 Grid 布局、元素对齐等，不改变模块源码结构|
|Grid 布局|每张幻灯片的排版骨架，采用 CSS Grid 规范，允许多行列、区域合并，映射为 Beamer 的 columns 等结构|
|打印讲义|将多张幻灯片无缝拼接成 2×2 或 2×3 的大幅 HTML 页面，直接打印或导出为 PDF，用于制作纸质讲义|

# 四、系统功能需求

## 4\.1 文件操作

- **\.pptex 格式：**自定义压缩包格式，内含 JSON 结构化文档数据和资源文件，便于版本控制与交换

- 支持新建、打开、保存、另存为本地文件（通过 File System Access API，降级为上传/下载）

- 近期文件列表（IndexedDB 缓存）

## 4\.2 内容编辑

**组编辑模式（默认）：**

- 模块连续流式显示，自动按幻灯片高度分页，页间显示可拖拽分割线

- 支持粘贴完整 LaTeX 代码，实时 KaTeX 渲染

- 提供格式工具栏：粗体、斜体、下划线、颜色、字号、对齐、列表、公式插入

- 快捷键与 PPT 一致：Ctrl\+B/I/U、Ctrl\+M 插入行内公式等

- LaTeX 源码区（Monaco 编辑器）与可视化区双向实时同步

**页编辑模式：**

- 展示当前幻灯片的 Grid 布局网格，可拖拽列边框调整比例

- 支持拖拽内容块分配至不同 Grid 区域

- 右键菜单快速设置区域背景色、对齐方式

**内容保护：**分页点永远不可能切断 \\begin\{\.\.\.\} 环境；超长元素在放映时允许溢出/缩放，在打印时允许跨幻灯片自然延伸。

## 4\.3 样式与主题

- 全局主题预设（颜色、字体、默认列数）

- 模块可设置默认 Grid 布局，幻灯片可独立覆盖

- 模板库：预设"知识点""例题""解析"等模块模板，含默认源码骨架

## 4\.4 导出功能

- **放映版 HTML：**独立可播放的网页，支持全屏与键盘翻页

- **打印讲义 PDF：**通过浏览器打印接口，按 2×2 或 2×3 布局拼接幻灯片为大幅页面，输出矢量 PDF

- **LaTeX 源文件：**生成标准 Beamer 文档（保留 columns、block 等语义），也可生成 Article 文档（按模块转 \\section，去除帧结构），附带资源打包

## 4\.5 非功能性需求

- **性能：**50 页以上幻灯片流畅滚动，虚拟化渲染，增量更新

- **健壮性：**LaTeX 渲染错误时高亮源码行，不崩溃

- **离线可用：**PWA 支持

# 五、系统架构设计

本项目采用分层架构，核心逻辑与 UI/平台完全解耦，便于未来跨平台迁移。

## 5\.1 架构分层

**用户界面层（React）：**包含工具栏（Ribbon）、可视化编辑区（GroupEdit / PageEdit）、属性与源码面板（Monaco Editor），负责所有用户交互与可视化呈现。

**状态管理层（Zustand）：**轻量级跨组件状态共享，统一管理文档状态、编辑模式、选区等全局状态。

**核心逻辑层（纯 TypeScript）：**包含数据模型、段落解析与分页引擎、命令生成与样式映射、代码生成器、双向同步引擎、导出生成器。该层不包含任何 DOM 操作或平台 API，完全可跨环境复用。

**平台适配层（I/O \& 渲染）：**封装文件读写、PDF 导出等操作，提供统一接口。Web 端使用浏览器 API（JSZip、File System Access API、html\-to\-image），桌面端可替换为 Node\.js API。

## 5\.2 设计原则

- 核心逻辑与 UI 完全解耦，便于单元测试与跨平台迁移

- 单向数据流，状态变更可追溯

- 模块化设计，各层职责清晰

- 接口抽象，平台相关能力通过适配器注入

# 六、数据模型设计

## 6\.1 \.pptex 文件结构

\.pptex 本质为 ZIP 压缩包，内部结构如下：

```text
presentation.pptex
├── manifest.json          # 标题、主题、幻灯片尺寸、打印设置
├── modules/
│   ├── mod-001.json
│   └── mod-002.json
├── slides/
│   ├── slide-1.json
│   └── slide-2.json
└── assets/                # 图片等资源
```

## 6\.2 核心实体定义

**模块（Module）：**教学语义单元，包含完整 LaTeX 源码、默认布局配置及关联幻灯片列表。每个模块对应一个知识点、例题或解析等教学单元，可跨越多张幻灯片。

**幻灯片（Slide）：**放映最小单元，关联所属模块、内容段落范围、可选的 Grid 布局覆盖以及内容区域分配。

**Grid 布局（GridLayout）：**定义幻灯片的排版骨架，包含列配置、行配置和间距，采用 CSS Grid 规范描述。

**区域（Region）：**Grid 中的内容区域，通过网格坐标定位，并关联具体段落内容。

## 6\.3 段落解析机制

模块 source 按空行及 \\begin\{\.\.\.\} 环境边界分割为段落数组。分页仅允许在段落之间进行，保证 LaTeX 环境的完整性，避免出现环境被切断导致编译错误的情况。

# 七、用户界面设计

## 7\.1 主界面布局

主界面采用经典三栏布局，顶部为 Ribbon 工具栏，左侧为幻灯片大纲树，中部为可视化编辑区，右侧为属性面板与源码编辑器。

**左侧大纲面板：**可折叠幻灯片大纲，展示所有模块和幻灯片缩略图，支持拖拽排序。

**中部编辑主区域：**在组编辑与页编辑两种模式间切换，是用户的主要工作区。

**右侧面板：**包含属性设置和源码编辑器（Monaco Editor），可拖拽调整分栏宽度。

## 7\.2 组编辑视图

- 垂直连续滚动，模块所有幻灯片以分割线分隔

- 单击段落直接编辑，工具栏自动反映当前文本格式

- 分割线可拖拽手动调整分页，自动吸附到合法断点

## 7\.3 页编辑视图

- 仅显示单张幻灯片，背景显示 CSS Grid 参考线

- 可拖拽区域边框改变列宽

- 支持将段落块拖入不同 Grid 区域

- 右键菜单快速设置区域样式

## 7\.4 交互规范

- 所有格式化操作必须即时反映在 LaTeX 源码中

- 快捷键系统完全仿照 Office 套件（Ctrl\+B, Ctrl\+I, Ctrl\+U, Ctrl\+M 等）

- 公式块双击打开 LaTeX 源码编辑浮窗

# 八、核心算法设计

## 8\.1 自动分页引擎

1. 将模块源码解析为不可分段落数组

2. 使用 KaTeX 渲染每个段落，测量其实际高度（考虑幻灯片缩放）

3. 贪心累加段落高度，超出单页高度时，在当前段落后插入分页点

4. 超大段落单独成页，标记溢出属性

5. 手动拖拽分页线时，吸附到最近段落间隙

## 8\.2 双向同步引擎

**可视化 → 源码：**段落失焦时，从 DOM 重建该段落 LaTeX 字符串，更新模块 source 中对应段落，触发源码区刷新。

**源码 → 可视化：**源码变化时，重新解析段落数组，对比旧数组，仅重新渲染发生变化的段落，保留编辑焦点。

使用段落 ID 作为 React key，保证渲染稳定性，避免不必要的重绘。

## 8\.3 LaTeX 代码生成

**Beamer 生成器：**遍历幻灯片，按 Grid 生成 \\begin\{columns\} 等结构，插入段落内容，保留 block 等语义环境。

**Article 生成器：**以模块为 \\section，移除帧相关命令，转换 block 环境为 tcolorbox 等，适合打印讲义或学术论文。

**打印讲义模式：**生成拼接 HTML，通过浏览器打印输出 PDF，支持 2×2 或 2×3 布局。

# 九、技术栈选型

|层级|技术|用途|
|---|---|---|
|运行环境|现代浏览器 \(Chrome, Edge, Firefox\)|首期目标平台|
|前端框架|React 18\+|UI 构建|
|状态管理|Zustand|轻量、跨组件共享|
|渲染引擎|KaTeX|数学公式快速渲染|
|代码编辑器|Monaco Editor|LaTeX 源码编辑（懒加载）|
|富文本编辑|自定义 contenteditable \+ Slate\.js|实现类 PPT 的直观编辑|
|网格拖拽|react\-grid\-layout \(定制\)|Grid 可视化调整|
|ZIP 处理|JSZip|\.pptex 文件读写|
|文件 I/O|File System Access API|打开/保存本地文件|
|本地缓存|IndexedDB \(idb\-keyval\)|最近文件、草稿|
|PDF 导出|window\.print\(\) / html\-to\-image \+ jsPDF|打印与程序化导出|
|样式|Tailwind CSS|快速 UI 开发|
|构建工具|Vite|快速 HMR、打包|
|测试|Vitest \+ React Testing Library|单元测试与集成测试|

**后期桌面端 \(Electron\)：**可复用 90% 代码，替换文件 I/O 适配器，集成本地 LaTeX 编译器。

**移动端 \(React Native\)：**核心逻辑层可直接复用，UI 层重写。

# 十、项目开发计划

## 10\.1 阶段划分与里程碑

|阶段|时间|目标|交付物|
|---|---|---|---|
|阶段0：准备与验证|2 天|项目骨架搭建，依赖验证|可运行 Vite 项目|
|阶段1：数据模型与状态管理|3 天|类型定义，Zustand store，段落解析器|核心逻辑 \+ 单元测试|
|阶段2：文件处理|2 天|\.pptex 读写，文件打开保存|完整文件操作闭环|
|阶段3：渲染引擎|4 天|KaTeX 段落渲染，幻灯片预览，组编辑视图|只读可视化界面|
|阶段4：自动分页|3 天|分页计算、拖拽分页线|自动/手动分页功能|
|阶段5：源码编辑器集成|2 天|Monaco 集成，错误高亮|源码区可用|
|阶段6：双向同步与富文本编辑|7 天|段落可编辑，工具栏，快捷键，双向同步|核心 MVP 闭环|
|阶段7：页编辑与 Grid|4 天|页编辑视图，列宽拖拽，内容分配|完整编辑体验|
|阶段8：导出功能|5 天|HTML 放映、打印讲义 PDF、LaTeX 导出|全导出管道|
|阶段9：模板与样式|2 天|模块模板，主题系统|主题切换|
|阶段10：测试/优化/PWA|4 天|单元测试，虚拟滚动，PWA，错误处理|生产就绪|
|阶段11：部署|1 天|Vercel 部署，CI/CD|在线可访问|

总预估时间：39 天（单人全职），可根据团队并行缩短。

## 10\.2 测试策略

- **每阶段集成测试：**确保核心流程可用

- **单元测试：**覆盖核心逻辑（段落解析、分页、命令生成），覆盖率 \> 80%

- **端到端测试（可选）：**使用 Playwright 模拟用户操作

- **性能测试：**构造 50\+ 幻灯片文档测试渲染与滚动性能

- **平台兼容性测试：**Chrome、Edge、Firefox 最新版

# 十一、风险管理与对策

|风险|概率|影响|对策|
|---|---|---|---|
|富文本编辑与 LaTeX 映射不精确|中|高|以段落为最小同步单元，允许用户切换到源码视图微调，设计宽松的恢复策略|
|KaTeX 渲染部分 LaTeX 命令失败|中|中|对于不支持的宏，回退纯文本显示并提示；提供完整的 LaTeX 导出可选编译验证|
|Monaco 编辑器体积影响加载速度|中|低|动态导入、懒加载；非编辑状态不加载|
|浏览器 API 兼容性问题|低|高|对 File System Access API 提供降级方案；打印 API 成熟度高|
|分页引擎在极端内容下表现不佳|低|中|预留手动分页能力，允许超大块特殊标记溢出|

# 十二、后续演进与扩展

- **协同编辑：**引入 Yjs \+ WebSocket，实现多人实时协作

- **版本历史：**基于 \.pptex 的 JSON 结构，可集成 Git 或自动版本快照

- **智能模板推荐：**根据用户历史数据，推荐模块布局

- **一键发布到 Overleaf：**提供 OAuth 集成，直接将 \.tex 推送到项目

- **动画与叠加层：**支持 Beamer 的 \\pause、\\only 等命令的可视化编辑

- **桌面版 \(Electron\)：**利用 Node\.js 生态增强文件管理和本地 LaTeX 编译

- **移动版 \(React Native\)：**提供基础的查看与微调能力

---

本项目方案全面覆盖了 PPTeX 项目的背景、需求、设计、技术实现与实施计划，可作为开发团队的直接执行依据。项目的 Web 优先策略确保了快速迭代与用户覆盖，同时为未来跨平台奠定了坚实基础。

# 十三、附录：新手程序员分步执行指南

本附录将原计划的 11 个阶段拆解为新手可直接执行的具体步骤，每个阶段包含：任务拆解、可直接复制的 AI 提示词、以及测试验证方法。建议按顺序逐阶段完成，每阶段结束后跑通测试再进入下一阶段。

## 阶段 0：准备与验证（2 天）

**阶段目标：**搭建可运行的 Vite \+ React \+ TypeScript 项目骨架，验证核心依赖可正常安装使用。

### 具体步骤

1. 使用 Vite 创建 React \+ TypeScript 项目

2. 安装 Tailwind CSS 并配置

3. 安装 Zustand、KaTeX 等核心依赖并验证导入

4. 配置 ESLint、Prettier 等开发工具

5. 建立项目目录结构（components、store、core、utils、hooks）

### AI 提示词（直接复制使用）

```text
帮我用 Vite 创建一个 React + TypeScript 项目，完成以下配置：
1. 安装并配置 Tailwind CSS v3
2. 安装 zustand 状态管理库
3. 安装 katex 数学公式渲染库
4. 配置路径别名 @ 指向 src 目录
5. 创建以下目录结构：
   - src/components/
   - src/store/
   - src/core/
   - src/utils/
   - src/hooks/
   - src/types/
6. 写一个简单的测试页面，验证 KaTeX 能正常渲染公式
7. 给出每个文件的完整代码和配置步骤
```

### 测试验证方法

- 运行 `npm run dev`，浏览器能正常打开页面无报错

- 页面上能看到 KaTeX 渲染的数学公式（如 E = mc²）

- 浏览器控制台无红色报错

- 各目录已创建，路径别名导入正常工作

---

## 阶段 1：数据模型与状态管理（3 天）

**阶段目标：**完成所有 TypeScript 类型定义，实现 Zustand store，编写段落解析器，通过单元测试。

### 具体步骤

1. 定义 Module、Slide、GridLayout、Region、Document 等核心接口类型

2. 实现段落解析函数：将 LaTeX 源码按空行和环境边界分割为段落

3. 创建 Zustand store，包含文档状态、当前编辑模式、选中模块等

4. 实现基本的 store action：添加模块、删除模块、更新模块源码

5. 用 Vitest 为段落解析器编写单元测试

### AI 提示词（直接复制使用）

```text
基于以下数据模型，帮我用 TypeScript 编写完整的类型定义和段落解析器：

核心实体：
- Module: { id, type, source, baseGrid, slides[] }
- Slide: { id, moduleId, contentRange, gridOverride, regions[] }
- GridLayout: { columns[], rows[], gap }
- Region: { cells: [rowStart, colStart, rowEnd, colEnd], contentRef }
- Document: { manifest, modules, slides }

段落解析规则：
1. 将 LaTeX 源码按空行分割
2. 遇到 \begin{...} 时，必须与对应的 \end{...} 保持在同一段落
3. 每个段落生成唯一的 paragraphId
4. 返回段落数组，每段包含 id 和 content

另外创建一个 Zustand store，包含：
- document: Document 对象
- selectedModuleId: string | null
- editMode: group | page
- actions: addModule, updateModuleSource, deleteModule, setEditMode

用 Vitest 写段落解析器的单元测试，覆盖以下场景：
- 普通文本分段
- 包含 equation 环境不被切断
- 嵌套环境正确识别
- 空行处理
```

### 测试验证方法

- 运行 `npm run test`，所有单元测试通过

- 段落解析覆盖率：普通文本、单环境、嵌套环境均正确

- 在 React 组件中调用 store，能正常读取和修改状态

- TypeScript 类型检查无错误（`npx tsc --noEmit`）

---

## 阶段 2：文件处理（2 天）

**阶段目标：**实现 \.pptex 格式的读写，完成文件打开/保存的完整闭环。

### 具体步骤

1. 安装 JSZip 库

2. 实现序列化函数：将 Document 对象转为 JSON 并打包为 \.pptex ZIP 文件

3. 实现反序列化函数：解压 \.pptex 文件并重建 Document 对象

4. 封装 File System Access API（支持打开和保存本地文件）

5. 实现降级方案：不支持 API 时使用上传/下载

6. 用 IndexedDB 存储最近文件列表

### AI 提示词（直接复制使用）

```text
帮我实现 .pptex 文件格式的完整读写功能：

.pptex 是一个 ZIP 包，内部结构：
- manifest.json: { title, theme, slideWidth, slideHeight, printLayout }
- modules/mod-xxx.json: 每个模块一个 JSON 文件
- slides/slide-xxx.json: 每个幻灯片一个 JSON 文件
- assets/: 资源文件目录

需要实现：
1. serializeDocument(doc: Document): Promise<Blob>
   - 将 Document 对象序列化为 ZIP 并返回 Blob

2. deserializeDocument(blob: Blob): Promise<Document>
   - 解压 ZIP 并重建 Document 对象

3. useFileIO hook
   - openFile(): 打开文件选择器，读取并反序列化
   - saveFile(doc): 保存到本地（使用 File System Access API）
   - saveAsFile(doc): 另存为新文件
   - 降级方案：不支持 API 时用 <input type=file> 和 a.download

4. useRecentFiles hook（基于 idb-keyval）
   - addRecentFile(fileInfo)
   - getRecentFiles()
   - clearRecentFiles()

每个函数都要有完整的 TypeScript 类型定义和错误处理。
```

### 测试验证方法

- 创建一个测试文档，保存为 \.pptex 文件

- 重新打开该文件，内容与保存前完全一致

- 在 Chrome 和 Firefox 中分别测试（验证降级方案）

- 最近文件列表能正确记录和显示

- 损坏的 ZIP 文件能友好报错，不崩溃

---

## 阶段 3：渲染引擎（4 天）

**阶段目标：**实现 KaTeX 段落渲染、幻灯片预览组件、组编辑视图，完成只读可视化界面。

### 具体步骤

1. 封装 ParagraphRenderer 组件：输入 LaTeX 字符串，输出渲染后的 HTML

2. 创建 Slide 组件：按指定尺寸渲染一张幻灯片，支持 Grid 布局

3. 创建 GroupEditView 组件：垂直排列所有模块的幻灯片，显示分页分割线

4. 实现左侧幻灯片大纲缩略图

5. 添加主题样式系统，支持切换不同配色

6. 处理 KaTeX 渲染错误的降级显示

### AI 提示词（直接复制使用）

```text
帮我实现幻灯片渲染相关的 React 组件，使用 KaTeX 和 Tailwind CSS：

1. ParagraphRenderer 组件
   - Props: { latex: string }
   - 使用 katex.renderToString 渲染行内公式 $...$ 和块级公式 $$...$$
   - 渲染错误时显示红色边框和错误信息，不崩溃
   - 支持普通文本、加粗、斜体等基础格式

2. Slide 组件
   - Props: { slide: Slide, module: Module, scale?: number }
   - 固定宽高比（默认 16:9，1280x720px）
   - 根据 GridLayout 渲染 CSS Grid 布局
   - 将段落内容分配到对应的 Region 中
   - 支持 scale 缩放属性

3. GroupEditView 组件
   - Props: { document: Document }
   - 垂直滚动，按模块顺序渲染所有幻灯片
   - 幻灯片之间显示分割线（虚线）
   - 每张幻灯片有轻微阴影和圆角，模拟纸张效果

4. SlideOutline 组件
   - 左侧缩略图列表，显示所有幻灯片的缩小预览
   - 点击跳转到对应位置
   - 当前选中的高亮显示

5. 主题系统
   - 创建 ThemeContext，提供 primaryColor、fontFamily 等
   - 至少实现 default 和 dark 两个主题
   - 幻灯片背景色、文字颜色跟随主题

所有组件使用 TypeScript，函数式组件 + hooks 风格。
```

### 测试验证方法

- 加载一个包含多个模块的测试文档，所有段落能正常渲染

- 包含复杂公式的段落渲染正确，无错位

- 故意输入错误 LaTeX 语法，页面不崩溃，显示错误提示

- 调整窗口大小，幻灯片按比例缩放，布局不乱

- 切换主题，颜色正确变化

- 左侧大纲点击能正确滚动到对应幻灯片

---

## 阶段 4：自动分页（3 天）

**阶段目标：**实现自动分页计算引擎，支持拖拽调整分页线。

### 具体步骤

1. 实现段落高度测量函数：离屏渲染后获取实际像素高度

2. 编写贪心分页算法：累加段落高度，超出则分页

3. 处理超大段落：单独成页，标记 overflow 属性

4. 实现分页线拖拽交互：鼠标按下拖动，松开吸附到最近段落间隙

5. 手动分页优先级高于自动分页，保存手动分页位置

6. 模块内容变化时自动重新计算分页

### AI 提示词（直接复制使用）

```text
帮我实现自动分页引擎和拖拽分页线功能：

1. 分页算法函数
function paginateModule(module: Module, slideHeight: number, theme: Theme): Slide[] {
  // 输入：模块、单页高度、主题
  // 输出：生成的幻灯片数组

  步骤：
  a. 将 module.source 解析为段落数组（复用已有的 parseParagraphs）
  b. 离屏渲染每个段落，测量实际高度（创建隐藏 div，渲染后 getBoundingClientRect）
  c. 贪心累加段落高度，超过 slideHeight 就分页
  d. 超大段落（单段超过一页）单独成页，标记 isOverflow: true
  e. 每页记录 contentRange: { startParagraphIndex, endParagraphIndex }
}

2. 手动分页支持
   - 每个模块保存 manualBreaks: number[]（段落索引数组）
   - 计算分页时，手动断点优先于自动断点
   - 手动断点之间的内容仍用自动分页

3. PageBreakHandle 组件
   - 渲染在两张幻灯片之间的分割线位置
   - 鼠标悬停显示可拖拽提示
   - 拖拽时显示一条指示线跟随鼠标
   - 松开时吸附到最近的段落间隙
   - onDrop(paragraphIndex) 回调

4. usePagination hook
   - 输入：module, slideHeight, manualBreaks
   - 输出：slides, 以及更新 manualBreaks 的函数
   - 段落内容变化时自动重新计算

注意：测量高度时要考虑 padding、margin、字体大小等因素。
```

### 测试验证方法

- 输入不同长度的内容，验证分页数量合理

- 包含超长段落时，正确标记为 overflow

- 拖拽分页线，松开后正确吸附到段落间隙

- 手动分页后，修改内容，手动断点保持不变

- 快速连续修改内容，不会出现分页计算错误或死循环

- 分页永远不会切断 \\begin\{equation\} 等环境

---

## 阶段 5：源码编辑器集成（2 天）

**阶段目标：**集成 Monaco Editor 作为 LaTeX 源码区，支持语法高亮和错误提示。

### 具体步骤

1. 安装 @monaco\-editor/react，配置懒加载

2. 配置 LaTeX 语法高亮（使用 monaco 的 latex 语言或自定义）

3. 实现源码区与 store 的双向绑定

4. KaTeX 渲染错误时，在对应行号显示错误标记

5. 右侧面板可拖拽调整宽度，源码区自适应

6. 非编辑状态下不加载 Monaco，减少首屏体积

### AI 提示词（直接复制使用）

```text
帮我集成 Monaco Editor 作为 LaTeX 源码编辑器：

技术栈：@monaco-editor/react + TypeScript

1. SourceEditor 组件
   - 懒加载 Monaco（使用 React.lazy 或动态 import）
   - Props: { value: string; onChange: (value: string) => void; errors?: LineError[] }
   - 配置：显示行号、自动换行、等宽字体
   - 编辑器高度自适应父容器

2. 错误高亮
   interface LineError {
     lineNumber: number;
     message: string;
   }
   - 使用 monaco 的 deltaDecorations 在错误行添加红色波浪线
   - 鼠标悬停错误行显示错误信息 tooltip
   - 行号区域显示红色标记

3. 右侧面板 ResizablePanel
   - 可拖拽左边框调整宽度
   - 宽度范围：200px ~ 80% 窗口宽度
   - 双击边框折叠/展开
   - 宽度保存到 localStorage

4. 性能优化
   - onChange 使用防抖（200ms），避免每次按键都触发重渲染
   - 源码很长时启用虚拟滚动
   - 首屏不加载 Monaco，用户点击"源码"标签时才加载

给出完整的组件代码和使用示例。
```

### 测试验证方法

- 打开源码面板，Monaco 正常加载，有语法高亮

- 在源码区输入内容，可视化区域同步更新

- 在可视化区编辑内容，源码区同步更新

- 故意制造 LaTeX 语法错误，对应行显示红色标记

- 拖拽面板边框，宽度正确调整，编辑器自适应

- 刷新页面后，面板宽度保持上次设置

---

## 阶段 6：双向同步与富文本编辑（7 天）—— 核心 MVP 阶段

**阶段目标：**实现段落可编辑、格式化工具栏、快捷键、可视化与源码双向同步，完成核心 MVP 闭环。

### 具体步骤

1. 基于 contenteditable 实现可编辑段落组件

2. 实现格式化工具栏：加粗、斜体、下划线、颜色、字号、对齐、列表

3. 实现快捷键系统：Ctrl\+B/I/U、Ctrl\+M 插入公式等

4. 可视化 → 源码：段落失焦时，从 DOM 重建 LaTeX 字符串

5. 源码 → 可视化：源码变化时，差异更新，保留编辑焦点

6. 公式块双击打开编辑浮窗，支持修改 LaTeX 代码

7. 实现插入公式、插入列表、插入图片等命令

### AI 提示词 1：富文本编辑器基础

```text
帮我实现一个基于 contenteditable 的富文本段落编辑器，要求能与 LaTeX 双向转换：

1. EditableParagraph 组件
   - Props: { initialLatex: string; onBlur: (latex: string) => void }
   - 点击进入编辑状态，显示光标
   - 失焦时触发 onBlur，传出转换后的 LaTeX 源码
   - 支持的格式：加粗(\textbf)、斜体(\textit)、下划线(\underline)
   - 支持行内公式 $...$ 和块级公式 $$...$$（用 KaTeX 渲染，不可编辑，双击弹出编辑框）

2. HTML → LaTeX 转换函数 htmlToLatex(element: HTMLElement): string
   - <b> → \textbf{...}
   - <i> → \textit{...}
   - <u> → \underline{...}
   - .katex 元素 → 提取原始 LaTeX 源码，用 $ 包裹
   - <ul>/<ol> → itemize/enumerate 环境
   - 普通文本直接保留

3. LaTeX → HTML 转换函数 latexToHtml(latex: string): string
   - 反向转换，用于初始化和源码同步
   - 解析简单的 LaTeX 命令，生成对应的 HTML 标签
   - 公式部分调用 KaTeX 渲染

4. Toolbar 工具栏组件
   - 加粗、斜体、下划线、对齐方式按钮
   - 插入行内公式、插入块级公式按钮
   - 当前选区格式时按钮高亮（如选中粗体文字则 B 按钮高亮）
   - 跟随选区浮动（选中文字时在上方显示）

注意：只处理简单的 LaTeX 命令，复杂环境直接显示为源码文本。优先保证稳定性。
```

### AI 提示词 2：双向同步引擎

```text
帮我设计并实现可视化编辑与 LaTeX 源码的双向同步机制：

背景：
- 左侧是可视化编辑器（多个可编辑段落）
- 右侧是 Monaco 源码编辑器
- 底层数据是 Module.source（完整 LaTeX 字符串）

需求：
1. 源码 → 可视化（Source to Visual）
   - 用户在源码区修改后，更新可视化区域
   - 使用 diff 算法，只重新渲染变化的段落
   - 保留用户当前的编辑焦点（正在编辑的段落不重建）
   - 防抖 300ms

2. 可视化 → 源码（Visual to Source）
   - 用户编辑段落并失焦后，更新源码对应位置
   - 精确替换该段落对应的源码部分，不影响其他段落
   - 保持源码的缩进和格式

3. 段落映射机制
   - 每个段落有唯一 ID
   - 维护 paragraphId → sourceRange { start, end } 的映射
   - 源码变化时重新计算映射
   - 段落变化时只更新对应 range 的源码

4. useSyncEngine hook
   - 输入：moduleSource, setModuleSource
   - 输出：paragraphs, updateParagraph, isSyncing
   - 处理冲突：两边同时修改时，以最后修改的为准

请给出核心的数据结构和算法伪代码，以及关键的 React hook 实现。
```

### AI 提示词 3：快捷键系统

```text
帮我实现一套仿 Office 的快捷键系统：

要求：
1. 全局快捷键（不聚焦输入框也生效）
   - Ctrl + S: 保存文件
   - Ctrl + Z / Ctrl + Y: 撤销/重做
   - Ctrl + M: 在光标处插入行内公式
   - Ctrl + Shift + M: 插入块级公式
   - Alt + 数字 1~6: 切换到对应幻灯片

2. 编辑区快捷键（聚焦 contenteditable 时生效）
   - Ctrl + B: 加粗 / 取消加粗
   - Ctrl + I: 斜体 / 取消斜体
   - Ctrl + U: 下划线 / 取消下划线
   - Ctrl + L / C / R: 左对齐 / 居中 / 右对齐
   - Tab / Shift + Tab: 列表缩进 / 反缩进
   - Enter: 新段落 / 新列表项

3. 实现方式
   - 创建 useHotkeys hook
   - 支持作用域（全局 / 编辑区）
   - 阻止浏览器默认行为（如 Ctrl+S 不弹出保存网页）
   - 可配置、可扩展，方便后续添加新快捷键

4. 命令模式设计
   - 所有操作封装为 Command 对象
   - 支持撤销栈（undo/redo）
   - Command 接口：{ execute(), undo(), name }
   - 最大撤销步数：50 步

给出完整的 hook 实现和使用示例。
```

### 测试验证方法

- 点击段落可直接编辑文字，格式工具栏正常工作

- Ctrl\+B/I/U 等快捷键生效，与工具栏按钮一致

- 可视化修改后，右侧源码同步更新对应部分

- 源码修改后，左侧可视化同步更新，光标位置不丢失

- 快速交替修改两边，不会出现数据不一致或死循环

- 撤销/重做功能正常，能回退多步操作

- 公式块双击可弹出编辑框，修改后两边同步

---

## 阶段 7：页编辑与 Grid（4 天）

**阶段目标：**实现页编辑视图，支持 Grid 列宽拖拽、内容块拖放分配。

### 具体步骤

1. 实现组编辑 / 页编辑模式切换

2. 页编辑视图：单张幻灯片放大显示，显示 Grid 参考线

3. 列边框拖拽：拖动调整 Grid 列宽比例

4. 内容块拖放：从侧边栏拖拽段落到不同 Grid 区域

5. 右键菜单：区域背景色、对齐方式、删除区域

6. Grid 修改保存到 slide\.gridOverride，不影响模块默认布局

### AI 提示词（直接复制使用）

```text
帮我实现幻灯片的 Grid 页编辑功能：

背景：
- 每张幻灯片有 GridLayout: { columns: string[], rows: string[], gap: string }
- 每个 Region 占据 Grid 的若干单元格，包含一个段落
- 页编辑模式下可以调整列宽、拖放内容块

需要实现：

1. PageEditView 组件
   - 单张幻灯片居中放大显示
   - 背景显示半透明的 Grid 参考线
   - 每个 Region 有虚线边框，hover 时高亮
   - 顶部工具栏：添加列、删除列、重置布局

2. 列宽拖拽
   - 两列之间的分隔线可拖动
   - 拖动时显示实时的列宽比例
   - 只调整相邻两列的比例，其他列不变
   - 最小列宽：10%

3. 内容拖放
   - 左侧显示该幻灯片的所有段落列表
   - 可拖拽段落到 Grid 的任意区域
   - 拖入已有内容的区域则交换位置
   - 拖出 Grid 则移除该区域的内容

4. 右键菜单
   - 在 Region 上右键弹出菜单
   - 选项：背景色（预设 6 种）、垂直对齐（上/中/下）、删除区域
   - 点击其他地方自动关闭

5. Grid 修改持久化
   - 修改保存到 slide.gridOverride 和 slide.regions
   - 提供"重置为模块默认"按钮

使用 react-dnd 或原生 HTML5 drag API 实现，给出完整组件代码。
```

### 测试验证方法

- 切换到页编辑模式，单张幻灯片正确显示

- 拖动列边框，列宽比例实时变化，松开后保存

- 从侧边栏拖放段落到 Grid 区域，内容正确分配

- 两个区域的内容可以互相拖拽交换

- 右键菜单正常弹出，背景色和对齐设置生效

- 切回组编辑再切回来，Grid 修改保留

- 重置布局按钮能恢复模块默认 Grid

---

## 阶段 8：导出功能（5 天）

**阶段目标：**实现三种导出：放映版 HTML、打印讲义 PDF、LaTeX 源文件。

### 具体步骤

1. 实现 Beamer 代码生成器：遍历幻灯片生成标准 \.tex 文件

2. 实现 Article 代码生成器：按模块生成论文格式 \.tex 文件

3. 实现放映版 HTML 导出：单文件独立可播放网页

4. 实现打印讲义：2×2 / 2×3 布局拼接，浏览器打印导出 PDF

5. 导出资源打包：图片等资源一并打包到 ZIP

6. 导出进度提示和错误处理

### AI 提示词 1：LaTeX 代码生成

```text
帮我实现两个 LaTeX 代码生成器：Beamer 模式和 Article 模式。

输入：Document 对象（包含 modules、slides、manifest）
输出：完整的 .tex 源码字符串

1. BeamerGenerator
   - 生成标准的 Beamer 文档
   - 每个 Slide 对应一个 \begin{frame}
   - Grid 布局转换为 \begin{columns}...\column{...}
   - 段落内容直接输出 LaTeX 源码
   - block 环境保留（定理、定义等）
   - 导言区包含常用包：amsmath, amssymb, graphicx, ctex

2. ArticleGenerator
   - 生成 article 文档类
   - 每个 Module 对应一个 \section
   - 移除 frame 结构，内容连续输出
   - 可选：用 tcolorbox 包裹原 block 环境
   - 适合打印讲义或导出论文

3. 公共工具
   - escapeLatex(): 特殊字符转义
   - generatePreamble(theme): 生成导言区
   - gridToColumns(gridLayout): Grid 转 columns 环境

4. 导出函数
   - exportBeamer(doc): string
   - exportArticle(doc): string
   - exportLatexBundle(doc): Blob（ZIP 包，包含 .tex 和 assets）

写出完整的生成器类，带 TypeScript 类型。
```

### AI 提示词 2：HTML 放映与 PDF 导出

```text
帮我实现 HTML 放映版导出和打印讲义 PDF 导出：

1. PresentationHTMLExporter
   功能：生成单个独立 HTML 文件，可直接打开放映
   - 所有幻灯片渲染到一个 HTML 中，默认隐藏，只显示当前页
   - 键盘控制：左右箭头翻页，F 全屏，Esc 退出
   - 包含页码和进度条
   - 所有 CSS 内联，图片转 base64，确保单文件可离线使用
   - 导出函数 exportPresentationHTML(doc): Blob

2. HandoutPrintExporter
   功能：生成打印讲义页面，支持 2x2 和 2x3 布局
   - 创建一个新的窗口或 iframe
   - 将多张幻灯片缩小后排列到 A4 纸上
   - 布局选项：2x2（每页4张）、2x3（每页6张）
   - 每页幻灯片下方可选显示备注
   - 使用 CSS @media print 控制打印样式
   - 调用 window.print() 触发打印/导出 PDF

3. 导出对话框组件 ExportDialog
   - 三个选项卡：放映 HTML / 打印讲义 PDF / LaTeX 源码
   - 打印讲义可选布局：2×2 / 2×3
   - LaTeX 可选：Beamer / Article
   - 导出按钮 + 进度提示
   - 导出完成后自动下载

注意：打印 PDF 依赖浏览器原生打印功能，不需要额外的 PDF 库。
```

### 测试验证方法

- 导出 Beamer \.tex 文件，在 Overleaf 中能成功编译

- 导出 Article \.tex 文件，格式正确，无帧结构残留

- 导出放映 HTML，双击打开能正常放映，键盘翻页正常

- 放映 HTML 断网也能正常使用（单文件包含所有资源）

- 打印讲义 2×2 和 2×3 布局正确，幻灯片比例不变形

- 打印预览中看到的效果与实际导出 PDF 一致

- 包含图片的文档导出后，图片正常显示不丢失

---

## 阶段 9：模板与样式（2 天）

**阶段目标：**实现模块模板库和全局主题系统。

### 具体步骤

1. 预设模块模板：知识点讲解、例题、解析、练习、总结

2. 每个模板包含默认源码骨架和 Grid 布局

3. 实现模板选择面板，点击插入新模块

4. 完善主题系统：至少 3 套预设主题（经典、简约、暗色）

5. 主题自定义：主色、字体、圆角等参数调整

6. 主题保存为 \.json 可导入导出

### AI 提示词（直接复制使用）

```text
帮我实现模块模板库和主题系统：

1. 模块模板定义
interface ModuleTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultType: knowledge | example | exercise | solution;
  defaultSource: string; // 预置的 LaTeX 源码骨架
  defaultGrid: GridLayout;
}

预设 5 个模板：
- 知识点讲解：标题 + 正文 + 公式示例，单列布局
- 例题：题目编号 + 题目内容，左题右图双列布局
- 解析：步骤编号 + 推导过程，单列布局
- 课堂练习：多道小题，两列布局
- 章节总结：要点列表 + 关键公式

2. TemplateGallery 组件
   - 网格展示所有模板卡片（图标+名称+描述）
   - 点击选中，再点击"插入"添加新模块
   - 支持搜索过滤

3. 主题系统增强
interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  slide: {
    borderRadius: string;
    shadow: string;
  };
}

预设 3 套主题：
- classic: 蓝白经典，学术风
- minimal: 极简灰白，现代感
- dark: 深色主题，护眼

4. ThemeEditor 侧边面板
   - 颜色选择器调整各色值
   - 字体下拉选择
   - 实时预览效果
   - 导出主题 JSON / 导入主题 JSON

写出完整的类型定义、预设数据和组件。
```

### 测试验证方法

- 从模板库插入模块，预置内容和布局正确

- 5 个模板都能正常插入和渲染

- 切换 3 套预设主题，颜色字体正确变化

- 自定义修改主题参数，实时预览生效

- 导出主题 JSON，再导入后效果一致

- 主题切换不影响文档内容数据

---

## 阶段 10：测试、优化与 PWA（4 天）

**阶段目标：**性能优化、虚拟滚动、完善测试、PWA 支持，达到生产就绪。

### 具体步骤

1. 实现虚拟滚动：50\+ 幻灯片流畅滚动

2. 性能优化：分页计算防抖、渲染增量更新

3. 完善单元测试：核心逻辑覆盖率 \> 80%

4. 错误边界：React Error Boundary 包裹，局部崩溃不影响整体

5. 配置 PWA：Service Worker、离线缓存、安装到桌面

6. 无障碍优化：键盘导航、语义化标签、对比度

### AI 提示词（直接复制使用）

```text
帮我完成性能优化和 PWA 配置：

1. 虚拟滚动 VirtualSlidesList
   - 场景：组编辑视图，50+ 张幻灯片垂直滚动
   - 只渲染可视区域内的幻灯片 + 少量缓冲
   - 使用 react-window 或自定义实现
   - 每张幻灯片高度已知（固定比例），用定高虚拟列表
   - 滚动流畅度目标：60fps

2. 性能优化清单
   - 分页计算：useMemo 缓存，依赖变化才重算
   - 段落渲染：React.memo 包裹，props 不变不重渲染
   - 大文档首次加载：增量渲染，先显示前 10 页
   - 源码编辑防抖：500ms 延迟后才触发可视化更新
   - 使用 React DevTools Profiler 定位性能瓶颈

3. 错误边界
   - 创建 SlideErrorBoundary 组件
   - 单张幻灯片渲染失败时显示占位错误提示
   - 不影响其他幻灯片和整体应用
   - 提供"查看源码"降级选项

4. PWA 配置（Vite + vite-plugin-pwa）
   - 配置 manifest.json：名称、图标、主题色
   - Service Worker：缓存静态资源和 API
   - 离线可用：断网时仍能打开和编辑本地文件
   - 安装提示：满足条件时提示"添加到桌面"
   - 更新检测：新版本时提示刷新

5. 单元测试补充
   - 段落解析：覆盖率 100%
   - 分页算法：各种边界情况测试
   - LaTeX 生成器：输出快照测试
   - Store action：状态变更测试
   - 目标：核心逻辑（core 目录）覆盖率 > 80%

给出具体的代码实现和配置示例。
```

### 测试验证方法

- 加载 100 页测试文档，滚动流畅无明显卡顿

- 打开 Performance 面板，滚动时 FPS 保持在 50 以上

- 故意让某个幻灯片渲染出错，应用不白屏，只该页显示错误

- 断网后刷新页面，应用仍能正常打开（PWA 生效）

- 运行 `npm run test -- --coverage`，核心逻辑覆盖率 \> 80%

- 纯键盘操作可以完成主要功能（Tab 导航、Enter 确认）

---

## 阶段 11：部署（1 天）

**阶段目标：**配置 CI/CD，部署到 Vercel 或其他平台，实现在线可访问。

### 具体步骤

1. 配置 Vercel 自动部署：main 分支推送自动构建

2. 配置 GitHub Actions：PR 自动运行测试和构建检查

3. 配置环境变量和构建参数

4. 设置自定义域名（可选）

5. 编写 README：项目介绍、快速开始、开发指南

6. 首版发布，收集用户反馈

### AI 提示词（直接复制使用）

```text
帮我配置项目的 CI/CD 和部署：

1. Vercel 部署配置（vercel.json）
   - 构建命令：npm run build
   - 输出目录：dist
   - 环境变量：NODE_ENV=production
   - 重写规则：SPA  fallback 到 index.html

2. GitHub Actions 工作流 .github/workflows/ci.yml
   - 触发：push 到 main、所有 PR
   - 步骤：
     a. checkout 代码
     b. setup node 20
     c. npm ci 安装依赖
     d. npm run lint 代码检查
     e. npm run test 运行测试
     f. npm run build 构建验证
   - 失败时在 PR 显示红叉

3. README.md 编写
   - 项目简介和特性列表
   - 核心价值主张一句话
   - 快速开始：安装、运行、构建
   - 技术栈说明
   - 开发阶段路线图
   - 贡献指南（可选）
   - License

4. 版本发布流程
   - 使用 semantic-release 自动生成版本号和 changelog
   - 打 tag 自动发布 GitHub Release
   - 生产环境和预览环境分离（PR 自动生成预览链接）

给出所有配置文件的完整内容。
```

### 测试验证方法

- 推送代码到 main 分支，Vercel 自动部署成功

- 访问线上地址，应用正常加载和使用

- 提交 PR，CI 自动运行测试，结果显示在 PR 页面

- README 内容完整，新人按照步骤能跑起来项目

- 移动端浏览器也能正常打开和浏览（只读）

---

## 新手学习路径建议

如果你是前端新手，建议按照以下顺序补充前置知识，每个知识点花 1\-2 天学习后再进入对应开发阶段。

|进入阶段前|需要掌握的知识|推荐学习重点|
|---|---|---|
|阶段 0|React 基础 \+ TypeScript 入门|函数组件、Hooks、Props、接口类型|
|阶段 1|TypeScript 进阶 \+ 状态管理|泛型、联合类型、Zustand 核心概念|
|阶段 3|CSS 布局 \+ Tailwind|Flex、Grid、Tailwind 常用类名|
|阶段 6|DOM 操作 \+ 事件处理|contenteditable、Selection API、拖拽事件|
|阶段 8|浏览器 API|Blob、File API、window\.print、URL\.createObjectURL|
|阶段 10|性能优化 \+ 测试|React\.memo、useMemo、Vitest 基础用法|

### 遇到问题时的 AI 提问模板

当某个功能实现遇到困难时，按以下格式向 AI 提问，能获得更精准的帮助：

```text
【问题描述】我在实现 XX 功能时遇到了 YY 问题
【相关代码】（粘贴相关的代码片段）
【报错信息】（粘贴控制台的完整报错）
【预期行为】我期望的效果是...
【实际行为】实际发生的是...
【已尝试】我已经试过了 XX 方法，不管用
【项目上下文】使用的技术栈是 React 18 + TypeScript + Zustand

请帮我分析原因并给出修复方案。
```

按照这个结构提问，AI 能快速定位问题，减少来回沟通的时间。

> （注：部分内容可能由 AI 生成）
