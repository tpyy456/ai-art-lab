---
status: draft
type: plan
module: demo-integration
last_updated: 2026-06-03
---

# 两个 demo 并入个人网站的技术指导

## 1. 总目标

后续要实现的体验：

1. 用户打开网站时，先看到「开始界面 demo」。
2. 用户交互并进入后，开始界面播放转场。
3. 当前个人网站首页淡入浮现。
4. 首页右侧主视觉区域不再使用静态 `/david.png`，而是使用「神性大卫 demo」改造后的局部 Canvas。
5. 神性大卫只能在右侧雕塑区域内交互，不能变成全屏页面。

当前这一步只做技术指导，没有把 demo 并入项目。

## 2. demo 文件位置

开始界面 demo：

```text
两个demo/01-完成版-开始界面/
  index.html
  style.css
  script.js
  AGENT_README.md
```

神性大卫 demo：

```text
两个demo/02-完成版-神性大卫效果/
  完成版-神性大卫效果.html
  assets/
    david-source.png
```

最高优先级说明：

```text
两个demo/00-最高优先级文档/
```

下一位 agent 应先读 `两个demo/00-最高优先级文档/README-两个demo总览.md`，再读两个完成版 demo。

## 3. 建议新增源码结构

```text
src/
  features/
    intro/
      IntroOverlay.tsx
      intro.css
    divine-david/
      DivineDavidCanvas.tsx
      divineDavidEngine.ts
      types.ts
```

职责：

- `intro/`：只负责开场入口和入口转场。
- `divine-david/`：只负责右侧雕塑区域内的 Canvas 大卫。
- `home/`：继续负责当前个人网站首屏布局、HUD、光点、背景粒子和 `ENTER LAB`。

## 4. 开始界面 demo 并入方案

### 4.1 不要原样复制的部分

开始界面 demo 当前是纯 HTML/CSS/JS 全屏页面，强控制：

- `body`
- `html`
- `overflow: hidden`
- 全局 cursor
- 全局 SVG filter id
- 进入后的 `body.entered` / `body.intro-complete`

这些不能原样塞进 React 项目，否则可能导致主站滚动被锁、指针事件被禁用、后续页面无法交互。

### 4.2 推荐组件形态

建立：

```text
src/features/intro/IntroOverlay.tsx
src/features/intro/intro.css
```

组件接口建议：

```ts
type IntroOverlayProps = {
  onComplete: () => void;
};
```

`IntroOverlay` 内部维护：

- `isTransitioning`
- `hasEntered`
- 鼠标位置
- 透镜半径
- 水波状态

当转场结束时调用 `onComplete()`，由 `App` 或上层组件负责隐藏 overlay 和淡入主站。

### 4.3 App 层状态建议

```tsx
function App() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      {!introComplete && <IntroOverlay onComplete={() => setIntroComplete(true)} />}
      <motion.main animate={{ opacity: introComplete ? 1 : 0 }}>
        <Hero />
        <Sections />
      </motion.main>
    </>
  );
}
```

如果想让主站提前加载，可以一开始就 mount 主站，只是 opacity 为 0。这样入口结束后淡入更顺滑。

### 4.4 CSS 隔离规则

开始界面 demo 的类名建议全部加前缀：

```text
.intro-layer
.intro-bg-layer
.intro-fg-layer
.intro-glass-rim
.intro-transition-wave
```

避免使用：

```css
body.entered *
html, body { overflow: hidden; }
```

如果必须锁滚动，用 React effect 在组件挂载时临时设置：

```ts
useEffect(() => {
  const previous = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = previous;
  };
}, []);
```

### 4.5 SVG filter id

demo 中的 filter id：

- `edge-warp`
- `water-ripple`
- `water-noise`
- `water-displacement`

并入时建议改成唯一 id：

- `intro-edge-warp`
- `intro-water-ripple`
- `intro-water-noise`
- `intro-water-displacement`

这样可以避免未来页面里其它 SVG filter 冲突。

### 4.6 GSAP 处理

开始界面 demo 依赖 GSAP CDN：

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
```

React/Vite 项目里不要用 CDN。两种可选方案：

方案 A：安装 GSAP。

```bash
npm install gsap
```

然后在组件中：

```ts
import gsap from 'gsap';
```

方案 B：用 Framer Motion 重写转场，保留透镜核心逻辑。

建议优先方案 A，因为开始界面 demo 的水波和时间线已经用 GSAP 调得比较稳定。

### 4.7 和当前 `ENTER LAB` 的关系

当前首页已经有 `ENTER LAB` 和 `SYSTEM ACTIVATED` 转场。

并入开始界面后有两种设计：

方案 A：开始界面负责第一次进入，首页里的 `ENTER LAB` 保留用于滚动到第二屏。

方案 B：开始界面和首页 `ENTER LAB` 合并，第一次进入后不再在 Hero 上重复转场。

建议先做方案 A，风险更低。开始界面是「进入网站」，Hero 的 `ENTER LAB` 是「进入实验室内容」。

## 5. 神性大卫 demo 并入方案

### 5.1 当前 demo 特点

神性大卫 demo 是一个全屏 Canvas 场景。它包含：

- 从 `david-source.png` 采样生成雕塑笔触。
- 背景 scratch / dust。
- 身体线条、光环、轨道、翅状线条。
- 鼠标扰动。
- 点击爆发。
- 长按蓄力和释放。
- `requestAnimationFrame` 主循环。

### 5.2 必须改造的点

当前 demo 频繁使用：

```js
window.innerWidth
window.innerHeight
100vw
100vh
```

这些必须改成容器尺寸，否则它会覆盖整个网站。

推荐用 `ResizeObserver`：

```ts
const rect = container.getBoundingClientRect();
widthRef.current = rect.width;
heightRef.current = rect.height;
```

Canvas 尺寸应来自容器：

```ts
canvas.width = Math.floor(width * pixelRatio);
canvas.height = Math.floor(height * pixelRatio);
canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;
```

### 5.3 推荐组件接口

```ts
type DivineDavidCanvasProps = {
  source?: string;
  activation?: number;
  className?: string;
};
```

默认 source：

```ts
const defaultSource = '/david-source.png';
```

资源建议放到：

```text
public/david-source.png
```

或者如果希望通过 import 管理，也可以放到：

```text
src/assets/david-source.png
```

### 5.4 放入 Hero 的位置

当前静态图片位于：

```text
src/features/home/Hero.tsx
```

在右侧雕塑区域里替换：

```tsx
<motion.img src="/david.png" ... />
```

改成：

```tsx
<DivineDavidCanvas
  source="/david-source.png"
  activation={/* 当前 active 数值 */}
  className="absolute inset-0 z-10"
