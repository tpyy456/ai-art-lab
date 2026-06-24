---
status: active
type: plan
module: opendesign-and-lab-isolation-assessment
last_updated: 2026-06-24
---

# Current Agent Handoff

## 1. 当前任务

本轮只进行 Open Design / GitHub 外部工具与 `creative-interaction-lab` 的隔离读取、安装评估和规划。

本轮不是正式接入主站，不迁移 demo，不修改现有 Web 实验室 / AI LAB，不改变页面、路由、构建或服务器配置。

## 2. 当前 Git 状态

- 分支：`main`
- HEAD：`2379f06e26388731f91a2c33edcf824226ab7229`
- HEAD 摘要：`2379f06 feat(resume): add backend match api and mobile david preload`
- `origin/main`：`2379f06e26388731f91a2c33edcf824226ab7229`
- 本地主分支与 `origin/main` 同步。
- 工作区存在未跟踪目录：`探索/`
- `探索/` 内包含外部研究材料与 `creative-interaction-lab`；本轮将其视为用户提供的隔离资料，只读审查，不删除、不移动、不直接整体提交。

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

- 当前定位：`探索/creative-interaction-lab/`
- Git 状态：位于未跟踪的 `探索/` 目录中，没有参与主站提交。
- 当前统一预览候选：`探索/creative-interaction-lab/visible-preview-v6.html`
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
- 当前只评估和安装 portable，不安装 MCP、不修改 Codex 配置。

## 10. 隔离安装状态

- 尚未 clone 或安装 Open Design；文档收口后进入 portable 下载与启动阶段。
- 目标安装目录：`C:\Users\acer\Desktop\tools\open-design-0.11.0\`。
- 安装目录位于主站仓库之外，不进入 Git。
- 不使用 setup.exe，除非 portable 被实际证明无法使用。
- 不修改根 `package.json`、根 `package-lock.json`，不把工具放进 `src/`。

## 11. 本轮修改边界

允许：

- 读取项目和外部实验库。
- 更新本文件。
- 新增 `docs/plans/opendesign-integration-assessment.md`。
- 在明确定位 Open Design 后，使用 `tools/opendesign/` 或 `external/opendesign/` 做隔离 clone / 安装 / smoke test。

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
3. 识别未跟踪的 `探索/creative-interaction-lab/`。
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

待完成：

1. 最终确认文档阶段没有修改 `src/`、根依赖与部署配置。
2. 提交文档收口 commit，不纳入未跟踪的 `探索/`，不 push。
3. 下载并解压 Open Design portable 到项目外目录。
4. 启动验证 Open Design。
5. 整理项目根目录的外部研究资料：优先把未跟踪的 `探索/` 归档到清晰的 `external/` 结构；不移动已被历史文档广泛引用的 `两个demo/` 与 `c参考图片/`，除非后续单独确认。
6. 运行主站 build，证明整理与外部安装没有污染正式构建。

## 13. 如果中断，下一个 Agent 从哪里继续

1. 先读本文件与 `docs/plans/opendesign-integration-assessment.md`（如果已创建）。
2. 执行 `git status --short --branch`，保留并尊重未跟踪的 `探索/`。
3. 从只读审查 `探索/creative-interaction-lab/README.md`、`HANDOFF.md`、`HANDOFF_CODEX_V6_RESCUE.md` 和 `visible-preview-v6.html` 继续。
4. Open Design portable 若尚未安装，从官方 v0.11.0 portable zip 继续，不运行 installer。
5. 文件管理只处理明确安全的未跟踪资料；不要删除或擅自移动 `两个demo/`、`c参考图片/`。
6. 不修改 `src/`、AI LAB、主站依赖或部署配置。
