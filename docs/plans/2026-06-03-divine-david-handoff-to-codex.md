# Divine David Integration - Handoff to Codex (2026-06-03)

## 1. 当前项目状态
当前项目已经完成了：
* 主站文件结构整理（`src/features/home` 等目录的模块化梳理）
* 开始界面 `IntroOverlay` 组件化接入
* 开始界面转场后主站的平滑淡入逻辑
* 神性大卫尝试接入右侧主视觉区域

**⚠️ 严重警告：**
* 当前神性大卫接入后的**视觉状态极度不稳定**，出现了严重的构图错位和比例崩坏。
* **当前版本绝对不要作为稳定备份。**
* 当前版本需要 Codex 接手重新判断修复路线。

## 2. 当前可用稳定备份
为了安全回退，请参考以下已存放在外部的稳定备份路径：

1. **融合前主站基准版**（仅重构，未融合任何 Demo）：
   `C:\Users\acer\Desktop\个站备份\backup-main-site-before-demo-integration-20260603`
2. **开始界面接入稳定版**（已包含 IntroOverlay，但保留静态 david.png）：
   `C:\Users\acer\Desktop\个站备份\backup-after-intro-overlay-integrated-20260603`

**接手建议：**
* 如果 Codex 判断神性大卫接入的冗余代码或错位逻辑过多，强烈建议直接从 `backup-after-intro-overlay-integrated-20260603` 回退，再重新接入神性大卫。
* 不建议基于当前崩坏版继续大修，除非 Codex 先完成完整的 diff 审查。

## 3. 你在神性大卫阶段改过哪些文件
在接入和尝试修复阶段，共修改了以下文件：

* `src/App.tsx`
  * **改动目的**：让主站感知开始界面的结束。
  * **关键逻辑**：增加 `isActive={introComplete}` prop 传递给 `<Hero />`。
* `src/features/home/Hero.tsx`
  * **改动目的**：替换静态图片为动态 Canvas，并调整父级容器。
  * **关键逻辑**：引入 `<DivineDavidCanvas />`；删除静态 `<motion.img src="/david.png" />`；删除了重叠在大卫身上的三个 HUD 卡片（POINT CLOUD 等）；更改了包裹 Canvas 的外层 div 样式。
* `src/features/divine-david/DivineDavidCanvas.tsx`
  * **改动目的**：封装原生的 Canvas 逻辑为 React 组件。
  * **关键逻辑**：移植核心渲染循环、`ResizeObserver` 监听、移动端降级判断、事件监听生命周期清理、交互坐标修正以及模型渲染缩放和中心点（scale / cx / cy）调整。

## 4. 第一次神性大卫接入方案
* **提取逻辑**：将 `02-完成版-神性大卫效果.html` 中的 `script` 内容提取到 `useEffect` 中。
* **替换图片**：用 `<DivineDavidCanvas />` 替换 `<motion.img src="/david.png" />`。
* **限制区域**：给父容器设置了 `absolute bottom-0 right-[-9%] z-10 h-full w-[112%]` 试图限制 Canvas 大小。
* **容器监听**：使用 `ResizeObserver` 替代 `window.innerWidth/innerHeight` 作为主尺寸依据。
* **状态联动**：初次接入时，将 Hero 的 `activationProgress` 传入 Canvas，直接参与到了粒子引力引擎（`effectiveCharge`）的计算中。
* **运行控制**：通过 `running={isActive}` 确保 Canvas 在 `introComplete` 为 true 时才开始执行高强度渲染循环。
* **交互保留**：保留了点击、长按蓄能、双击爆发的原生逻辑。

## 5. 第一次出现的问题
* 鼠标交互错位，hover 的引力中心不在鼠标指针处。
* 长按中心和鼠标实际位置完全不一致。
* Canvas 虽然被限制在了右侧，但内部大卫的构图不对，大卫位置偏右且过小。
* 原本用于修饰右侧空间的 HUD 信息框（POINT CLOUD 等）严重遮挡了变小后的大卫。

