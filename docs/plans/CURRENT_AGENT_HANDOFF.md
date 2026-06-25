---
status: active
type: handoff
module: deployment-unification
last_updated: 2026-06-26
---

# Current Agent Handoff

## 1. 当前任务

统一当前本地最高版本、GitHub Pages 与香港服务器部署，审查并归档服务器旧目录和旧服务，同时完成必要的低风险性能检查。

本轮不是新功能开发，不改视觉，不重构主站。

## 2. 当前 Git 状态

- 分支：`main`
- 本地 HEAD：`2aa770edfc59d9798c8373ab15393c2888444cf9`
- HEAD 摘要：`2aa770e chore: organize external project materials`
- `origin/main`：`2379f06e26388731f91a2c33edcf824226ab7229`
- 本地当前领先远程 2 个提交：
  - `b4a3ba3 docs: finalize opendesign integration assessment`
  - `2aa770e chore: organize external project materials`
- 任务开始时存在未跟踪目录 `网站部署/`。该目录是用户要求读取的历史部署资料，不是主站代码；保留本地，不盲目提交或删除。

## 3. GitHub Pages 当前状态

- 仓库：`https://github.com/tpyy456/ai-art-lab.git`
- 线上地址：`https://tpyy456.github.io/ai-art-lab/`
- 强制 Intro：`https://tpyy456.github.io/ai-art-lab/?intro=1`
- 任务开始时 `origin/main` 落后本地 2 个提交，因此 GitHub Pages 尚未包含本地最高版本。
- 实际 Actions、线上资源 hash、子路由和缓存状态待本轮验证。

## 4. 香港服务器当前已知状态

- 实例：`ai-art-lab-hk`
- 当前目标公网 IP：`43.132.178.15`
- 系统：Ubuntu 24.04
- 前端正式目录：`/var/www/my-site/frontend/dist`
- 源码目录：`/var/www/my-site/repo`
- 后端正式目录：`/var/www/my-site/backend`
- 数据目录：`/var/www/my-site/data`
- 部署目录：`/var/www/my-site/deploy`
- 已知正式服务：
  - Caddy 前端入口
  - `ai-art-lab-api.service`
  - 后端预期监听 `127.0.0.1:3001`
- 服务器实际目录、端口、进程、Caddy 配置与服务状态尚待本轮只读审查。

## 5. “网站部署”历史资料审查

本地目录：`网站部署/`

包含：

- `AGENT_HANDOFF.md`
- `Caddyfile`
- `deploy-frontend.sh`
- `verify-deployment.sh`

结论：

- 正式目标 IP 同样是 `43.132.178.15`，不与当前香港服务器冲突。
- `43.132.78.15` 是曾经误填的历史 IP，只能作为过期记录，不能用于部署。
- 历史 Caddy 配置同时监听 `80` 和 `8080`。
- 历史脚本使用 `/var/www/my-site/repo`、`frontend/dist` 与 `deploy` 目录。
- 资料包含可复用的原子前端替换、Caddy 校验和 SPA 验证经验。
- 资料中关于“仅前端、后端未启动”和 8080 备用入口的状态可能已经过期，不能直接当作当前服务器事实。
- 不在交接文档中记录密码、API Key、Token 或其他凭据。

## 6. 当前是否发现旧部署

本地历史资料表明过去曾使用：

- Caddy `:80, :8080`
- `dist.previous`
- 8080 国内临时备用入口

服务器上是否仍存在旧目录、旧 dist、Vite/serve/PM2、3000/5173/8080 或重复 systemd 服务，尚待只读审查确认。

## 7. 本轮允许修改范围

- `docs/plans/CURRENT_AGENT_HANDOFF.md`
- 部署与交接文档
- `.gitignore` 中本地历史部署资料的隔离规则
- GitHub `main` 推送与现有 Pages workflow 触发
- 香港服务器 `/var/www/my-site/` 正式部署内容
- 香港服务器 Caddy 与 `ai-art-lab-api.service`
- 服务器备份目录 `/var/www/backups`
- 服务器归档目录 `/var/www/archive`
- 必要的低风险性能配置，例如 Caddy gzip/zstd

## 8. 本轮禁止修改范围

- 不改主站视觉和文案
- 不重写 Hero、IntroOverlay 或 DivineDavidCanvas
- 不改 Text Collapse 引擎
- 不新增依赖
- 不把服务器 `.env`、API Key、Open Design 程序、zip 或 exe 加入 Git
- 不直接删除旧服务器目录；先备份，再移动到 archive
- 不覆盖 `/var/www/my-site/backend/.env`
- 不强推或删除 Git 历史
- 不关闭 2222，除非明确确认 22 稳定且不再需要备用端口

## 9. 当前验证进度

已完成：

1. 读取本轮完整任务说明。
2. 核对本地分支、HEAD、`origin/main` 与远程地址。
3. 识别本地领先远程 2 个提交。
4. 读取 `网站部署/` 全部四个文件并完成历史信息分类。
5. 确认历史资料没有提供第二个有效服务器目标。
6. `git fetch origin --prune` 后确认远程未新增提交，本地仍领先 2 个提交。
7. TypeScript `tsc --noEmit` 通过。
8. Vite 6.4.2 production build 通过，共转换 2014 个模块。
9. 已确认 `public/david-source-mobile.webp` 存在，大小 14,910 bytes。

待完成：

1. 提交本轮初始交接文档与本地历史目录隔离规则。
2. 推送本地最高版本并验证 GitHub Actions / Pages。
3. 只读审查香港服务器目录、服务、端口和配置。
4. 创建服务器备份。
5. 统一服务器 repo、前端 dist、后端 service 与 Caddy。
6. 验证 Resume API、mobile WebP、SPA 子路由与性能状态。
7. 更新最终部署文档和本交接文档。

## 10. 如果中断，下一个 Agent 从哪里继续

1. 先读本文件和 `docs/plans/server-deploy-handoff.md`。
2. 执行 `git status --short --branch`、`git rev-parse HEAD` 和 `git rev-parse origin/main`。
3. 不提交或删除 `网站部署/`；它是本地历史部署资料。
4. 如果 GitHub 还未同步，先构建通过后 push `main`。
5. 服务器操作必须先只读盘点，再创建 `/var/www/backups` 备份。
6. 不输出、读取回显或提交服务器 `.env` 的实际值。
7. 最终只保留 Caddy `:80`、API `127.0.0.1:3001`、SSH 22 与临时备用 SSH 2222。
