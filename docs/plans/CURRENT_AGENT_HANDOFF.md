---
status: active
type: plan
module: opendesign-and-lab-isolation-assessment
last_updated: 2026-06-24
---

# Current Agent Handoff

## 1. 当前任务

本轮完成 Open Design portable 的隔离安装、Codex CLI 选择、`creative-interaction-lab` 工作目录授权，以及项目根目录文件整理。

本轮不是正式接入主站，不迁移 demo，不修改现有 Web 实验室 / AI LAB，不改变页面、路由、构建或服务器配置。

## 2. 当前 Git 状态

- 分支：`main`
- 本轮已提交文档基线：`b4a3ba3 docs: finalize opendesign integration assessment`
- 本轮文件整理提交：以本文件所在的最新 Git HEAD 为准。
- `origin/main`：`2379f06e26388731f91a2c33edcf824226ab7229`
- 本轮提交完成后，本地主分支领先 `origin/main` 2 个 commit；本轮没有 push。
- 原未跟踪目录 `探索/` 已完成无损整理并移除。
- 外部实验库现位于 `external/creative-interaction-lab/`。
- 早期研究材料现位于 `external/interaction-research/`。
- 原 `两个demo/` 已整理为 `external/source-demos/`。
- 原 `c参考图片/` 已整理为 `external/visual-references/`。
- 根目录简历 PDF 已整理为 `docs/assets/resume/谭培洋简历-AI训练师-新版.pdf`。
- `external/README.md` 是可提交的目录索引；大型外部内容由 `.gitignore` 隔离。

## 3. 当前线上部署状态

- GitHub 仓库：`https://github.com/tpyy456/ai-art-lab.git`
- GitHub Pages：`https://tpyy456.github.io/ai-art-lab/`
- 香港服务器入口：
  - `http://43.132.178.15`
  - `http://43.132.178.15:8080`
- GitHub Pages 与香港服务器此前均已完成前端部署。
- 香港服务器此前已部署 Resume 匹配后端，前端通过同源 `POST /api/resume-match` 调用。
- 本轮不修改 GitHub Actions、Caddy、systemd、服务器文件或线上部署。
- 以上是任务开始时的已知状态；本轮只做工具评估，不以线上部署变更为目标。

## 4. 当前香港服务器状态

- 实例：`ai-art-lab-hk`
- 系统：Ubuntu 24.04
- 前端目录：`/var/www/my-site/frontend/dist`
- 源码目录：`/var/www/my-site/repo`
- 后端目录：`/var/www/my-site/backend`
- Caddy 提供静态站、SPA fallback 与 `/api/*` 反向代理。
- `ai-art-lab-api.service` 此前已启用并监听 `127.0.0.1:3001`。
- 本轮不登录、不修改服务器；不得在文档中记录账号、Token、API Key 或密码。

## 5. 当前主站技术栈

- Vite 6
- React 18
- TypeScript 5.6
- Tailwind CSS 3.4
- React Router 6
- Framer Motion
- GSAP
- Lucide React
- Node 后端位于根目录 `backend/`，不参与前端 `src/` 编译。

## 6. 当前主站正式模块

- 首页、IntroOverlay、Hero、Divine David
- About
- Projects
- Resume
- Contact
- AI LAB / Web 实验室
- RedScanTransition
- AudioDock
- Resume 后端匹配 API

上述模块均属于正式主站，本轮只读，不修改。

## 7. 当前 Web 实验室 / AI LAB 状态

主站已经存在正式 AI LAB，不是空项目：

- 首页第二屏有 AI LAB / Web 实验室入口。
- `src/features/lab/AiLabPanel.tsx` 提供实验室面板。
- `/lab/text-collapse` 是正式路由。
- `src/features/lab/text-collapse/` 包含稳定的文字坍塌、废墟、REFORM 和重组逻辑。
- 当前正式实验至少包含 `TEXT COLLAPSE / 文字坍塌`。

本轮禁止修改 `src/features/lab/`、Text Collapse 引擎、AI LAB 面板和路由。

## 8. `creative-interaction-lab` 位置和用途

- 当前定位：`external/creative-interaction-lab/`
- Git 状态：外部实验内容被 `.gitignore` 隔离，没有参与主站提交。
- 当前统一预览候选：`external/creative-interaction-lab/visible-preview-v6.html`
- 已发现 README、HANDOFF、V6 rescue handoff、迁移说明、交互分析和多版预览文件。
- README 与交接材料称 v6 为 35 个 demo 的纯静态 HTML 稳定预览。
- 它是外部独立交互实验库，不是当前正式 AI LAB。
- 当前未被 `src/` import，未接入主站路由或 AI LAB 面板，不参与主站 build。

## 9. Open Design 当前定位状态

