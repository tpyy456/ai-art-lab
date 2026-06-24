# TPY / AI ART LAB 个人网站交接索引

这是一个 Vite + React + Tailwind CSS 个人作品集首页项目。当前页面定位不是普通简历站，而是一个「AI 艺术实验室 + 数字雕塑展厅」的首屏体验。

本次整理只做了源码目录归类和文档补充，没有改页面文案、视觉内容、交互参数、素材路径或 demo 内容。

## 下一位 agent 建议阅读顺序

1. `README.md`：当前交接入口，先确认项目边界。
2. `docs/ENGINEERING.md`：个人网站架构、组件职责、交互原理、性能策略。
3. `docs/plans/2026-06-03-demo-integration-plan.md`：如何把两个 demo 接入现有网站。
4. `src/features/home/Hero.tsx`：当前首页主交互所在文件。
5. `external/source-demos/00-最高优先级文档/README-两个demo总览.md`：demo 文件夹的原始说明。

## 当前源码结构

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

## 目录职责

- `src/features/home/`：当前个人网站首页模块，包含 Hero 主体和与首页强绑定的交互组件。
- `src/features/home/components/`：只服务首页的局部组件，例如鼠标光点、背景粒子、HUD 卡片。
- `src/components/layout/`：全站布局类组件，目前只有导航栏 `Navbar`。
- `public/`：Vite 静态资源目录，当前主视觉图片是 `public/david.png`。
- `external/source-demos/`：外部 demo 与参考素材，当前没有并入 React 项目。
- `docs/`：给后续 agent 使用的工程文档和计划文档。

## 如何运行

```bash
npm install
npm run dev
```

默认 Vite 端口通常是 `5173`。如果端口被占用，Vite 会提示新的可用端口。

## 如何验证

```bash
npm run build
```

构建脚本会先执行 TypeScript 检查，然后执行 Vite 打包。

## 当前网站状态

- 首屏 Hero 已完成。
- 顶部导航、左侧标题、副标题、`ENTER LAB` 按钮已完成。
- 右侧主视觉当前仍是静态图片 `/david.png`。
- 鼠标靠近雕塑区域会触发 active 状态。
- active 状态会影响鼠标光点、背景粒子、HUD 卡片、雕塑阴影和视差。
- 点击 `ENTER LAB` 会显示 `SYSTEM ACTIVATED` 红色扫描线转场，然后滚动到第二屏占位区域。
- 第二屏目前是 About、Tools Lab、Projects、Resume、Contact 的占位模块。

## 重要边界

- 不要在没有确认前删除 `external/source-demos/` 内任何文件。
- 不要直接把 demo 的全屏 `body/html` 样式粘进主项目。
- 不要把神性大卫 demo 原样做成全屏，它应该被限制在首页右侧主视觉区域。
- 后续整合 demo 时，优先新增 `src/features/intro/` 和 `src/features/divine-david/`，不要再把复杂逻辑堆回 `src/components/` 根目录。
