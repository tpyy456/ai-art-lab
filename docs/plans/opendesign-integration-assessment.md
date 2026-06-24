---
status: completed
type: assessment
module: opendesign-and-creative-interaction-lab
last_updated: 2026-06-24
---

# Open Design 与外部实验库隔离接入评估

## 1. 评估目标与结论

本轮只评估 Open Design / GitHub 外部工具能否辅助读取、标注和筛选 `creative-interaction-lab`，不把任何 demo 接入主站。

当前结论：

- 主站已经有正式 Web 实验室 / AI LAB，不能被外部实验库覆盖。
- 外部实验库已整理到 `external/creative-interaction-lab/`，由 `.gitignore` 隔离，没有参与主站构建。
- `visible-preview-v6.html` 是当前外部实验库的稳定统一预览入口，包含 35 个静态卡片与 35 个 demo section。
- v6 可以通过普通静态 HTTP 服务打开，不依赖 npm、CDN、React 或后端服务。
- Open Design 官方仓库与 v0.11.0 Release 已通过 GitHub 官方页面核验。
- 官方 Windows x64 portable 桌面版无需 Node、pnpm 或源码 clone，适合安装到项目外的隔离目录。
- Open Design portable 已安装在项目外，并已选择 Codex CLI 与隔离实验目录。
- Open Design 没有写入主站、根依赖或构建流程。

## 2. 当前项目技术栈概览

主站：

- Vite 6
- React 18
- TypeScript 5.6
- Tailwind CSS 3.4
- React Router 6
- Framer Motion
- GSAP
- Lucide React
- Canvas 2D

后端：

- Node.js 原生 HTTP 服务
- 同源 `POST /api/resume-match`
- 香港服务器通过 Caddy 将 `/api/*` 反向代理到本机 Node 服务

构建边界：

- TypeScript 只包含 `src/` 和 `vite.config.ts`。
- 主站正式依赖只由根 `package.json` 管理。
- `external/creative-interaction-lab/` 没有被 `src/` import，也不在主站路由中。

## 3. 当前目录职责

### 主站正式代码

- `src/App.tsx`
- `src/components/`
- `src/features/home/`
- `src/features/intro/`
- `src/features/divine-david/`
- `src/features/about/`
- `src/features/projects/`
- `src/features/resume/`
- `src/features/contact/`
- `src/features/lab/`

### 主站已有 Web 实验室 / AI LAB

- `src/features/lab/AiLabPanel.tsx`
- `src/features/lab/LabLayout.tsx`
- `src/features/lab/_skeleton/`
- `src/features/lab/text-collapse/`
- `/lab/text-collapse` 路由

### 外部实验库

- `external/creative-interaction-lab/`
- `external/interaction-research/src/labs/`
- `external/interaction-research/docs/`

这些内容由 `external/README.md` 统一索引；大型实验内容被 Git 忽略，只作为本地研究和实验素材。

### 后端代码

- `backend/server.js`
- `backend/package.json`
- `backend/ai-art-lab-api.service.example`

### 部署文档与配置

- `docs/plans/server-deploy-handoff.md`
- `.github/workflows/deploy.yml`
- `vite.config.ts`

本轮没有修改部署配置。

### 可公开静态资源

- `public/david-source.png`
- `public/david-source-mobile.webp`
- `public/david.png`

### 隔离工具目录