- 官方仓库：`https://github.com/nexu-io/open-design`
- v0.11.0 Release：`https://github.com/nexu-io/open-design/releases/tag/open-design-v0.11.0`
- Windows portable：`https://github.com/nexu-io/open-design/releases/download/open-design-v0.11.0/open-design-0.11.0-win-x64-portable.zip`
- 已通过 GitHub 官方仓库和 Release 页面核验。
- 官方桌面版为 Windows x64 原生程序，不需要 Node、pnpm 或源码 clone。
- 官方声明 local-first、no telemetry，许可证为 Apache-2.0。
- portable 已下载、解压并成功启动。
- Open Design 已识别并选择 `Codex CLI 0.142.0`。
- Open Design 工作目录已设置为 `external/creative-interaction-lab/`，没有选择主站根目录。
- 没有安装 MCP，没有向 Open Design 输入邮箱、Token 或 API Key，也没有执行生成或应用修改。

## 10. 隔离安装状态

- portable zip：`C:\Users\acer\Downloads\open-design-0.11.0-win-x64-portable.zip`
- SHA256：`0AB74CD05ACB61F2051C479B861321B1A07FE4160609190D4BD9AD4A6287190D`
- 安装目录：`C:\Users\acer\Desktop\tools\open-design-0.11.0\`
- 主程序：`C:\Users\acer\Desktop\tools\open-design-0.11.0\Open Design.exe`
- Codex CLI：`C:\Users\acer\.local\bin\codex.exe`
- 安装目录位于主站仓库之外，不进入 Git。
- 未使用 setup.exe。
- 不修改根 `package.json`、根 `package-lock.json`，不把工具放进 `src/`。

## 11. 本轮修改边界

允许：

- 读取项目和外部实验库。
- 更新本文件。
- 新增 `docs/plans/opendesign-integration-assessment.md`。
- 在项目外安装 Open Design portable。
- 整理外部实验、参考图片、原始 demo 与文档资产。

禁止：

- 修改 `src/` 中任何文件。
- 修改主站路由、Hero、AI LAB、Text Collapse、Intro、Divine David。
- 修改根 `package.json`、根 `package-lock.json`。
- 修改 GitHub Actions、Vite 部署配置、Caddy 或香港服务器。
- 将 `creative-interaction-lab` import 或复制进正式主站。

## 12. 当前验证进度

已完成：

1. 读取本轮任务说明。
2. 核对 Git 分支、HEAD、`origin/main` 和工作区状态。
3. 识别并整理原 `探索/creative-interaction-lab/`。
4. 读取主站技术文档、`src/App.tsx`、正式 AI LAB、Text Collapse、`public/` 和 `backend/`。
5. 读取外部实验库 README、交接、救援报告、交互分析和迁移说明。
6. 确认 `visible-preview-v6.html` 存在。
7. 通过临时本机静态 HTTP 服务实际打开 v6：
   - 35 个 demo 导航；
   - 35 张总览卡片；
   - 35 个 demo section；
   - Demo 1、21、35 入口切换正常；
   - 无浏览器 console error / warning；
   - 无外部 script / stylesheet URL。
8. 临时静态服务已停止。
9. 已联网核验 Open Design 官方仓库、v0.11.0 Release 和 Windows portable 资产。
10. 已新增并收口 `docs/plans/opendesign-integration-assessment.md`。
11. 已下载并校验 Open Design portable zip。
12. 已解压并成功启动 `Open Design.exe`。
13. 已让 Open Design 识别并选择 `Codex CLI 0.142.0`。
14. 已将 Open Design 工作目录限制为 `external/creative-interaction-lab/`。
15. 已整理项目根目录中的外部 demo、参考图片、实验库、研究材料与简历 PDF。

最终验证：

1. `git diff -- src package.json package-lock.json vite.config.ts .github` 为空。
2. TypeScript `tsc --noEmit` 通过。
3. Vite 6.4.2 production build 通过，共转换 2014 个模块。
4. Open Design 程序、zip 与 Codex CLI 均位于主站仓库外。
5. `external/` 仅提交目录索引，四类大型本地资料继续被 `.gitignore` 隔离。
6. 本轮没有 push。

## 13. 如果中断，下一个 Agent 从哪里继续

1. 先读本文件与 `docs/plans/opendesign-integration-assessment.md`（如果已创建）。
2. 执行 `git status --short --branch`，确认 `external/` 仅由 `README.md` 进入 Git。
3. 确认 Open Design 仍显示 `本地 CLI · Codex CLI · 默认`，工作目录仍为 `creative-interaction-lab`。
4. 如要继续筛选 demo，只在 Open Design 中读取 `external/creative-interaction-lab/`，不要选择主站根目录，不执行自动应用修改。
5. 外部资料已归档到 `external/`；不要删除 `source-demos/`、`visual-references/` 或实验库内容。
6. 不修改 `src/`、AI LAB、主站依赖或部署配置。
