# 全站状态与交接汇总 (2026-06-04)

## 1. 项目总体定位
本项目不是普通的作品集网站，而是：
**AI ART LAB / AI 训练师候选人的交互式个人网站**

**用途：**
* 面试展示
* AI Agent 协作能力展示
* AI 训练师 / 大模型评测 / 数据质检方向求职辅助
* 视觉表达与项目能力展示

**核心功能分布强调：**
* **首页 (`/`)**：负责第一眼视觉冲击力与整体氛围基调。
* **About (`/about`)**：负责展示真实的人、艺术背景与生活痕迹。
* **Projects (`/projects`)**：负责展示项目档案库（包含岗位实践与 AI 实践）。
* **Resume (`/resume`)**：负责展示结构化的求职档案和本地 JD 匹配演示。
* **Contact (`/contact`)**：负责提供快速的联系入口终端。
* **AI LAB (`/lab/*`)**：负责承载可扩展的交互实验（如 Text Collapse）。

---

## 2. 当前技术栈
* Vite
* React 18
* TypeScript
* Tailwind CSS
* Framer Motion
* GSAP
* React Router
* Canvas 2D
* **无后端**（当前所有的交互如 JD 匹配等均为本地 Demo，未接入真实 API）

---

## 3. 当前路由结构
当前已完成并存在的路由页面：
* `/`：首页（包含 Intro、神性大卫交互、主视觉及导航）
* `/about`：关于我（双层交互肖像、底部横向滚动影像带）
* `/projects`：项目档案页（双线项目列表及详情弹窗展示）
* `/resume`：求职简历档案页（经历时间线及 JD 匹配分析器）
* `/contact`：联系方式终端页（一键复制与微信二维码占位）
* `/lab/_skeleton`：AI LAB 的标准空骨架，用于后续实验模板
* `/lab/text-collapse`：AI LAB 的具体实验模块——文字坍塌系统

---

## 4. 当前核心文件结构

#### App / 路由
* `src/App.tsx`

#### 首页
* `src/features/home/Hero.tsx`
* `src/features/home/components/ParticleField.tsx`
* `src/features/home/components/CursorGlow.tsx`
* `src/features/home/components/AudioDock.tsx`

#### Intro (开场动画)
* `src/features/intro/IntroOverlay.tsx`
* `src/features/intro/intro.css`

#### 神性大卫 (右侧交互视觉)
* `src/features/divine-david/DivineDavidCanvas.tsx`

#### AI LAB
* `src/features/lab/AiLabPanel.tsx`
* `src/components/transition/RedScanTransition.tsx`

#### Text Collapse (文字坍塌实验)
* `src/features/lab/text-collapse/TextCollapseLab.tsx`
* `src/features/lab/text-collapse/collapseEngine.ts`
* `src/features/lab/text-collapse/matrix.ts`
* `src/features/lab/text-collapse/types.ts`

#### About (关于我)
* `src/features/about/AboutPage.tsx`
* `src/features/about/components/InteractivePortrait.tsx`
* `src/features/about/components/AboutArchiveGrid.tsx`

#### Projects (项目档案)
* `src/features/projects/ProjectsPage.tsx`
* `src/features/projects/components/ProjectCard.tsx`
* `src/features/projects/components/ProjectDetailModal.tsx`
* `src/features/projects/projectsData.ts`

#### Resume (求职档案)
* `src/features/resume/ResumePage.tsx`
* `src/features/resume/components/RoleMatchAnalyzer.tsx`
* `src/features/resume/resumeData.ts`

#### Contact (联系终端)
* `src/features/contact/ContactPage.tsx`
* `src/features/contact/components/ContactChannel.tsx`
* `src/features/contact/components/WechatQrPlaceholder.tsx`

---

## 5. 当前各页面状态

#### 首页 `/`
* IntroOverlay 点击 "ENTER SYSTEM" 后红黑波纹转场进入首页。
* 主站平滑淡入。
* 右侧的**神性大卫**视觉与交互表现稳定。
* AudioDock 播放器控件已接入，当前在音频文件缺失时会显示安全的状态。
* 页面向下滚动或直接通过左侧导航，可访问第二屏的 About / AI LAB / Projects / Resume / Contact 入口。
* **所有从首页到子页面的跳转，统一使用了 `RedScanTransition` 红色扫描转场。**

#### About `/about`
* 当前已完成高级重设计。
* 左侧为个人文字叙述区。
* 右侧为双层交互肖像（支持鼠标悬停时丝滑探照灯式擦除效果）。
* 底部 Archive 区域为双行横向缓慢滚动的影像胶片轨道。
* 底部占位图片标签已统一为极具档案感的 `TRACE-xx / 生活片段`。
* 页面文字保持了中英文双语或中文可读。

#### Projects `/projects`
* 当前页面分为两条主项目线：
  * `PROFESSIONAL PRACTICE / 岗位实践`
  * `AI AGENT PRACTICE / AI Agent 实践`
* 每个项目卡片均可点击，点击后会在当前页面弹出带有红色激光扫描特效的 `ProjectDetailModal` 档案详情框。
* *注：视觉增强版曾尝试过加入网格和纵向扫描轴线，但因效果不佳已被选择性移除。当前卡片保留了恰到好处的 hover 轻微上浮与暗红阴影立体感。不要再试图添加横竖网格或纵向轴线。*

