---
status: completed
type: handoff
module: deployment-unification
last_updated: 2026-06-26
---

# Current Agent Handoff

## 1. 本轮任务

统一本地、GitHub Pages 与香港服务器版本；审查服务器目录、服务和端口；保留回滚备份；完成必要的低风险性能收口。

本轮没有开发新功能，没有修改视觉，没有重构主站。

## 2. Git 与 GitHub Pages

- 分支：`main`
- 本轮部署基线：`0d619535b634476a0b70cdf0aedc915dce27dcd5`
- 基线摘要：`docs: start deployment unification handoff`
- 远程：`https://github.com/tpyy456/ai-art-lab.git`
- 本地领先远程的 3 个提交已推送。
- GitHub Actions run：`28192315275`
- Actions build：success
- Actions deploy：success
- GitHub Pages：`https://tpyy456.github.io/ai-art-lab/`
- 最新线上入口 JS：`/ai-art-lab/assets/index-JuS68ZUb.js`
- `?intro=1` 可强制显示 Intro。
- GitHub Pages 子路由会返回平台级 HTTP 404，但部署的 `404.html` 会正常加载 React 应用；浏览器直接刷新 `/resume` 和 `/projects` 已验证可用。

## 3. “网站部署”历史资料

本地 `网站部署/` 已完整读取并保留，未删除、未提交。

包含：

- `AGENT_HANDOFF.md`
- `Caddyfile`
- `deploy-frontend.sh`
- `verify-deployment.sh`

结论：

- 当前正确服务器 IP 是 `43.132.178.15`。
- `43.132.78.15` 是历史误填 IP，不能用于部署。
- 历史资料保存了 `/var/www/my-site` 目录结构、原子前端替换和 Caddy 验证经验。
- 历史 `:80, :8080` 配置已过期；8080 已在本轮停止监听。
- `.gitignore` 已加入 `网站部署/`，避免把本地历史资料或潜在敏感信息误提交。

## 4. 服务器审查结果

实例：

- 名称：`ai-art-lab-hk`
- 公网 IP：`43.132.178.15`
- 系统：Ubuntu 24.04
- Node.js：v22.22.3
- npm：10.9.8
- Caddy：2.6.2

正式目录：

- repo：`/var/www/my-site/repo`
- 前端：`/var/www/my-site/frontend/dist`
- 后端：`/var/www/my-site/backend`
- 数据：`/var/www/my-site/data`
- 部署资料：`/var/www/my-site/deploy`

实际发现：

- 正式站点目录：1 个，`/var/www/my-site`
- 前端服务：1 个，Caddy
- 后端服务：1 个，`ai-art-lab-api.service`
- Node 后端仅监听 `127.0.0.1:3001`
- 没有 Vite、npm dev、serve、PM2、Nginx、3000 或 5173 服务
- `caddy-api.service` 是 Caddy 包自带的 disabled/inactive 备用 unit，不是第二个站点服务，未删除
- 旧前端副本：`/var/www/my-site/frontend/dist.prev`

## 5. 备份与归档

修改服务器前已创建：

- `/var/www/backups/my-site-before-unify-20260626-025424.tar.gz`
- `/var/www/backups/Caddyfile-before-unify-20260626-025424`

已有历史备份继续保留：

- `/var/www/backups/my-site-before-api-deploy-20260620-152547.tar.gz`

旧前端没有删除，已归档为：

- `/var/www/archive/frontend-dist-prev-20260626-025424`

服务器剩余磁盘约 41 GB，备份与归档空间充足。

## 6. 统一部署结果

服务器 repo 已执行：

```text
git fetch origin --prune
git reset --hard origin/main
npm ci
npm run build
```

结果：

- TypeScript 通过
- Vite 6.4.2 build 通过
- 2014 modules transformed
- 前端已通过 `rsync --delete` 同步到正式 dist
- 后端已通过 `rsync --delete --exclude .env` 同步
- `/var/www/my-site/backend/.env` 确认仍存在，未读取、未覆盖
- 后端没有第三方依赖，因此没有在 backend 目录强行执行缺少 lockfile 的 `npm ci`
- systemd unit 已按仓库示例同步
- `ai-art-lab-api.service` 已 restart，状态 active
- Caddy 已 validate、format、reload，状态 active

## 7. 当前 Caddy 配置

```caddy
:80 {
	encode gzip zstd

	handle /api/* {
		reverse_proxy 127.0.0.1:3001
	}

	handle {
		root * /var/www/my-site/frontend/dist
		try_files {path} /index.html
		file_server
	}
}
```

当前监听：

- 22：SSH
- 2222：临时备用 SSH
- 80：Caddy
- 127.0.0.1:3001：Resume API

已停止监听：

- 8080
- 3000
- 5173

## 8. 线上验证

香港服务器以下地址均为 HTTP 200：

- `/`
- `/?intro=1`
- `/resume`
- `/about`
- `/projects`
- `/contact`
- `/lab/text-collapse`
- `/david-source-mobile.webp`
- `/api/health`

Resume API：

- `POST /api/resume-match` 返回 200
- 返回 `summary / score / strengths / gaps / suggestions`
- 实测 score 为 85

静态资源：

- `david-source-mobile.webp` 返回 `image/webp`
- 大小 14,910 bytes
- 主 JS 返回 `Content-Encoding: gzip`

移动端：

- 使用 390 × 844 视口检查 GitHub Pages 与香港服务器
- `?intro=1` 显示 Intro
- 首页和 `/about`、`/projects`、`/resume`、`/contact`、`/lab/text-collapse` 没有横向溢出
- 浏览器控制台没有站点 error/warn

## 9. 性能检查

已完成：

- mobile David WebP 已存在并在线返回 200
- Caddy gzip/zstd 已启用
- 旧 8080 入口已停
- 没有公开 Vite dev server
- 没有旧 Node 前端服务
- Resume API 只在用户执行分析时发起模型请求，不影响首页

没有修改：

- DivineDavidCanvas
- IntroOverlay
- Hero
- Text Collapse
- 页面视觉与文案

已知但未改：

- `public/audio/home-ambient.mp3` 不存在。
- AudioDock 仅执行一次轻量 HEAD 探测，`preload="none"`，随后显示 `AUDIO SOURCE MISSING`；不是当前主要性能瓶颈，因此本轮没有为了消除一个占位请求而改功能代码。
- `npm ci` 报告 1 个 high severity vulnerability，本轮没有运行可能引入破坏性升级的 `npm audit fix`。

## 10. 管理通道

- 公网 SSH 22/2222 从当前本地网络仍卡在 banner exchange。
- 腾讯云 OrcaTerm WebShell 可正常管理服务器。
- 22 与 2222 在服务器内部均正常监听。
- 2222 按要求继续保留，后续完成 SSH 安全收口时再关闭。

## 11. 本轮修改边界确认

- 未修改 `src/`
- 未修改 `package.json` / `package-lock.json`
- 未修改 Vite 或 GitHub Actions workflow
- 未上传 `.env`、API Key、Open Design 程序、zip 或 exe
- 未删除任何回滚备份

## 12. 后续接手

1. 先读本文件和 `docs/plans/server-deploy-handoff.md`。
2. 日常更新使用 `git push origin main`，GitHub Pages 自动部署。
3. 香港服务器更新时先备份，再在 `/var/www/my-site/repo` 同步 `origin/main` 并 build。
4. 后端同步必须继续排除 `.env`。
5. 目前正式入口只使用 `http://43.132.178.15/`，不要再发布 8080 链接。
6. 后续优先事项是绑定域名和 HTTPS，其次才是关闭备用 SSH 2222。