/>
```

外层容器必须保留：

- 固定高度。
- `overflow-hidden` 或局部裁切。
- `pointer-events` 只在雕塑区域内开启。

### 5.5 和现有 active 系统的关系

当前 `Hero.tsx` 已经计算了 `activationProgress`，它驱动：

- 鼠标光点。
- 背景粒子。
- HUD。
- 雕塑 tilt。
- 红色阴影。

神性大卫组件也会读取鼠标。因此整合时建议：

- `Hero` 继续负责全局 active。
- `DivineDavidCanvas` 只负责容器内 Canvas 交互。
- 鼠标进入雕塑区域时，两个系统都可以响应。
- 鼠标离开雕塑区域时，Canvas 内部 pointer 状态要 reset。

不要让神性大卫组件重新监听全局 `window.pointermove`。它应该监听自己的容器。

### 5.6 性能策略

神性大卫 demo 当前桌面 body strokes 约 `2600`，移动端约 `1650`。

并入首页后建议：

- 桌面：保留较高质量，但把 ambient dust 适当降低。
- 移动端：直接降级为静态 `/david.png` 或低密度 Canvas。
- `prefers-reduced-motion: reduce`：使用静态图。
- DPR 上限继续保持 `2`。
- 用 `IntersectionObserver` 判断 Hero 离开视口后暂停 RAF。
- 页面切换或组件卸载时必须 `cancelAnimationFrame`。

### 5.7 不建议保留的 demo 功能

神性大卫 demo 里有拖拽图片替换和键盘打开文件上传的功能：

- `imageInput`
- `dragover`
- `drop`
- `keydown` 触发上传

正式个人网站首屏不需要这些。建议移除或仅在开发模式保留。

### 5.8 Canvas 背景

原 demo 使用：

```js
canvas.getContext('2d', { alpha: false })
```

这有利于性能，但 Canvas 会自己画黑底。并入 Hero 时可以继续这样做，只要右侧视觉区域本身就是黑色。

如果想让背景网格和当前粒子透出来，可以改为：

```js
canvas.getContext('2d', { alpha: true })
```

但这可能增加绘制成本。建议第一版先保留黑底，把 Canvas 限制在右侧区域内。

## 6. 推荐实施顺序

1. 复制 `两个demo/02-完成版-神性大卫效果/assets/david-source.png` 到 `public/david-source.png`。
2. 新建 `src/features/divine-david/DivineDavidCanvas.tsx`。
3. 把神性大卫 demo 的 Canvas 逻辑拆成 React effect。
4. 将所有 `window.innerWidth / innerHeight` 替换为容器尺寸。
5. 在 `Hero.tsx` 右侧主视觉区域替换静态图片。
6. 跑 `npm run build`。
7. 打开本地页面验证默认、active、点击、长按、移动端。
8. 再新建 `src/features/intro/IntroOverlay.tsx`。
9. 把开始界面 demo 的三层透镜结构移入 React。
10. 用 `onComplete` 控制主站淡入。
11. 再跑一次构建和浏览器检查。

## 7. 验收清单

开始界面：

- 打开网站先看到入口层。
- 入口层不破坏主站滚动。
- 入口转场结束后主站淡入。
- 入口完成后 overlay 完全卸载或 `pointer-events: none`。

神性大卫：

- Canvas 只在右侧雕塑区域内显示。
- 鼠标只在该区域内触发雕塑交互。
- HUD 仍在 Canvas 上方可见。
- 现有背景粒子和鼠标光点仍正常。
- 移动端不出现性能明显卡顿。
- 离开首屏后 RAF 能暂停或至少不会重复创建。

构建：

```bash
npm run build
```

必须通过。

## 8. 最大风险

- 开始界面 demo 的全局 CSS 污染主站。
- 神性大卫 demo 全屏化，压住左侧文字和导航。
- 两套鼠标监听互相抢状态。
- Canvas 动画未清理，组件卸载后仍在 RAF。
- demo 的资源路径没有迁移，导致大卫图片加载失败。
- `ENTER LAB` 语义重复，需要后续设计上决定是双入口还是合并入口。

## 9. 一句话给下个 agent

先不要急着粘代码。第一个 demo 要做成可卸载的全屏入口 overlay；第二个 demo 要做成受容器约束的右侧 Canvas 主视觉。现有 `Hero` 的 active 系统要保留，并作为两个 demo 接入后的统一交互语义。

