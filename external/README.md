# External Materials

`external/` 只存放主站之外的实验、研究和参考实现，不参与正式网站构建。

## 目录

```text
external/
  creative-interaction-lab/
    外部 35-demo 交互实验库，统一入口为 visible-preview-v6.html。
  interaction-research/
    早期交互研究文档和 React 实验草稿。
  source-demos/
    开始界面与神性大卫的原始完成版、历史版本和交接资料。
  visual-references/
    本地视觉参考图片，不参与构建。
```

## 规则

- 不从 `src/` 直接 import 此目录。
- 不把外部 demo 直接接入正式 AI LAB。
- 不在这里存放账号、Token、API Key 或服务器密码。
- 大型实验素材保持本地隔离，不进入 Git。
- 未来迁移某个 demo 时，先复制到独立沙盒并单独验收。

Open Design 程序本体安装在项目外：

```text
C:\Users\acer\Desktop\tools\open-design-0.11.0\
```

Open Design 当前配置：

- Coding Agent：`Codex CLI 0.142.0`
- 工作目录：`C:\Users\acer\Desktop\个站\external\creative-interaction-lab`
- Codex CLI 可执行文件：`C:\Users\acer\.local\bin\codex.exe`

它不是主站依赖，也不参与 `npm run build`。当前只授权读取隔离实验目录，没有选择主站根目录，也没有执行生成或应用修改。
