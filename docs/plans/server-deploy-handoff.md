---
status: active
type: handoff
module: hong-kong-production-deployment
last_updated: 2026-06-26
---

# 香港服务器生产部署交接

## 生产入口

```text
http://43.132.178.15/
```

当前没有域名和 HTTPS。旧的 `:8080` 入口已停止，不再作为正式链接。

## 正式结构

```text
/var/www/my-site/repo
/var/www/my-site/frontend/dist
/var/www/my-site/backend
/var/www/my-site/data
/var/www/my-site/deploy
/var/www/backups
/var/www/archive
```

## 当前版本

2026-06-26 统一部署基线：

```text
0d619535b634476a0b70cdf0aedc915dce27dcd5
```

服务器 repo 在部署时已与 `origin/main` 同步。后续仅文档提交可直接 fetch/reset；功能代码变化必须重新 `npm ci && npm run build` 并同步 dist。

## 前端

- Vite production build
- Caddy 静态托管
- SPA fallback：`try_files {path} /index.html`
- 正式前端目录：`/var/www/my-site/frontend/dist`
- 不使用 Vite preview、npm dev、serve 或 PM2

更新流程：

```bash
cd /var/www/my-site/repo
git fetch origin --prune
git status
git reset --hard origin/main
npm ci
npm run build
rsync -a --delete dist/ /var/www/my-site/frontend/dist/
```

执行前必须创建备份。不要在不确认路径时执行 `--delete`。

## 后端

- service：`ai-art-lab-api.service`
- 目录：`/var/www/my-site/backend`
- 监听：`127.0.0.1:3001`
- 健康检查：`GET /api/health`
- Resume：`POST /api/resume-match`
- `.env` 权限：600

同步：

```bash
rsync -a --delete \
  --exclude ".env" \
  /var/www/my-site/repo/backend/ \
  /var/www/my-site/backend/

sudo install -m 0644 \
  /var/www/my-site/repo/backend/ai-art-lab-api.service.example \
  /etc/systemd/system/ai-art-lab-api.service

sudo systemctl daemon-reload
sudo systemctl restart ai-art-lab-api
sudo systemctl status ai-art-lab-api --no-pager
```

当前 backend 只使用 Node 内置模块，没有 `package-lock.json` 和第三方依赖，不要在该目录强行运行 `npm ci`。

真实 API Key 只允许存在于服务器 `/var/www/my-site/backend/.env`。不要读取回显、复制到终端日志、文档或 Git。

## Caddy

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

更新配置后：

```bash
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo systemctl status caddy --no-pager
```

## 当前服务与端口

```text
22                    SSH
2222                  临时备用 SSH
80                    Caddy
127.0.0.1:3001        Resume API
```

不再监听：

```text
8080
3000
5173
```

`caddy-api.service` 是 Caddy 软件包自带的 disabled/inactive 备用 unit，不是第二个网站或后端，不需要删除。

## 备份与归档

本轮创建：

```text
/var/www/backups/my-site-before-unify-20260626-025424.tar.gz
/var/www/backups/Caddyfile-before-unify-20260626-025424
```

历史备份：

```text
/var/www/backups/my-site-before-api-deploy-20260620-152547.tar.gz
```

旧前端归档：

```text
/var/www/archive/frontend-dist-prev-20260626-025424
```

不要直接 `rm` 这些文件。确认新版本长期稳定并获得用户明确要求后再清理。

## 验证命令

```bash
curl -I http://127.0.0.1/
curl -I http://127.0.0.1/resume
curl -I http://127.0.0.1/about
curl -I http://127.0.0.1/projects
curl -I http://127.0.0.1/contact
curl -I http://127.0.0.1/lab/text-collapse
curl http://127.0.0.1/api/health
curl -I http://127.0.0.1/david-source-mobile.webp
sudo ss -tulpn
```

2026-06-26 验证结果：

- 全部正式路由 HTTP 200
- Resume API 返回真实结构化结果
- mobile WebP HTTP 200
- gzip 已启用
- Caddy active
- API service active
- repo clean and synced

## 管理通道

从当前本地网络访问 SSH 22/2222 会卡在 banner exchange，但服务器内部 sshd 正常监听两个端口。

可用替代方案：

```text
腾讯云控制台 → 轻量应用服务器 → ai-art-lab-hk → 登录 → OrcaTerm
```

2222 暂时保留。后续确认 22 在常用网络稳定后，再进行 SSH 安全收口。

## 已知事项

- 尚未绑定域名，没有 HTTPS。
- 根依赖审计仍有 1 个 high severity 报告，未运行破坏性 `npm audit fix`。
- 音频资源尚未接入，AudioDock 会显示 `AUDIO SOURCE MISSING`。
- GitHub Pages 子路由使用 `404.html` SPA fallback，浏览器刷新可用，但 HTTP 状态仍由 GitHub Pages 返回 404。
