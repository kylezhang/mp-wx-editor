# mp-wx-editor

纯本地微信公众号 MDX 排版编辑器 — 打开即用，零后端、零广告、零统计。用 MDX 写文章，实时预览排版效果，编辑完成后一键复制富文本粘贴进公众号后台，格式不丢。

## 在线使用

**<https://mp.op.oafdev.cn/>** — 无需登录，打开即是编辑器。

## 功能特性

| 能力 | 说明 |
| --- | --- |
| MDX 编辑 + 实时预览 | 左侧 Monaco 编辑器，右侧沙箱预览；MDX 中可直接嵌入 React 组件与图表 |
| 一键复制到公众号 | CSS 自动内联、`<div>` 转换为 `<section>` 微信适配，复制后可直接粘贴进公众号编辑器 |
| MDX / CSS / Config 三区编辑 | 正文、样式、配置分离，样式与配置可独立调整 |
| 主题与布局切换 | 明暗主题，桌面 / 平板 / 手机响应式预览 |
| Export PDF / Save As | 导出 PDF，或另存文档 |
| 字数统计 | 实时显示正文字数 |
| 自动保存 | 内容写入浏览器 localStorage，1 秒防抖 |
| 纯本地运行 | 零后端、零第三方请求、无广告无统计，可离线自部署 |

## 本地构建与部署

### 环境要求

- Node.js ≥ 18
- npm 或 yarn

### 构建步骤

```bash
git clone https://atomgit.com/zkxw2008/mp-wx-editor.git
cd mp-wx-editor
npm install --legacy-peer-deps

# API 基址置空（纯本地模式不需要后端）
# 注意：代码 src/utils/helpers.ts 读取的变量名是 NEXT_PUBLIC_SITE_API_URL，
# 仓库 .env.example 中写的 NEXT_PUBLIC_API_URL 不会被读取
echo 'NEXT_PUBLIC_SITE_API_URL=' > .env.local

npx next build   # 静态导出，产物在 out/
```

### Caddy 部署示例

```caddyfile
mp.example.com {
    encode gzip
    root * /path/to/mp-wx-editor/out

    @nextstatic path /_next/static/*
    header @nextstatic Cache-Control "public, max-age=31536000, immutable"

    try_files {path} {path}.html {path}/index.html
    file_server
}
```

任何能托管静态文件的服务器（Nginx、Vercel、Netlify、对象存储等）均可部署，无需常驻 Node 进程。

## 使用须知

- **路由**：`/` 即编辑器；`/post` 与 `/post?id=<任意值>` 同样打开本地草稿，URL 参数仅用于兼容既有链接。
- **数据存储**：草稿只存在于当前浏览器的 localStorage 中。换浏览器、换设备、清除缓存都会导致内容丢失，且无云端同步 — 重要文章请自行保留 MDX 源文件。
- **历史遗留路由**：`/template`、`/login`、`/register`、`/dashboard/*` 界面已无入口，直接访问 URL 会打开页面但功能不可用（`/template` 显示 Application error）。
- **代码改动记录**：完整的文件级改动说明见本仓库 git 提交历史，此处不再重复罗列。

## 许可证

以 **GPL-3.0** 发布，许可证全文见 [LICENCE](./LICENCE)。

## 致谢

本项目的编辑、预览、排版与复制能力来自 **马琪斌 [@maqi1520](https://github.com/maqi1520)** 的 **[mdx-notes](https://github.com/maqi1520/mdx-notes)**（<https://mdxnotes.com/>），在此基础上做了纯本地化改造（移除后端依赖与第三方广告 / 统计脚本）。感谢原作者。
