---
title: TPY / AI ART LAB 首页交接文档
status: active
created: 2026-05-30
project_root: C:\Users\acer\Desktop\个站
---

> 2026-06-03 更新提示：本文件保留为历史交接记录。当前源码目录已经整理过，最新接手入口请先读 `README.md`，工程架构请以 `docs/ENGINEERING.md` 为准，两个 demo 并入方案请以 `docs/plans/2026-06-03-demo-integration-plan.md` 为准。

# TPY / AI ART LAB 首页交接文档

这份文档给后续接手的 agent 使用，记录当前项目从零搭建到交互增强后的结构、设计目标、实现细节、运行方式、验证记录和注意事项。

## 1. 项目概览

项目名称：`tpy-ai-art-lab`

项目路径：`C:\Users\acer\Desktop\个站`

技术栈：

- Vite
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- lucide-react
- Canvas 2D 粒子

项目定位：

- 不是普通简历站。
- 首页首屏是一个“AI 艺术实验室 + 数字雕塑展厅”风格的 portfolio hero。
- 视觉基调是黑、灰、白极简，红色只作为激活态和交互反馈色。
- 当前只实现首页 hero 和第二屏占位模块，没有后端、数据库、登录、鉴权。

核心体验：

- 默认状态是冷色黑白雕塑展厅。
- 鼠标靠近右侧雕塑时进入 active 状态。
- active 状态下出现红色粒子、HUD 红色边框、雕塑红色 drop-shadow、鼠标红色发光圆环。
- 点击 `ENTER LAB` 后出现全屏红色扫描线覆盖层和 `SYSTEM ACTIVATED` 文案，约 800ms 后滚动到第二屏。

## 2. 当前目录结构

```text
.
├─ AGENT_HANDOFF.md
├─ index.html
├─ package.json
├─ package-lock.json
├─ postcss.config.js
├─ tailwind.config.ts
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ public/
│  └─ david.png
├─ src/
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ styles.css
│  ├─ vite-env.d.ts
│  └─ components/
│     ├─ CursorGlow.tsx
│     ├─ Hero.tsx
│     ├─ HudCard.tsx
│     ├─ Navbar.tsx
│     └─ ParticleField.tsx
├─ c参考图片/
│  └─ 原始参考图若干
├─ dist/
│  └─ build 输出
├─ node_modules/
├─ .tools/
│  └─ 临时 npm CLI，已在 .gitignore 忽略
└─ qa-screenshots/
   └─ 验收截图，已在 .gitignore 忽略
```

`.gitignore` 当前忽略：

```text
node_modules
dist
.tools
qa-screenshots
*.tsbuildinfo
.env
.env.*
*.local
```

## 3. 运行方式

标准环境下：

```bash
npm install
npm run dev
```

开发地址：

```text
http://localhost:5173/
```

生产构建：

```bash
npm run build
```

当前 `package.json` 脚本：

```json
{
  "dev": "vite --host 0.0.0.0",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview --host 0.0.0.0"
}
```

本机环境注意事项：

- 之前系统 PATH 里的 `node.exe` 会报 `Access is denied`。
- `npm` 和 `git` 也曾经不在 PATH 中。
- 已使用 Codex 桌面自带 Node 运行过项目。
- 如果普通 `npm` 不可用，可以用下面这种方式临时运行：

```powershell
$env:PATH = 'C:\Users\acer\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
& 'C:\Users\acer\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.tools\npm-cli\package\bin\npm-cli.js' run dev -- --port 5173
```

构建同理：

```powershell
$env:PATH = 'C:\Users\acer\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
& 'C:\Users\acer\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.tools\npm-cli\package\bin\npm-cli.js' run build
```

如果后续 agent 所在环境有正常 Node/npm，直接使用标准命令即可。

## 4. 设计目标和视觉规则

用户原始目标：

- 做一个“TPY / AI ART LAB”的首页首屏。
- 风格为黑灰白极简，红色作为交互激活色。
- 整体感觉像 AI 艺术实验室 + 数字雕塑展厅。
- 不要做成普通简历站。

当前实现遵守的视觉方向：

