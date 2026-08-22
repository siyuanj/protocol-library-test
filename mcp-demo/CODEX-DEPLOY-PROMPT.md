# Codex 部署提示词（LabRecord MCP demo → 国内可访问公网地址）

> 把下面「提示词正文」整段复制给带 computer use 的 Codex。

---

## 提示词正文

目标：把 LabRecord MCP demo 的网站部署到一个**国内可访问**的公网地址，挂在用户自有 Cloudflare 域名 `jiangsiyuantest.me` 下，使**另一台电脑上的 agent** 能用一条 `claude mcp add --transport http <url>/mcp --header "Authorization: Bearer <token>"` 直接连上并导入 protocol。

### 现状（已由前序会话完成，勿重复造轮子）
- 代码在本地 `D:\大学\暑研\7-31 protocol library\mcp-demo\`，已推送私有 GitHub 仓库 `siyuanj/labrecord-mcp-demo`（分支 `main`）。
- 应用两部分：
  - `website.mjs`：Express，默认监听 `127.0.0.1:4100`。提供库页 `/`、REST `/api/*`、以及**原生 MCP 端点 `POST /mcp`**（Streamable HTTP，用 `Authorization: Bearer <token>` 认证并绑定实验室）。
  - `mcp-server.mjs`：可选的 stdio 适配器（本地用）。
- 已开 `trust proxy`，经隧道访问时 `/api/connect` 会**自动**用公网 https 主机名生成连接命令。
- 已验证：`npm run verify`（stdio）10/10、`npm run verify:http`（HTTP）7/7，含「无 token 连接被 401 拒绝」。
- Demo token（写死，仅演示）：Wang Lab = `lbr_sk_live_7f3a9c2e8b14d6f05a1c9e3b7d82f6a4`，Lee Lab = `lbr_sk_live_2d9b4e1a6c8f3057e2a9d14b8c6f5e03`。

### 关键约束 / 已踩过的坑（别再踩）
- **`trycloudflare.com` 和 `*.workers.dev` 在国内被 DNS 污染**（实测：本机默认 DNS 解析「does not exist」，用 1.1.1.1 / 8.8.8.8 正常）。所以**必须用自有域名 `jiangsiyuantest.me`**（该域名在本机默认 DNS 正常解析）。**不要用 Quick Tunnel。**
- `a100-primary`（ssh alias 已配，key `~/.ssh/id_ed25519_a100_cluster`，登录 root，hostname `bms-46497684`）：**没装 Node**；有 git、cloudflared。它已有一个监控隧道 `/etc/cloudflared/config.yml`（tunnel id `8878a8a5-39b0-4af0-9109-57bdf24eab6d`，ingress `jiangsiyuantest.888.moe → 127.0.0.1:8765`，systemd `cloudflared-a100-monitor.service`）。**不要改这个共享配置，别碰监控。** 该盒子只有 `credentials.json`、没有账号 cert，所以在盒子上无法建 DNS 路由。
- 监控的公网自定义域名 `monitor.jiangsiyuantest.me` 走一个 Cloudflare Worker，且只放行 GET/HEAD；MCP 需要 POST/GET/DELETE + 流式，**别塞进那个限方法的 Worker**，给 LabRecord 单独建隧道/主机名。

### 唯一需要浏览器/人工的步骤（用 computer use 完成）
- `cloudflared tunnel login` → 浏览器登录用户的 Cloudflare → 选 `jiangsiyuantest.me` 这个 zone → cert 落到 `~/.cloudflared`。

### 推荐路径 A（最快；跑在这台 Windows PC 上，隔离于 A100）
1. 在 `mcp-demo\` 里 `npm install` 后 `npm start`（网站监听 `127.0.0.1:4100`）。
2. `cloudflared tunnel login`（浏览器，选 `jiangsiyuantest.me`）。
3. `cloudflared tunnel create labrecord`。
4. `cloudflared tunnel route dns labrecord labrecord.jiangsiyuantest.me`。
5. 写 config（ingress：`labrecord.jiangsiyuantest.me → http://127.0.0.1:4100`，末尾 `service: http_status:404`），`cloudflared tunnel run labrecord`（或装成 Windows 服务/计划任务常驻）。
6. 验证：
   - `curl https://labrecord.jiangsiyuantest.me/api/schema` 返回 200；浏览器打开该域名能看到库页；
   - `curl "https://labrecord.jiangsiyuantest.me/api/connect?lab=wang-lab"` 的 `command` 字段应为
     `claude mcp add --transport http labrecord https://labrecord.jiangsiyuantest.me/mcp --header "Authorization: Bearer lbr_sk_live_7f3a9c2e8b14d6f05a1c9e3b7d82f6a4"`。
7. 在「另一台电脑」的 Claude Code 跑那条 `claude mcp add`，新开会话，`/mcp` 应看到 4 个工具，说「帮我把这个 PDF 导入 LabRecord」验证端到端；网页 ~2 秒出现新 draft。

### 可选路径 B（常开；跑在服务器上）
在一台**常开**机器（不是按月租到期的训练盒子；训练1/训练2 的租期已过）装 Node LTS，`git clone` 私有仓库（需 gh/git 认证）或 scp 过去，`npm ci`，以 systemd 跑 `website.mjs`（绑 `127.0.0.1`），再建**独立**的 cloudflared 隧道 + `labrecord.jiangsiyuantest.me` 路由（步骤同上，**别动监控隧道**）。

### 部署后加固（不是演示阻塞项，但要跟进）
- 把写死的 token 移到环境变量/密钥文件（参考监控项目 `/etc/a100-monitor.env` mode `0600` 的做法）。
- `website.mjs` 里 MCP transport 现为 `enableDnsRebindingProtection:false`；固定域名后改用 `allowedHosts`。
- `/api/connect` 明文吐 token 仅演示；生产要登录后按用户发**可吊销**的 per-user token。
- 保持源服务只绑 `127.0.0.1`，永远靠隧道出去，不直接暴露公网。

### 完成后
回报公网 URL + 连接命令，并在 `docs/STATUS.md` 增量追加一节（做了什么 / 真实状态 / 未验证 / 待用户定）。
