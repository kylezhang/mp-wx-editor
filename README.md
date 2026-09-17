# wechat-mdx-editor

纯本地微信公众号 MDX 排版编辑器 — 打开即用，零后端、零广告、零统计。内容存储在浏览器本地，编辑完成一键复制富文本粘贴到公众号。

## 致谢与来源

本项目基于 **[maqi1520/mdx-notes](https://github.com/maqi1520/mdx-notes)** 改造而来。

> 衷心感谢原作者 **马琪斌（[@maqi1520](https://github.com/maqi1520)）** 创造了这个优秀的 MDX 微信排版工具，本项目的核心编辑、预览、排版与复制能力全部来自原项目。
>
> 原项目官网：<https://mdxnotes.com/>

原项目是「开源前端 + 作者闭源后端」的 SaaS 架构。2026 年 9 月实测发现其后端域名 `mdx-api.maqib.cn` 与官方站当时使用的 uniCloud 域名均已停服（DNS 返回 NXDOMAIN），在线编辑器无法再加载文章内容（官方站自身同样受影响，`/post?id=demo` 返回 404）。

本 fork 将编辑器改造为**纯本地模式**：移除全部后端调用与第三方广告/统计脚本，数据存储在浏览器 localStorage，使编辑器重新可用，并可在任意静态服务器上自部署。

## 与上游的差异

| 能力 | 上游 maqi1520/mdx-notes | 本项目 |
| --- | --- | --- |
| 后端依赖 | 需要作者的闭源后端（已停服） | **零后端**，纯浏览器本地运行 |
| 数据存储 | 云端账户体系 | 浏览器 localStorage（自动保存，1 秒防抖） |
| 广告与统计 | GTM + Google Analytics + AdSense | **全部移除**，零第三方请求 |
| 登录 / 注册 / Fork / 模板市场 | 有（依赖后端） | 已移除（含页面入口与相关代码） |
| MDX 编辑 + 实时预览 | ✅ | ✅ 完整保留 |
| 一键复制到公众号（富文本 HTML） | ✅ | ✅ 完整保留（CSS 内联、`<div>`→`<section>` 微信适配） |
| 主题切换 / 布局切换 / 响应式预览 | ✅ | ✅ 完整保留 |
| Export PDF / Save As | ✅ | ✅ 完整保留 |
| 字数统计 / MDX·CSS·Config 三 Tab | ✅ | ✅ 完整保留 |

> ⚠️ **行为变化说明**
>
> - 首页 `/` 直接是编辑器，不再是产品介绍页。
> - `/post?id=<任意值>` 不再拉取云端文章，一律打开本地草稿（因后端已停服，原本也只能得到 404，故无功能退化，但旧分享链接的语义已改变）。
> - `/template`、`/login`、`/register`、`/dashboard/*` 等依赖后端的页面未改造：入口已从界面移除，但直接访问 URL 仍会打开，功能失效（其中 `/template` 会显示 Application error）。
> - 数据仅存于本机浏览器：换浏览器、换设备、清除缓存都会导致草稿丢失，无云端同步。

## 本地构建与部署

### 环境要求

- Node.js ≥ 18（实测 v25.8.2 可用）
- npm（上游使用 yarn.lock；npm 亦可安装，但注意 `npm install` 会改写 yarn.lock 的 registry 格式，提交前请 `git checkout yarn.lock` 还原）

### 构建步骤

```bash
git clone https://atomgit.com/zkxw2008/wechat-mdx-editor.git
cd wechat-mdx-editor
npm install --legacy-peer-deps

# 关键：API 基址置空（纯本地模式不需要后端）
# 注意：仓库 .env.example 中写的 NEXT_PUBLIC_API_URL 是上游文档错误，
# 代码 src/utils/helpers.ts 实际读取的变量名是 NEXT_PUBLIC_SITE_API_URL
echo 'NEXT_PUBLIC_SITE_API_URL=' > .env.local

npx next build   # 静态导出，产物在 out/
```

### Caddy 部署示例

```caddyfile
mp.example.com {
    encode gzip
    root * /path/to/wechat-mdx-editor/out

    @nextstatic path /_next/static/*
    header @nextstatic Cache-Control "public, max-age=31536000, immutable"

    try_files {path} {path}.html {path}/index.html
    file_server
}
```

任何能托管静态文件的服务器（Nginx、Vercel、Netlify、对象存储等）均可部署，无需常驻 Node 进程。

## 主要改动

| 文件 | 改动说明 |
| --- | --- |
| `src/app/post/App.tsx` | 固定 demo 身份；删除 `/api/auth/post_get` 调用与 404 错误分支；优先恢复 localStorage 草稿，无草稿时加载项目自带但原本零调用方的 `getDefaultContent()` 默认文档 |
| `src/app/page.tsx` | 首页即编辑器（原营销页依赖 `useTemplates` 调用死后端） |
| `src/components/Pen.jsx` | 本地保存改为合并元信息 `{...initialContent, ...content}`，修复上游 bug（原只写 html/css/config 三键，丢失 `_id/title/author_id`，表现为刷新后 Fork 按钮消失）；移除依赖后端的 Fork 功能 |
| `src/components/Header.tsx` | 移除模板入口与登录/用户信息入口 |
| `src/app/layout.tsx` | 移除 GTM / Google Analytics / AdSense 三个第三方脚本 |
| `src/components/AdContainer.tsx` | 删除（改造前即为无任何引用的死代码，且依赖已移除的 AdSense 全局脚本） |
| `.env` | `NEXT_PUBLIC_SITE_API_URL` 置空（原值指向已停服后端） |
| `public/manifest.json` | 修正图标路径（上游指向不存在的 `apple-touch-icon-192.png`） |

完整改动详见 commit [`73199d1`](https://github.com/kylezhang/mdx-notes/commit/73199d1076c3fdc8ce971eefb021cbd16c82d224)。

## 许可证

本项目及全部改造代码以 **GPL-3.0** 发布，与原项目声明的许可证一致。

> 说明：上游仓库的 GitHub 元数据声明许可证为 GPL-3.0，但仓库内未附带许可证全文文件（`license.path` 为空）。为符合 GPL-3.0 对分发衍生作品的要求，本仓库补充了标准许可证文本，见 [LICENSE](./LICENSE)。

---

*Made with ❤️ on top of [@maqi1520](https://github.com/maqi1520)'s [mdx-notes](https://github.com/maqi1520/mdx-notes)*