- 首页 hero 高度为 `100vh`。
- 黑色背景叠加低透明网格和少量白色粒子。
- 左侧是巨大标题和进入按钮。
- 右侧是数字雕塑主视觉。
- 红色只在 hover active、HUD、粒子、转场里出现。
- UI 元素保持实验室 HUD 风格，细线、玻璃拟态、低亮度。

主视觉资产：

```text
public/david.png
```

来源：

```text
c参考图片/ChatGPT Image 2026年5月29日 21_52_35.png
```

当前 `public/david.png` 是从参考图复制而来，作为临时主视觉。

## 5. 组件职责

### 5.1 `src/App.tsx`

职责：

- 挂载首页 `Hero`。
- 渲染第二屏占位区。

第二屏模块：

- About
- Tools Lab
- Projects
- Resume
- Contact

当前第二屏只是占位，不包含真实内容路由。

### 5.2 `src/components/Hero.tsx`

职责：

- 首页 hero 主逻辑。
- 管理鼠标位置。
- 管理雕塑 active 状态。
- 管理雕塑视差 motion values。
- 管理 `ENTER LAB` 点击转场。
- 组合 `Navbar`、`CursorGlow`、`ParticleField`、`HudCard`。

核心状态：

```ts
const [mouse, setMouse] = useState<MousePoint>(...)
const [nearSculpture, setNearSculpture] = useState(false)
const [transitioning, setTransitioning] = useState(false)
```

性能设计：

- 鼠标移动通过 `requestAnimationFrame` 节流。
- 不在每次 `pointermove` 中读取布局。
- 雕塑区域的命中范围用 `ResizeObserver`、`resize`、`scroll` 更新缓存。
- 鼠标移动时只和缓存后的 bounds 做数值比较。

雕塑 active 命中逻辑：

- `pointerenter` / `pointerleave` 会直接更新 active。
- 另外还有缓存 bounds 的 hit test 兜底，保证自动化和真实鼠标移动都能触发。

视差逻辑：

- 根据鼠标相对屏幕中心位置计算。
- 使用 Framer Motion 的 `useMotionValue` + `useSpring`。
- 当前幅度较小：
  - `translateX`: 约 `-9px` 到 `9px`
  - `translateY`: 约 `-7px` 到 `7px`
  - `rotateY`: 约 `-3.5deg` 到 `3.5deg`
  - `rotateX`: 约 `-3deg` 到 `3deg`

点击转场：

```ts
const enterLab = () => {
  setTransitioning(true)
  window.setTimeout(() => {
    const nextSectionTop = document.getElementById('lab-sections')?.offsetTop ?? window.innerHeight
    window.scrollTo({ top: nextSectionTop, behavior: 'auto' })
  }, 800)
  window.setTimeout(() => setTransitioning(false), 1320)
}
```

注意：

- 滚动使用 `behavior: 'auto'`，因为红色覆盖层会遮住跳转感。
- 之前用 `scrollIntoView({ behavior: 'smooth' })` 时自动化验收里滚动位置不够确定，所以改成了 800ms 后直接滚到第二屏。

### 5.3 `src/components/CursorGlow.tsx`

职责：

- 显示跟随鼠标的光点。
- 默认白色半透明。
- active 时变成红色发光圆环。

实现方式：

- 位置由 Framer Motion `animate` 控制。
- 颜色、边框、阴影由 CSS class 控制，避免 Framer 字符串动画在部分检查中不同步。
- 桌面显示，移动端隐藏：

```tsx
className="... hidden ... md:block"
```

相关 CSS：

```css
.cursor-glow-idle
.cursor-glow-active
```

### 5.4 `src/components/ParticleField.tsx`

职责：

- 全屏 canvas 粒子层。
- 默认绘制少量白色粒子。
- active 时绘制红色粒子流。

实现方式：

- Canvas 2D。
- `requestAnimationFrame` 驱动。
- `active` 和 `mouse` 存入 ref，避免动画循环依赖 React 重渲染。
- resize 时重新计算 canvas 尺寸和粒子数量。

性能控制：

- 默认白色粒子约 56 个。
- active 红色粒子约 86 个。
- 移动端或低动态偏好下关闭红色复杂粒子，白色粒子降到约 24 个。

移动端/低动态判断：

```ts
window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches
```

### 5.5 `src/components/HudCard.tsx`

职责：

