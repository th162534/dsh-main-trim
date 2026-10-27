# dsh-main-trim

给 DSH 主会话（`standard` preset）收窄工具面的插件。

## 它解决什么

双面插件（宿主工具 + 浏览器 UI 绑在同一个 Loader 条目里）不能靠 `disabled: true` 裁剪：
关掉一行，UI 一起消失。`dsh-main-trim` 不关插件，只在主会话的 preset 里追加一行，
由它在该会话作用域调用 `ctx.tools.restrict({ deny })`。

## 边界（实测）

`dsh-tools` 的限制只过滤**继承层**（global + 祖先），本作用域自己注册的工具豁免。
主会话是 root agent，profile 根层插件的工具几乎都在它自己的层里，因此点名它们会以
`names unknown global tool` 失败——本插件会跳过并在日志里列出，不影响启动。

能挡住的典型例子：挂在更上层的工具族（例如 `agent_soul_*`）。

## 用法

1. `dsh plugin --profile desktop add link:<本目录>`（作为普通依赖安装，不带 bundle 行）
2. `node scripts/sync-standard.mjs --apply`：从 `app.asar` 现取内置 `standard` preset，
   在 profile `cordis.patch.yml` 生成一个按 id 覆盖的 `preset-standard` 裸行，末尾追加
   `main-trim` 行。升级 DSH 后重跑该脚本即可同步新内置插件。
3. 名单在 `deny.json`；日志写 `<HOME>/.dsh/main-trim.log`。

## 注意

- 覆盖行进 profile 时必须是**裸行**（`- id: preset-standard`），写成 `- insert:` 会追加第二个
  声明，重复 preset id 会导致加载失败。
- 回滚：删掉 profile 里 `# === main-trim BEGIN ===` 到 `END` 的整块，再移除依赖。