- Open Design 程序：`C:\Users\acer\Desktop\tools\open-design-0.11.0\`
- Open Design 主程序：`C:\Users\acer\Desktop\tools\open-design-0.11.0\Open Design.exe`
- Open Design 工作目录：`external/creative-interaction-lab/`
- Codex CLI：`C:\Users\acer\.local\bin\codex.exe`
- 程序本体和 CLI 均位于主站仓库之外。

## 4. 当前主站正式模块

主站目前包含：

1. 首页 IntroOverlay、Hero 与 Divine David。
2. About。
3. Projects。
4. Resume 与后端岗位匹配 API。
5. Contact。
6. AI LAB / Web 实验室。
7. RedScanTransition。
8. AudioDock。

这些模块已经构成正式网站，不属于本轮外部工具试验范围。

## 5. 现有 Web 实验室 / AI LAB 关系说明

1. 当前主站已经有 Web 实验室 / AI LAB。
2. 当前 AI LAB 已有 `Text Collapse / 文字坍塌`。
3. `src/features/lab/AiLabPanel.tsx` 提供正式入口，`/lab/text-collapse` 提供正式实验路由。
4. `TextCollapseLab.tsx`、`collapseEngine.ts`、`matrix.ts` 和 `types.ts` 共同维护文字坍塌、网格残骸、REFORM 与重组逻辑。
5. `creative-interaction-lab` 是外部独立实验库，不是当前 AI LAB。
6. Open Design 只能辅助读取、筛选、标注，不能直接修改或覆盖正式 AI LAB。
7. 未来 demo 迁移必须先进入隔离沙盒，经过性能、移动端、生命周期和视觉验收后，才可单独评估是否进入正式 AI LAB。
8. 本轮没有修改任何 AI LAB 代码。

## 6. `creative-interaction-lab` 说明

位置：

```text
external/creative-interaction-lab/
```

当前推荐入口：

```text
external/creative-interaction-lab/visible-preview-v6.html
```

重点资料：

- `README.md`
- `HANDOFF.md`
- `HANDOFF_CODEX_V6_RESCUE.md`
- `docs/v5-rescue-report.md`
- `docs/interaction-analysis.md`
- `docs/migration-notes.md`

任务要求中提到的 `docs/v6-visible-all-report.md` 当前不存在；v6 验证信息记录在 `HANDOFF.md` 与 `HANDOFF_CODEX_V6_RESCUE.md`。

实验库包含 35 个 demo，覆盖：

- 仪式加载、动态文字、档案卡片、鼠标拖尾
- 粒子场、液态透镜、滚动画廊、红色激活
- 形变网格、图像显影、磁吸菜单、数据扫描
- 像素溶解、像素扫描、滚轮实验、雕塑蓝图
- 路由转场、均衡器与磁吸画廊

隔离状态：

- 没有 import 到主站。
- 没有接入 AI LAB 面板。
- 没有新增主站路由。
- 没有参与根 TypeScript 编译或 Vite 正式构建。

## 7. `visible-preview-v6.html` 验证结果

本轮通过临时本机静态 HTTP 服务实际打开并验证：

- 页面标题正常。
- 主标题 `CREATIVE INTERACTION LAB / 创意交互实验库` 可见。
- 35 个 demo 导航项存在，另有 1 个 Overview 导航。
- Overview 中有 35 张实验卡片。
- 有 35 个对应的 demo section。
- Demo 1、Demo 21、Demo 35 均能从入口切换到对应 section。
- 浏览器控制台没有 error 或 warning。
- 页面没有外部脚本 URL。
- 页面没有外部样式表 URL。

因此，v6 适合作为离线审查、人工筛选和未来工具标注的输入源。

## 8. Open Design 工具定位结果

官方来源：

```text
GitHub 仓库：
https://github.com/nexu-io/open-design

v0.11.0 Release：
https://github.com/nexu-io/open-design/releases/tag/open-design-v0.11.0

Windows portable：
https://github.com/nexu-io/open-design/releases/download/open-design-v0.11.0/open-design-0.11.0-win-x64-portable.zip
```

官方 README 核验结果：

- Open Design 是 Apache-2.0 开源的、本地优先设计工作区。
- 提供 Windows x64 原生桌面程序。
- 官方建议桌面版作为零配置入口。
- 桌面版不需要 Node、pnpm 或源码 clone。
- 官方声明无遥测；需要网络模型时可使用 BYOK 或其模型服务。
- 支持 Codex 等多种 coding-agent CLI，但本轮不安装 MCP、不改 Codex 配置。
- 工具能够生成和预览单页 HTML artifact，因此与 `visible-preview-v6.html` 的静态 HTML 形态兼容；是否能直接把现有 HTML 作为可编辑项目导入，仍需启动后做只读 smoke test。

## 9. 安装与启动结果

- 未 clone Open Design 源码。
- portable zip 已下载到 `C:\Users\acer\Downloads\open-design-0.11.0-win-x64-portable.zip`。
- zip SHA256：`0AB74CD05ACB61F2051C479B861321B1A07FE4160609190D4BD9AD4A6287190D`。
- 已解压到 `C:\Users\acer\Desktop\tools\open-design-0.11.0\`。
- 主程序为 `C:\Users\acer\Desktop\tools\open-design-0.11.0\Open Design.exe`。
- portable 已成功启动，未使用 setup.exe。
- Open Design 已检测并选择 `Codex CLI 0.142.0`。
- 工作目录已设置为 `C:\Users\acer\Desktop\个站\external\creative-interaction-lab`。
- 未创建主站依赖树，未运行第三方安装脚本，未修改根 `package.json` 或 `package-lock.json`。
- 未输入邮箱、Token 或 API Key，未执行生成或应用修改。

## 10. 后续隔离安装方案

当前 portable 桌面版已按以下路径完成安装，不需要源码 clone 或 npm 安装：

```text
C:\Users\acer\Desktop\tools\open-design-0.11.0\
```

如未来需要审查源码，再按以下方式隔离：

### 源码参考型

```text
external/opendesign/
```

用途：

- 读取 README、许可证和安全边界。
- 分析源码是否支持本地 HTML / URL。
- 不参与主站 build。

### CLI / npm 工具型

```text
tools/opendesign/
```

用途：

- 独立 `package.json`。
- 独立安装依赖。
- 独立 smoke test。
- 不修改主站根依赖。

### 不使用的位置

```text
src/
public/labs/opendesign/
```

除非后续明确要求公开一个纯静态预览，否则不将工具复制进 `public/`。

## 11. Open Design 适用性评估框架

已确认：

1. Windows portable 桌面版不需要 Node、Python、Docker 或 pnpm。
2. 软件本体启动不要求把 API Key 写入主站；使用外部模型能力时可能需要单独配置 provider。
3. 官方仓库使用 Apache-2.0 许可证。
4. 官方 README 声明 local-first 和 no telemetry。
5. 官方提供 sandboxed HTML preview 与 HTML export。

已启动验证：

1. portable 可以直接启动，无需系统安装。
2. Open Design 能检测本地 Codex CLI。
3. 可以把 `creative-interaction-lab` 设为独立工作目录，不需要选择主站根目录。
4. 选择工作目录后，主站与实验目录均未出现 Open Design 生成文件。

仍需后续功能验证：

1. 是否支持把已有 `visible-preview-v6.html` 直接导入为可编辑设计文件。
2. 是否能稳定解析该文件的内联 CSS / JS。
3. 是否方便为 35 个 demo 添加筛选、评分和备注。

最低接受条件：

- 能在隔离目录运行。
- 不要求改主站根依赖。
- 不要求把工具代码放进 `src/`。
- 不自动改写 `creative-interaction-lab`。
- 能读取 `visible-preview-v6.html` 或其本机 HTTP 地址。
- 不需要向第三方上传私有项目文件；如需要上传，必须另行获得用户明确授权。

## 12. 是否适合读取 `visible-preview-v6.html`

对输入文件本身的判断：适合。

理由：

- 单文件静态 HTML。
- 35 个导航、卡片和 section 已静态生成。
- 不依赖 npm 或 CDN。
- 无外部脚本和样式资源。
- 局部 demo 失败不会让全页内容消失。

对 Open Design 工具本身的判断：适合作为候选预览与设计分析工作区。目录隔离和 Codex CLI 配置已验证；“直接导入既有 HTML 并只读标注”仍需后续单独 smoke test 证明。

## 13. 是否适合筛选 35 个 demo

实验库结构适合筛选，建议记录以下字段：

- demo 编号与中英文名称
- 交互触发方式
- 视觉价值
- 与现有主站功能的重复度
- 桌面端 / 移动端风险
- Canvas / RAF / 全局监听成本
- 是否需要资源或权限
- P0 / P1 / P2 优先级
- 沙盒验收状态

Open Design 是否能承担这些标注仍取决于其实际功能；当前不能代替人工评估。

## 14. 与 AI LAB 的关系

推荐关系：

```text
creative-interaction-lab
  -> Open Design 或人工只读筛选
  -> 隔离沙盒单 demo 验证
  -> 性能与移动端验收
  -> 用户确认
  -> 再决定是否迁移到正式 AI LAB