- 雕塑旁 HUD 玻璃卡片。
- active 时边框和部分数据条变红。

当前三张卡片：

- POINT CLOUD 106,842
- REACTIVITY 87%
- DATA FLOW STREAMING

样式特点：

- 半透明黑底。
- backdrop blur。
- 细边框。
- active 红色边框和红色阴影。
- 移动端缩小 `scale-75`，桌面恢复 `sm:scale-100`。

### 5.6 `src/components/Navbar.tsx`

职责：

- 顶部固定导航。

内容：

- 左侧 logo：`TPY / AI ART LAB`
- 中间导航：关于我、工具实验室、项目、简历、联系我
- 右侧：`INFO`

移动端：

- 中间导航隐藏。
- 左侧 logo 和右侧 INFO 保留。

## 6. 关键样式文件

主样式文件：

```text
src/styles.css
```

包含：

- Tailwind directives。
- 全局字体和背景。
- 选中文本颜色。
- 网格背景 `.grid-noise`。
- 扫描线遮罩 `.scanline-mask`。
- 雕塑默认和 active filter。
- 鼠标光点默认和 active 样式。

关键 CSS：

```css
.image-desaturate {
  filter: grayscale(1) contrast(1.12) brightness(0.82) drop-shadow(0 0 0 rgba(255, 22, 22, 0));
}

.image-active {
  filter: grayscale(0.66) contrast(1.2) brightness(0.92) saturate(1.32)
    drop-shadow(0 0 34px rgba(255, 22, 22, 0.42));
}
```

鼠标 active：

```css
.cursor-glow-active {
  background-color: rgba(255, 22, 22, 0.08);
  border-color: rgba(255, 22, 22, 0.96);
  box-shadow:
    0 0 18px rgba(255, 22, 22, 0.95),
    inset 0 0 16px rgba(255, 22, 22, 0.55),
    0 0 96px rgba(255, 22, 22, 0.42);
}
```

## 7. Tailwind 配置

文件：

```text
tailwind.config.ts
```

扩展了颜色：

```ts
lab.black = '#030303'
lab.panel = '#0a0a0b'
lab.line = 'rgba(255,255,255,0.14)'
lab.red = '#ff1616'
lab.muted = '#8a8a8f'
```

扩展了阴影：

```ts
red: '0 0 42px rgba(255, 22, 22, 0.28)'
glass: '0 18px 80px rgba(0,0,0,0.42)'
```

## 8. 已完成需求对照

### 首页基础需求

- 全屏 hero：已完成。
- 顶部导航栏：已完成。
- 左侧大标题：已完成。
- 副标题：已完成。
- `ENTER LAB` 按钮：已完成。
- 右侧雕塑图：已完成，路径为 `/public/david.png`。
- HUD 卡片：已完成。
- 背景白色粒子：已完成。
- 第二屏占位：已完成。

### 交互增强需求

- 鼠标进入雕塑区域进入 active 状态：已完成。
- active 时红色粒子增加：已完成。
- active 时 HUD 边框变红：已完成。
- active 时雕塑红色 drop-shadow：已完成。
- active 时鼠标光点变红色发光圆环：已完成。
- 雕塑轻微视差：已完成。
- 点击 `ENTER LAB` 全屏红色扫描线：已完成。
- 转场文字 `SYSTEM ACTIVATED`：已完成。
- 约 800ms 后滚到下一屏：已完成。
- 动画使用 rAF 或 transform：已完成。
- 避免频繁布局计算：已完成。
- 移动端关闭复杂粒子：已完成。

## 9. 验证记录

构建验证：

```bash
npm run build
```

最新通过记录：

```text
vite v6.4.2 building for production...
✓ 1982 modules transformed.
dist/index.html                   0.53 kB
dist/assets/index-DAtA15cQ.css   17.76 kB
dist/assets/index-FStE0UZ0.js   285.61 kB
✓ built in 3.50s
```

浏览器交互验证：

- 桌面视口 `1280 x 720` 下打开 `http://localhost:5173/`。
- 鼠标移动到雕塑区域后：
  - 3 张 HUD 卡片边框为红色。
  - 光标 class 变成 `cursor-glow-active`。
  - 光标边框为 `rgba(255, 22, 22, 0.96)`。
  - 雕塑 class 变成 `image-active`。
  - 雕塑 filter 包含红色 `drop-shadow`。
  - 雕塑容器 transform 包含 matrix3d，说明视差生效。
