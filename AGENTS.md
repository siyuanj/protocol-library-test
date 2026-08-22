# Protocol Atlas 工作规则

## 数据边界

- `data/sessions/<session-id>/result.json` 是 crawler 的权威输出；一个 crawler 只能修改自己的 session 目录。
- 协调器页面可以读取所有 session 结果，但不要建立由 crawler 并发写入的中心索引。
- 只保存元数据、来源链接、DOI、许可和简短筛选说明；不得把协议正文、表格、图片、视频或 PDF 拷贝进仓库。

## 静态页面

- `archive-dashboard.html`：本地归档总览，读取所有固定 session 路径。
- `index.html`：协议目录，读取已写入的代表记录和备选记录。
- `process-manager.html`：收集队列与 prompt copier。
- 页面必须通过本地 HTTP 服务打开，不能依赖 `file://` 读取 JSON。

## 验证与交接

- 改动归档格式、队列或数据文件后，运行 `node data/validate-session-results.mjs`。
- 非平凡改动完成后，增量更新 `docs/STATUS.md`；只有稳定架构或使用方式变化时更新 `README.md`。
