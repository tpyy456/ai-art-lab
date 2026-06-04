---
status: live
type: engineering
module: personal-site
last_updated: 2026-06-03
---

# 个人网站架构与技术实现

## 1. 项目定位

当前项目是 `TPY / AI ART LAB` 的个人作品集首页。它的核心不是展示简历条目，而是建立一个带交互激活感的个人实验室入口：

- 黑、灰、白为主视觉。
- 红色只作为交互激活色。
- 右侧雕塑区域是视觉焦点。
- 鼠标接近雕塑时，页面进入 active 状态。
- 点击 `ENTER LAB` 后，出现系统激活转场并进入下一屏。

## 2. 技术栈

- 构建工具：Vite 6
- UI 框架：React 18
- 类型系统：TypeScript
- 样式：Tailwind CSS
- 动画：Framer Motion
- 图标：lucide-react
- 背景粒子：Canvas 2D

`package.json` 中的核心脚本：

```bash
npm run dev
npm run build
npm run preview
```

## 3. 当前源码布局

```text
src/
  App.tsx
  main.tsx
  styles.css
  vite-env.d.ts
  components/
    layout/
      Navbar.tsx
  features/
    home/
      index.ts
      Hero.tsx
      components/
        CursorGlow.tsx
        HudCard.tsx
        ParticleField.tsx
```

整理原则：

- `features/home` 放首页业务模块。
- `features/home/components` 放只服务首页的局部组件。
- `components/layout` 放跨页面布局组件。
- 后续新功能优先按 `features/{feature-name}` 拆分。

## 4. 渲染入口

`src/main.tsx` 挂载 React 应用。

`src/App.tsx` 负责页面组合：

- 渲染 `Hero` 首屏。
- 渲染 `#lab-sections` 第二屏占位区。

`Hero` 通过 `src/features/home/index.ts` 暴露，避免 `App` 直接依赖首页内部文件结构。

## 5. 首页模块职责

### 5.1 `Hero.tsx`

首页核心组件，负责：

- 首屏布局。
- 鼠标位置监听。
- 雕塑区域 active 状态计算。
- 雕塑轻微 3D tilt 和视差。
- HUD 卡片位置联动。
- `ENTER LAB` 点击转场。
- 组合 `Navbar`、`CursorGlow`、`ParticleField`、`HudCard`。

关键状态：

- `mouse`：当前鼠标位置，用于光点和粒子。
- `transitioning`：是否正在播放 `ENTER LAB` 转场。
- `activationProgress`：Framer Motion 的 spring motion value，表示鼠标接近雕塑的激活程度，范围约为 `0 -> 1`。

关键 refs：

- `sculptureRef`：右侧雕塑区域 DOM。
- `sculptureBoundsRef`：缓存雕塑区域边界，避免每帧重复布局测量。
- `frameRef`：用 `requestAnimationFrame` 限制鼠标事件触发频率。

### 5.2 `CursorGlow.tsx`

鼠标光点组件。

输入：

- `mouse`
- `activation`

默认状态是白色半透明光点；active 越强，越接近红色发光圆环。

它只在 `md` 以上屏幕显示，移动端隐藏，避免移动端无鼠标场景出现无意义 UI。

### 5.3 `ParticleField.tsx`

背景粒子 Canvas。

职责：

- 绘制少量白色背景粒子。
- active 状态增强时，绘制红色粒子流。
- 红色粒子沿鼠标和雕塑中心之间生成流动关系。

性能策略：

- Canvas 固定全屏。
- DPR 上限为 `2`。
- 移动端或 `prefers-reduced-motion: reduce` 时降低粒子数量。
- 每帧只做 Canvas transform 和绘制，不触发 React 重渲染。

### 5.4 `HudCard.tsx`

右侧主视觉周围的小型 HUD 卡片。

当前内容：

- `POINT CLOUD 106,842`
- `REACTIVITY 87%`
- `DATA FLOW STREAMING`

卡片使用玻璃拟态、细边框和轻微发光。边框与文字强度由 `activation` 控制。

### 5.5 `Navbar.tsx`

顶部导航栏。

当前放在 `src/components/layout/`，因为它后续可能成为跨页面布局，而不是只服务 Hero。

导航项：

- 关于我
- 工具实验室
- 项目
- 简历
- 联系我

## 6. 交互数据流

### 6.1 鼠标移动

`Hero.tsx` 在 `window` 上监听 `pointermove`。

处理流程：

1. 记录最新鼠标坐标到 `mouseRef`。
2. 如果当前已有 RAF 等待执行，则跳过本次事件。
3. RAF 中读取缓存的雕塑区域边界。
4. 计算鼠标到雕塑中心的距离。
5. 将距离映射成 `activationProgress`。
6. 根据屏幕中心偏移计算雕塑和 HUD 的轻微 translate / rotate。

这套设计的目的：

- 鼠标事件可以很频繁，但 React 状态更新被 RAF 节流。
- 雕塑区域边界通过 `ResizeObserver` 更新，不在每次鼠标移动时强制测量。

### 6.2 active 状态

active 不是一个简单布尔值，而是一个连续进度值：

```text
activationProgress: 0 -> 1
```

它驱动：

- 鼠标光点从白色变红色圆环。
- 背景红色粒子从不可见到明显。
- HUD 卡片边框变红。
- 雕塑 drop-shadow 变红。
- 雕塑轻微放大。
- 装饰圆环发光增强。

### 6.3 雕塑视差

当前静态雕塑图片由 Framer Motion 控制：

- `translateX`
- `translateY`
- `rotateX`
- `rotateY`
- `scale`
- `filter`

数值幅度被 `clamp` 限制，避免摇晃过度。

### 6.4 `ENTER LAB` 转场

点击按钮后：

1. `transitioning` 设为 `true`。
2. 显示全屏黑色覆盖层。
3. 显示 `SYSTEM ACTIVATED` 文案。
4. 播放红色扫描线。
5. 播放中心红色粒子爆发视觉。
6. 约 800ms 后滚动到 `#lab-sections`。
7. 结束转场。

当前转场不切换路由，不接后端，不写数据库。

## 7. 样式系统

全局样式在 `src/styles.css`。

Tailwind 扩展在 `tailwind.config.ts`：

- `lab.black`
- `lab.panel`
- `lab.line`
- `lab.red`
- `lab.muted`
- `shadow.red`
- `shadow.glass`

视觉规范：

- 黑灰白是常态。
- 红色只在 hover、active、transition 中使用。
- 不使用普通简历站的卡片堆叠感。
- 首屏要像实验室系统和数字雕塑展厅。

## 8. 当前资源

```text
public/
  david.png
```

当前右侧主视觉是静态图片 `/david.png`。后续「神性大卫」demo 并入后，这里会被一个受限区域 Canvas 组件替换。

## 9. 当前非目标

这些内容现在不做：

- 后端。
- 登录。
- 数据库。
- 多页面路由。
- CMS。
- 复杂状态管理库。

## 10. 后续开发建议

- 新首页入口动画放到 `src/features/intro/`。
- 神性大卫 Canvas 放到 `src/features/divine-david/`。
- 如果 About、Tools Lab、Projects 等模块开始变复杂，分别建立 `src/features/about/`、`src/features/tools-lab/`、`src/features/projects/`。
- 不要让 `Hero.tsx` 继续无限膨胀。大型 Canvas 或入口动画应拆成独立 feature。

