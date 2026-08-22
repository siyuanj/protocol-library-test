# Protocol Atlas 本地协议归档库

这是一个 metadata-first 的生物实验 protocol collection。本仓库保存经 crawler 整理的协议元数据、来源链接、DOI、许可证据与简短筛选说明，而不保存协议正文或原始 PDF。

## 页面

- `archive-dashboard.html`：归档总览，汇总收集进度、来源网站与每个 session 的本地状态。
- `index.html`：可筛选的协议目录，展示每个分类的代表记录及筛选过的备选。
- `process-manager.html`：43 个固定 collection packet 的管理与 prompt 复制页面。
- `public-site/`：独立的 GitHub Pages 精选预览站，只含 30 条人工筛选的元数据及来源/许可证据链接，不公开 crawler 数据或 protocol 正文；已部署至 <https://siyuanj.github.io/protocol-atlas/>。

三个页面都实时读取 `data/sessions/<session-id>/result.json`。在仓库根目录启动本地 HTTP 服务后访问，例如：

```powershell
python -m http.server 4176 --bind 127.0.0.1
```

然后打开 `http://127.0.0.1:4176/archive-dashboard.html`。直接用 `file://` 打开 HTML 时，浏览器不能可靠读取本地 JSON。

## 数据和验证

- session 数据规范：`data/session-result.schema.json`
- crawler 数据约定：`data/README.md`
- 数据质量检查：`node data/validate-session-results.mjs`

每个 crawler 仅写入自己负责的 `data/sessions/<session-id>/result.json`。页面根据 `collection-session-batches.js` 的固定队列读取这些路径，因此无需维护并发写入的中心索引。

当前跨会话进展见 `docs/STATUS.md`。
