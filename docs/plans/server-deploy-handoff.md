---
status: active
type: handoff
module: hong-kong-backend-api
last_updated: 2026-06-20
---

# 香港服务器后端 API 部署交接

## 目标

为 Resume 页 JD 匹配提供同源后端接口：

```text
POST /api/resume-match
```

前端只请求 `/api/resume-match`，不直接请求模型服务。

## 安全规则

- 真实 API Key 只能写入香港服务器 `/var/www/my-site/backend/.env`。
- 不要把真实 API Key 写入前端、Git、文档、README、AGENT_HANDOFF、终端日志或浏览器 console。
- 文档中统一使用 `<AI_API_KEY>` 占位。
- 不使用 `VITE_API_KEY`。
- 不在服务日志里打印用户 JD 原文或完整模型请求体。

## 本地仓库新增文件

```text
backend/server.js
backend/package.json
backend/.env.example
backend/ai-art-lab-api.service.example
```

`.env.example` 是占位模板，真实 `.env` 不应进入 Git。

## 服务器目标目录

```text
/var/www/my-site/backend
```

建议复制或同步以下文件到该目录：

```text
server.js
package.json
```

并在服务器手动创建：

```text
/var/www/my-site/backend/.env
```

`.env` 示例：

```text
AI_API_KEY=<AI_API_KEY>
AI_API_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
PORT=3001
```

## 启动验证

在服务器后端目录内执行：

```bash
node server.js
```

本地回环测试：

```bash
curl -X POST http://127.0.0.1:3001/api/resume-match \
  -H "Content-Type: application/json" \
  -d '{"jd":"测试 AI 训练师岗位，需要数据标注、评测和规则文档能力"}'
```

如果 `.env` 中没有 `AI_API_KEY`，接口应返回明确错误，不应泄露任何 Key。

## systemd

示例文件：

```text
backend/ai-art-lab-api.service.example
```

部署时复制为：

```bash
sudo cp ai-art-lab-api.service.example /etc/systemd/system/ai-art-lab-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now ai-art-lab-api.service
sudo systemctl status ai-art-lab-api.service
```

service 文件通过 `EnvironmentFile=/var/www/my-site/backend/.env` 读取环境变量，不要把 Key 写进 service 文件。

## Caddy

当前前端静态站配置需要增加 `/api/*` 代理：

```caddy
:80, :8080 {
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

修改后验证：

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
curl -X POST http://127.0.0.1/api/resume-match \
  -H "Content-Type: application/json" \
  -d '{"jd":"测试 AI 训练师岗位，需要数据标注、评测和规则文档能力"}'
```

## 当前阻塞

2026-06-20 当前环境执行 SSH 连通性检查时，`43.132.178.15:22` 在 banner exchange 阶段超时，无法完成服务器文件同步、`.env` 创建、systemd 配置和 Caddy reload。

下一次继续时，请先确认：

1. 腾讯云防火墙是否仍放行 TCP 22。
2. 当前网络是否可连香港服务器 SSH。
3. 是否有安全的交互式服务器终端用于手动写入真实 `.env`。