- 点击 `ENTER LAB` 后：
  - 页面文本包含 `SYSTEM ACTIVATED`。
  - 约 800ms 后滚动到第二屏。
  - 验收时 `scrollY` 为 `720`。

移动端验证：

- 视口 `390 x 844`。
- 标题没有横向溢出。
- `ENTER LAB` 在首屏内。
- 雕塑区域和 HUD 在移动端缩小。
- 文档宽度没有横向溢出。

相关截图目录：

```text
qa-screenshots/
```

这个目录只是验收辅助，已忽略，不应作为正式资产依赖。

## 10. 后续修改建议

推荐后续 agent 优先做这些：

1. 替换 `public/david.png`

当前图是从参考图中复制出来的临时资产。后续如果有正式雕塑图，应直接替换同名文件，组件不用改。

2. 扩展第二屏真实内容

当前第二屏只是占位模块。可以逐步实现：

- About
- Tools Lab
- Projects
- Resume
- Contact

3. 加入 section 内部导航

目前导航链接都指向 `#lab-sections`。后续可以给每个模块加独立 id。

4. 做真正项目卡片

保持实验室展厅风格，不要改成普通简历卡片。建议用：

- 黑底细线网格
- 小型编号
- 项目状态标签
- 静态图或短视频缩略图
- 红色只在 hover 激活

5. 做首屏 loading 或预加载

`public/david.png` 较大，未来正式发布前可压缩或提供 WebP/AVIF。

## 11. 不建议改动的地方

不要一开始引入：

- 后端
- 数据库
- 登录
- 鉴权
- CMS

原因：

- 用户明确要求不要复杂后端。
- 当前重点是高冲击力首页和交互视觉。
- 数据和权限层会过早增加复杂度。

不要把红色变成主背景色：

- 红色现在是“激活态语言”，不是主色。
- 如果红色面积过大，页面会从实验室展厅变成游戏 UI 或警报面板。

不要把 HUD 做成普通卡片：

- 当前风格依赖细边框、透明玻璃、低亮度文字。
- 大圆角、大面积渐变、卡片阴影会破坏实验室气质。

## 12. 已知环境问题

本机曾出现：

- `node --version` 报 `Access is denied`。
- `npm` 未识别。
- `git` 未识别。
- Playwright 独立浏览器内核未下载，不能直接用独立 Playwright 截图。

已有处理：

- 下载了临时 npm CLI 到 `.tools/npm-cli`。
- 用 Codex runtime 的 Node 执行 npm。
- 用 Codex in-app browser 做了主要交互验收。

如果后续 agent 需要继续测试浏览器：

- 优先使用 Codex in-app browser。
- 视口测试时可以用 browser viewport capability。
- 若截图失败，先做 DOM/style 验证，再补截图。

## 13. 当前可安全继续的入口

改视觉和交互：

```text
src/components/Hero.tsx
src/components/CursorGlow.tsx
src/components/ParticleField.tsx
src/components/HudCard.tsx
src/styles.css
```

改文字和第二屏：

```text
src/App.tsx
src/components/Navbar.tsx
src/components/Hero.tsx
```

改主题色：

```text
tailwind.config.ts
src/styles.css
```

改主视觉：

```text
public/david.png
```

## 14. 快速接手清单

后续 agent 接手时建议按顺序执行：

1. 打开 `package.json` 确认脚本。
2. 打开 `src/components/Hero.tsx` 理解 active、视差和转场。
3. 打开 `src/components/ParticleField.tsx` 理解粒子性能策略。
4. 打开 `src/styles.css` 理解雕塑 filter 和光标 active 样式。
5. 运行 `npm run build`。
6. 运行 `npm run dev`。
7. 打开 `http://localhost:5173/`。
8. 鼠标移到雕塑区域检查红色 active。
9. 点击 `ENTER LAB` 检查转场和第二屏。

## 15. 当前状态一句话总结

当前项目是一个已可运行、已构建验证、已完成首屏高冲击视觉和核心交互的 Vite + React + Tailwind 首页原型，适合继续扩展为完整个人作品集网站。
