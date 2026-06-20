---
status: active
type: plan
module: resume-api-and-david-mobile-loading
last_updated: 2026-06-20
---

# Current Agent Handoff

## 1. 当前任务目标

本轮同时处理两件事：

1. Resume 页 JD 匹配从本地 demo 优先接入香港服务器后端 API：`POST /api/resume-match`。
2. 优化首页 Divine David 在移动端首次进入时加载慢的问题，降低等待大图 decode 和 Canvas 采样造成的空白感。

本轮不是视觉重设计，不重写大卫 Canvas 引擎，不改 Text Collapse、Projects、About、Contact 内容。

## 2. 当前本地 HEAD

- 分支：`main`
- 当前 HEAD：`73002b5dee1c55469d3c31873d17393ffa6658a3`
- 远端：`https://github.com/tpyy456/ai-art-lab.git`
- 任务开始时工作区：待复核

## 3. 当前 GitHub Pages 状态

- GitHub Pages 地址：`https://tpyy456.github.io/ai-art-lab/`
- 上一轮已将 GitHub Pages 构建改为 `npm run build -- --mode github-pages`
- `vite.config.ts` 当前按 mode 区分：
  - 默认生产构建：`base: '/'`
  - GitHub Pages 构建：`base: '/ai-art-lab/'`
- 本轮重点不是 GitHub Pages，而是香港服务器同源 `/api/resume-match`。

## 4. 当前香港服务器部署状态

- 腾讯云实例：`ai-art-lab-hk`
- 地区：中国香港三区
- 公网 IP：`43.132.178.15`
- 系统：Ubuntu 24.04.4 LTS
- SSH 用户：`ubuntu`
- Node.js：`v22.22.3`
- npm：`10.9.8`
- Caddy：`2.6.2`
- 前端目录：`/var/www/my-site/frontend/dist`
- 源码目录：`/var/www/my-site/repo`
- 后端预留：`/var/www/my-site/backend`
- 数据预留：`/var/www/my-site/data`
- 部署脚本预留：`/var/www/my-site/deploy`
- 当前入口：
  - `http://43.132.178.15`
  - `http://43.132.178.15:8080`
- 当前 Caddy 静态站配置：

```caddy
:80, :8080 {
    root * /var/www/my-site/frontend/dist
    try_files {path} /index.html
    file_server
}
```

本轮如部署后端，需要将 `/api/*` 反向代理到 `127.0.0.1:3001`，同时保留 SPA fallback。

## 5. 本轮允许修改范围

前端允许修改：

- `src/App.tsx`
- `src/features/resume/components/RoleMatchAnalyzer.tsx`
- `src/features/resume/ResumePage.tsx`
- `src/features/divine-david/DivineDavidCanvas.tsx`
- `src/features/intro/IntroOverlay.tsx`
- `src/features/intro/intro.css`
- `src/features/home/Hero.tsx`
- `src/styles.css`

后端允许新增到仓库内的安全骨架：

- `backend/server.js`
- `backend/package.json`
- `backend/.env.example`

允许新增资源：

- `public/david-source-mobile.webp`

允许更新文档：

- `docs/plans/CURRENT_AGENT_HANDOFF.md`
- `docs/plans/server-deploy-handoff.md`

服务器允许创建或修改：

- `/var/www/my-site/backend/server.js`
- `/var/www/my-site/backend/package.json`
- `/var/www/my-site/backend/.env`
- `ai-art-lab-api.service`
- Caddy `/api/*` 反向代理配置

## 6. 本轮禁止修改范围

- 不要修改 Text Collapse 引擎：
  - `src/features/lab/text-collapse/collapseEngine.ts`
  - `src/features/lab/text-collapse/matrix.ts`
  - `src/features/lab/text-collapse/types.ts`
- 不要改 Projects 内容结构
- 不要改 Contact 内容
- 不要改 About 内容
- 不要改页面整体视觉方向
- 不要重写 Divine David Canvas 引擎
- 不要新增重型依赖
- 不要把图片转成 base64 塞进 JS
- 不要把 API Key 写入任何 Git 文件

## 7. API Key 安全规则

必须遵守：

1. 不要把 API Key 写进前端代码。
2. 不要把 API Key 写进 Git 提交。
3. 不要把 API Key 写进文档、`AGENT_HANDOFF`、`README`、部署说明。
4. 不要在终端日志、浏览器 console、服务日志里打印 API Key。
5. API Key 只允许放在香港服务器后端 `.env` 文件里。
6. 文档和示例中只能写占位：`<AI_API_KEY>`。
7. 前端只请求 `/api/resume-match`，不能直接请求模型接口。
8. 不使用 `VITE_API_KEY`。

如果需要写 `.env`，只能写到服务器后端目录，并且不能让真实 Key 出现在命令回显或日志里。

## 8. 当前验证进度

- 已读取本轮任务说明。
- 已确认当前分支为 `main`，当前 HEAD 为 `73002b5`。
- 已确认 API Key 不应进入前端、仓库、文档或日志。
- 已新增本地后端 API 骨架：
  - `backend/server.js`
  - `backend/package.json`
  - `backend/.env.example`
  - `backend/ai-art-lab-api.service.example`
- 已新增服务器部署交接文档：`docs/plans/server-deploy-handoff.md`。
- 已将 Resume `RoleMatchAnalyzer` 改为优先请求 `/api/resume-match`，失败时保留本地 fallback。
- 已生成移动端大卫轻量资源：`public/david-source-mobile.webp`。
- 已将首页大卫资源改为移动端优先加载 WebP，并在图片解码/采样前绘制轻量占位。
- 已验证：
  - TypeScript `tsc --noEmit` 通过。
  - Vite production build 通过。
  - 后端在未配置 `AI_API_KEY` 时返回安全的 503 JSON 错误。
  - 本地移动端视口中会预加载并请求 `david-source-mobile.webp`。
- 仍未完成：
  - 香港服务器部署。
  - 服务器 `.env` 写入真实 Key。
  - systemd 服务启动。
  - Caddy `/api/*` 反向代理上线验证。
- 阻塞原因：
  - 2026-06-20 尝试 SSH `ubuntu@43.132.178.15` 时在 banner exchange 阶段超时，无法进入服务器执行部署。

## 9. 如果中断，下一个 Agent 从哪里继续

1. 先检查 `git status --short`，确认是否已有未提交修改。
2. 优先阅读本文件，不要从旧移动端任务继续。
3. 检查是否已经新增 `backend/`、`public/david-source-mobile.webp` 和 Resume API 逻辑。
4. 检查是否具备安全的服务器 SSH/写 `.env` 条件；如果不能安全写真实 Key，不要把 Key 写入命令或文档。
5. 如果 SSH 恢复，按 `docs/plans/server-deploy-handoff.md` 部署后端、写入服务器本地 `.env`、启动 systemd、更新 Caddy 并验证：
  - `GET /api/health`
  - `POST /api/resume-match`
  - Resume API 成功与 fallback
  - 移动端首页大卫首屏出现速度
  - TypeScript / Vite build