```

禁止关系：

```text
creative-interaction-lab
  -> 批量复制
  -> 直接覆盖 src/features/lab/
```

## 15. 未来迁移建议

### P0：低风险、结构价值高

- Demo 27 `Scroll Archive Stack`
- Demo 31 `Interactive Sculpture Blueprint`
- Demo 35 `Pixel Magnetic Gallery`
- Demo 14 `Data Scanner Panel`

建议先做成独立沙盒页，不碰首页和现有 Text Collapse。

### P1：需要性能或交互适配

- Demo 21 `Pixel Dissolve`
- Demo 25 `Mosaic Reveal Panel`
- Demo 26 `Scroll Pixel Dissolve`
- Demo 28 `Wheel Lens Distortion`
- Demo 30 `Scroll Trigger Scanner`
- Demo 32 `Scroll Parallax Lab`
- Demo 34 `Hover Soundless Equalizer`

必须先定义移动端降级、事件清理和 RAF 上限。

### P2：只适合作为独立实验或彩蛋

- Demo 7 `Scroll Gallery`
- Demo 9 `Infinite Lab`
- Demo 16 `Audio Reactive Bars`
- Demo 20 `Experimental Switchboard`
- Demo 23 `Pixel Sorting Glitch`
- Demo 29 `Pixel Rain Terminal`
- Demo 33 `Pixel Route Transition`

不应进入首页 Hero，也不应影响正式页面导航和滚动。

## 16. 本轮对主站与 build 的影响

- 没有修改 `src/`。
- 没有修改 `src/features/lab/`。
- 没有修改主站路由。
- 没有修改根 `package.json`。
- 没有修改根 `package-lock.json`。
- 没有修改 Vite 或 GitHub Actions。
- 没有修改 Caddy、systemd 或香港服务器。
- 没有把外部实验库接入主站。
- Open Design 已安装在项目外，因此没有新增主站工具依赖或 build 输入。
- 仓库内只整理文档、外部资料索引和简历 PDF 路径；主站功能代码未变。
- TypeScript `tsc --noEmit` 与 Vite 6.4.2 production build 均已通过。

## 17. 推荐下一步

1. 保持 Open Design 工作目录为 `external/creative-interaction-lab/`，不要切换到主站根目录。
2. 使用 `visible-preview-v6.html` 的本机 HTTP 地址或实际实验库目录做只读 smoke test。
3. 不执行 `apply changes`、`write changes` 或自动重构。
4. 先标注 3 个样本：Demo 14、31、35。
5. 验证工具不会写入实验库和主站。
6. 再决定是否用它批量筛选全部 35 个 demo。