## 6. 你做过的坐标修复
* **坐标转换**：从原先的 `event.clientX / event.clientY` 改为了使用局部坐标。
* **放弃 BoundingRect**：未使用 `getBoundingClientRect()`，因为它在具有 3D transform 的父元素下会返回偏移的投影包围盒。
* **使用 offset**：直接采用了相对于事件目标的 `offsetX / offsetY` 作为局部坐标。
* **像素比处理**：保留了 `canvas.width = rect.width * dpr` 以及 `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` 的逻辑，确保渲染清晰，并将所有交互逻辑统一回退到 CSS 逻辑像素系。
* **指针捕获**：在 `pointerdown` 时调用了 `canvas.setPointerCapture(event.pointerId)`，防止长按时鼠标滑出容器导致事件丢失。
* **剔除联动**：为了排查错位，移除了 `activationProgress` 对粒子物理引擎的强制绑定。

**仍存在的隐患：**
之前的错位主要是父级 `rotateX/Y` 与屏幕坐标系不匹配引起的。但我直接改用 `offsetX/Y` 以及后续更改了外层容器的尺寸后，Canvas 自身的逻辑中心可能已经偏离了预期的“红框中央”。这部分需要 Codex 重点检查。

## 7. 你做过的视觉位置修正
这是最后一次导致的严重视觉崩坏的改动：
* 删除了 `Hero.tsx` 中原有的硬编码偏移 `right-[-9%]`。
* 移除了之前尝试约束比例的 `aspect-[720/900]`。
* 将父容器改成了粗暴的 `absolute inset-0 z-10 w-full h-full pointer-events-auto`。
* 修改了 `getSceneState`：
  * 将桌面端 scale 从 `0.96` 强行提升到了 `1.35`。
  * 将移动端 scale 从 `1.18` 强行提升到了 `1.45`。
  * 将垂直中心点 `cy` 从 `height * 0.545` 改成了 `height * 0.5`。
* 在 Hero 组件中删除了 `POINT CLOUD`、`REACTIVITY`、`DATA FLOW` 三个 HUD 卡片。

**⚠️ Codex 审查重点：**
这次修正试图强行放大模型并铺满容器，但用户反馈**视觉完全错位、崩掉**。特别是 `absolute inset-0 w-full h-full`、`scale 1.35`、`cy 0.5` 这些随意更改的参数，极有可能是导致视觉崩坏的直接原因。

## 8. 当前已知问题
* 大卫视觉严重错位。
* 大卫大小、位置、构图不稳定。
* 翅膀边缘和红框的关系不正确，可能存在严重裁切或越界。
* 交互（hover、长按）由于坐标系混乱可能仍存在隐性 bug。
* 当前 Canvas 挂载区域和原设计稿中的展示框关系已被破坏。
* 当前版本状态糟糕，**不适合继续备份**。

## 9. Codex 接手建议
给 Codex 的客观建议：
1. **先不要继续视觉优化**，也不要增加新功能。
2. 先用 git 或文件对比工具，审查当前崩坏版与 `backup-after-intro-overlay-integrated-20260603` 的差异。
3. **优先判断是回退重接，还是局部修复**。由于当前状态较乱，回退重接往往更安全。
4. 如果重接神性大卫，应该先**只恢复原 demo 的视觉稳定**，不要盲目加 `activationProgress` 深度融合。
5. Canvas 应该有一个**明确、稳定、不受外层复杂 3D transform 干扰**的视觉容器。
6. 坐标系统必须统一，确保屏幕鼠标系与 Canvas 内的绘制系严格对应。
7. 大卫的位置、scale、center 应该基于**可解释的布局参数**推导，绝不能用随意试出来的硬偏移数值（如 scale 1.35）。
8. 先保证静态状态下的视觉居中和挂载区域正确，然后再修交互。
9. 最后在极其稳定的基础之上，再考虑是否需要和主站的 hover / HUD 进行深度联动。

## 10. 当前 build 状态
* **当前 `npm run build` 可以通过。**
* 但是，**通过 build 绝不代表视觉正确**。
* 当前项目的主要矛盾是视觉布局和交互坐标的崩坏，而非编译期错误。不要被绿色的 build 结果迷惑。