#### Resume `/resume`
* 已完成求职档案页面，包含求职方向、核心能力、实习经历（含红点时间轴）、教育背景。
* 底部加入了 `ROLE MATCH ANALYZER / 岗位匹配分析器` 交互模块。
* **当前 JD 匹配是本地演示版（Local Demo）**，不上传任何岗位信息。支持粘贴文本并展示 mock 的评分与建议结果。
* 简历 PDF 下载功能由于当前未接入真实文件，已设定为对用户友好的 `RESUME FILE NOT READY / 简历文件暂未接入` 安全状态。

#### Contact `/contact`
* 已完成极具极客感的联系终端页面。
* 包含邮箱（`2767188571@qq.com`）、电话（`18339577708`）、微信（`lcebear131`）。
* 三个通道均附带复制按钮，点击后可触发 `COPIED / 已复制` 的丝滑反馈。
* 微信二维码当前使用的是由 CSS 绘制的占位红框。
* **右侧二维码占位区域的视觉对齐问题已修复。**

#### AI LAB
* 首页的实验面板内目前包含：
  * `TEXT COLLAPSE / 文字坍塌`（已完成）
  * `AUDIO VISUALIZER / 音频可视化`（占位）
  * `GESTURE VISION / 手势识别`（占位）
* 从面板点击进入具体实验，均使用统一的红色扫描转场。

#### Text Collapse (文字坍塌实验)
* 实现了中文文本和田字格系统的可交互坍塌效果。
* 点击字和田字格会联动掉落，废墟中会堆积文字碎片与网格碎片。
* 长按 "REFORM" 可重塑为数字向日葵（已修复完成瞬间的闪烁 Bug）。
* "RESET" 功能正常。

---

## 6. 重要设计规则
1. **所有用户可见界面文字必须中英文双语或中文可读。**
2. 英文可以保留氛围与系统感，但中文负责绝对的语义可读性。
3. 绝对不要只写英文。
4. 绝对不要使用 `TODO / PENDING / Coming Soon / 开发中 / 待开发` 等显得粗糙的半成品字样。
5. 如果某项功能尚未真实接入，必须将其包装成专业、用户友好的状态，例如：
   * `LOCAL DEMO / 本地演示版`
   * `RESUME FILE NOT READY / 简历文件暂未接入`
   * `QR CODE WILL BE ADDED / 二维码稍后接入`
6. 不要把页面做成白底、大圆角、普通的简历模板风。
7. 保持**黑底、冷感、红色细线、数字档案感**的美学标准。
8. 保持克制，不要过度赛博朋克、过度机密档案、过度使用高亮红光。
9. 本网站的核心是服务于面试展示与专业传达，而不是无意义的纯视觉炫技。

---

## 7. 禁止误改区域
后续接手的 Agent 未经明确要求，**绝对不要**修改以下核心稳定模块：
* `IntroOverlay`
* `DivineDavidCanvas`
* `Hero` 主视觉
* `TextCollapse` 引擎
* `RedScanTransition`
* `AI LAB 面板`
* 已稳定的各页面路由结构
* `Contact` 的复制逻辑
* `Resume` 的 JD 匹配本地演示逻辑
* `Projects` 的弹窗逻辑

⚠️ **警告**：任何涉及 Canvas / RAF / 全局事件监听 / 音频 / 摄像头 / 后端 API 的改动，都必须先向用户单独确认需求与内存/事件清理策略。

---

## 8. 备份与 commit 信息

**近期关键 Commit 记录：**
* `4d9a93e feat(projects): add project detail overlay`
* `ca08f4c fix(projects): remove archive grid while keeping card depth`
* `1595384 feat(resume): add resume profile and role match demo`
* `84b8e05 feat(contact): add contact terminal page`
* `d695e04 fix(contact): align wechat qr panel`

**当前最新稳定接手点：**
`d695e04 fix(contact): align wechat qr panel`

**现有重要外部备份目录：**
（位于 `C:\Users\acer\Desktop\个站备份`）
* `backup-after-resume-role-match-stable-20260604`
* `backup-after-projects-detail-overlay-stable-20260604`
* `backup-after-about-placeholder-before-redesign-20260604`
* `backup-after-ai-lab-scan-transition-stable-20260604`
* `backup-after-david-boundary-release-stable-20260603`
* `backup-after-david-frame-hud-particle-restore-20260603`
* `backup-after-divine-david-rollback-stable-20260603`
* `backup-after-intro-overlay-integrated-20260603`
* `backup-before-lab-modules-20260604`
* `backup-main-site-before-demo-integration-20260603`

---

## 9. 下一步建议 (给下一任 Agent)
*当前仅为建议，请等待用户明确下达指令后再执行：*
1. **填补 About 真实素材**：
   * `public/about/profile-real.jpg`
   * `public/about/profile-mask.jpg`
   * 替换底部 Archive 照片轨道的真实图片
2. **接入真实微信二维码**：
   * `public/contact/wechat-qr.png`
3. **接入真实简历 PDF 下载文件**。
4. 精修 Projects 页面里的正式项目文案。
5. 精修 Resume 页面的真实求职表达文案。
6. 后续可开发 `Audio Visualizer`（音频可视化）模块。
7. 后续可开发 `Gesture Vision`（手势识别）模块。
8. 后续若要将 `Role Match` 从本地 demo 升级为真实 API 交互，**必须通过后端代理**，绝不能将大模型 API key 直接暴露在前端代码中。
