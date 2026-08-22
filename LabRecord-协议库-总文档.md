# LabRecord 协议库 — 总文档（进展 + 设计，All-in-One）

> **唯一主文档**：一份看全所有进展与设计，直接用于展示。
> 更新：2026-08-21 ｜ 所有状态数字均为本轮实跑得到，非旧文档转抄。
> 本文整合了 `protocol-standard/` 下的分文件（`01-literature-summary.md`、`02-format-standard.md`、`canonical-schema.json`、`03-library-version-design.md`、`presentation-plan.md`、`references-github-issues.md`、`examples/`、`renderer/`）——分文件保留为详细出处。

**一句话定位**：为 LabRecord 建一套**通用的、跨学科的**协议**数据结构 + 管理系统**地基——不是收集协议，而是定义「协议内容本身」的标准（材料+用量、设备+参数、逐步 QC、控制项）并围绕它做库/权限/版本管理。

### 完成度总览

| 部分 | 状态 | 交付 |
|---|---|---|
| Section 1 格式标准 | ✅ | 文献综述 + 选型 + 理由/局限 + 3 示例 |
| Section 2 规范 Schema + 渲染器 | ✅ **v0.3 trimmed** | JSON Schema(v0.3 跨学科 + 裁剪) + 渲染器 + 双校验器 + demo |
| Section 3 库/权限/版本设计 | ✅ 设计稿 | 实体/权限/血缘/审核/归档/API 预览 |
| Section 4 落地实现 | ✅ **参考实现** | 内存 store + 12 端点 API + 权限 + 校验前置 |
| Section 5 解析 / MCP | ⏸ 押后 | LLM 把 PDF/图片→JSON |
| 前端多版方案 | ✅ **v0.3** | 4 版界面均支持 v0.3 字段 |
| 真实 PDF 测试 | ✅ | 前两个 PDF 生成入标准 |
| 跨学科测试集 | ✅ | 15 条经典 + 6 条压力(化学/物理/计算/在体) + v0.3 exemplar |
| 最简化 Core/Extension | ✅ | 参数枚举 28→26、裁 5 字段 + 1 $def、三层分类文档 |
| 平台数据管理调研 | ✅ | protocol.io / ELN / LIMS 借鉴点(已对抗式核验) |

**本轮实跑验证**：`validate.mjs`（引用完整性）+ `validate-schema.mjs`（完整 JSON Schema / ajv）= **30/30 PASS**；schema 现为 **v0.3**（v0.1/v0.2 向后兼容）；`renderer/demo.html` 已渲染 v0.3 字段（software/materialUses/studyDesign/tables/layout/acceptance/repeat…），浏览器 DOM 核验 0 报错。详见 §11。

---

## 目录
1. [任务](#1-任务)
2. [Section 1 — 格式标准](#2-section-1--格式标准)
3. [Section 2 — 规范 Schema + 渲染器](#3-section-2--规范-schema--渲染器)
4. [前端四版方案](#4-前端四版方案请-mentor-选)
5. [Section 3 — 库/权限/版本 管理系统设计](#5-section-3--库权限版本-管理系统设计)
6. [跨学科通用性论证](#6-跨学科通用性论证)
7. [GitHub 借鉴与经验教训](#7-github-借鉴与经验教训--v02-backlog)
8. [现状、验证与运行方式](#8-现状验证与运行方式)
9. [路线图与待拍板项](#9-路线图与待拍板项)
10. [文件地图](#10-文件地图)
11. [v0.3 跨学科更新](#11-v03-跨学科更新)
12. [最简化 — Core/Extension 分层 + 字段裁剪](#12-最简化--coreextension-分层--字段裁剪2026-08-21)
13. [Section 4 — 库管理 API 参考实现](#13-section-4--库管理-api-参考实现2026-08-21)

---

## 1. 任务

### 1.1 来源与方向纠偏
- 任务来自 Google Doc **「To Do 0822 — Protocol Library」**。
- 与师姐交流后确认（**师姐/沟通定的**）：
  - 目标是**搭数据结构 + 管理系统**地基；**不收集大量 protocol**（具体列表师姐之后给）。
  - 结构必须**通用、跨学科**。
  - 之前做的「关于协议的元数据目录」方向不对；要做「**协议内容本身**」的标准。
  - **我现在做 Section 1 + 2**（是 Section 3/4 的地基）；**MCP/解析 Section 5 押后**。

### 1.2 原始五部分

| # | 部分 | 内容 | 归属 | 优先级 |
|---|---|---|---|---|
| 1 | Protocol Format Standard | 文献调研→选/改/设计格式→理由+局限→3 个示例重写 | 地基 | **现在做** |
| 2 | Canonical Schema | 格式固化成 JSON Schema→3 个 JSON→JSON→协议 渲染器 | 地基 | **现在做** |
| 3 | Library/Ownership/Version | 三库归属权限、引用/fork/版本/血缘、提交—审核—批准、归档 | 后台设计 | 已出设计稿 |
| 4 | Library Implementation | DB+API+网站：保存前校验、旧数据迁移、三视图、按版本建 run | 后台本体 | 待做 |
| 5 | Parser API | LLM 把 PDF/DOCX/图片/文本→JSON | MCP 类 | 押后 |

### 1.3 追加要求
用 `test_protocol/` 前两个 PDF 作真实测试数据生成；前端做**几版方案**给 mentor 选；参考 GitHub 优秀项目；（5am 定时复查——**已取消**，脚本留存未注册）。

---

## 2. Section 1 — 格式标准

### 2.1 文献调研结论（详见 `01-literature-summary.md`）
把领域按「人读 → 机器可执行」分四层：
1. **最小信息报告清单**（MIQE/MIAME/ARRIVE/CONSORT/STRENDA）——规定论文里必须*披露*什么，散文式。
2. **期刊发表格式**（Nature Protocols / STAR / Bio-protocol / Current Protocols / JoVE）——人读文章，结构只来自小标题。
3. **机器可读/本体表示**（schema.org HowTo、Bioschemas LabProtocol、SMART Protocols、EXACT、ISA、OBI、PROV-O）——可发现/可互操作，但不可执行。
4. **可执行协议语言**（protocols.io 类型化步骤、Autoprotocol、Aquarium、LabOP；CWL 属计算）。

**关键发现**：没有任何一个标准同时做到「可读 + 类型化结构 + 可执行 + FAIR 溯源」——这正是我们要补的位。各发表格式的**共同骨架**高度一致（Purpose/Materials/Equipment/Procedure/Timing/Troubleshooting/Expected results/Safety），这是我们人读版式的直接依据。最贴近的字段依据是 Giraldo 2018（PeerJ, DOI 10.7717/peerj.4795）的**17 个数据要素**。

### 2.2 选定格式：**adapt（改造，而非照搬或全新造）**（详见 `02-format-standard.md`）
- **采纳**期刊共同版式骨架（人读）；
- **采纳** protocols.io 的类型化步骤组件思路 + EXACT 的「动作+参数」；
- **采纳** Giraldo 17 要素 + FAIR（DOI/版本、机器可读 license、plan-vs-execution 溯源）；
- **新增** `needsReview` 一等标记（推广自 MIQE 的 Essential/Desirable 分级）——来源没写的值标出、绝不编造。

**固定版式（渲染顺序）**：
```
# 标题  + 徽章(family·category·version·estimated time·needsReview 数·status)
Purpose*  /  Scope  /  Estimated time  /  Before You Begin
## Materials and Reagents*   表: Name | Amount/Working conc. | Specification/Grade | Vendor/Cat#
## Equipment and Settings    表: Name | Model | Settings
## Procedure*                按 Phase 分组; 表: Step | Action | Parameters | Expected Result/QC | Critical Notes
## Controls / Expected Outputs / Troubleshooting / Safety / Limitations
## Sources and License*       file/DOI/URL + license(+verified)
```
Procedure 五列与 schema 字段 1:1 对应；参数带**单位与范围**（`value`+`valueMax`），直接修掉「室温/3–5 min」这类欠规范问题。

**理由段落（Section 1.3 交付）**：现有标准要么好写但机器不可用（期刊格式），要么严谨但太重/太偏执行（本体/机器人语言）；我们保留科学家信任的期刊骨架，同时给每步一个类型化、带单位、带范围、可 schema 校验的 JSON 支撑，覆盖对复现关键的 17 要素，把 license/溯源做成一等字段，并用 `needsReview` 让解析器/人标注未知而非编造。**局限**：v0.1 没有表格类一等对象（三联标准曲线表压缩进步骤备注）、没有本体术语绑定（试剂/动作名是自由文本，非 ChEBI/EXACT）、没有单位量纲校验、分支/依赖只做了轻量（`dependsOn`/`decisionPoint`），刻意保留未来向那些更重标准映射的空间。

### 2.3 五个示例（`examples/`）
| 示例 | 来源 | 归属 |
|---|---|---|
| Western blot | **你的真实 PDF** `9-Westernblotting-2026.pdf` | 必做示例 |
| RT-qPCR | 对齐 MIQE 指南 | 必做示例 |
| Cell culture（贴壁传代）| 标准做法 | 必做示例 |
| Gel Filtration | **真实 PDF** `1-Gel Filtration Procedures.pdf` | 追加测试 |
| Protein Concentration | **真实 PDF** `2-…2025.pdf`（三联 A280/BCA/Bradford）| 追加测试 |

**内嵌示例（WB 片段，展示「同一份数据两种形态」）**：

*人读（渲染后节选）*
> **Western Blot** · `Protein` · v0.1 · ⏱ ~2 days · `9 needs review` · draft
> **Materials（节选）**：Transfer buffer — 25 mM Tris, 200 mM glycine, 20% methanol, 0.1% SDS, pH 8.5；Primary antibody mouse α-Strep — 1:5000 `needs review`
> **Procedure｜Transfer**：9. Run constant-current transfer → `CURRENT I=area×0.8 mA` `TIME 40–60 min` → *Expected:* proteins transferred → *Note:* rinse with TBS 3–5 s

*对应 JSON（step s9 节选）*
```json
{ "id":"s9","number":9,"phase":"Transfer","action":"Run constant-current transfer; then rinse membrane with TBS.",
  "equipmentIds":["e2"],"materialIds":["m6"],
  "parameters":[
    {"type":"current","value":null,"unit":"mA","rawText":"I (mA) = gel area (cm^2) × 0.8"},
    {"type":"time","value":40,"valueMax":60,"unit":"min","rawText":"40-60 min"}],
  "expectedResult":"Proteins transferred to membrane." }
```

---

## 3. Section 2 — 规范 Schema + 渲染器

### 3.1 Canonical Schema 全字段（`canonical-schema.json`，draft 2020-12，全局 `additionalProperties:false`）

**顶层**（必填 `*`）：`schemaVersion*`(="0.1") · `metadata*` · `materials*` · `equipment*` · `steps*` · `controls` · `expectedOutputs` · `troubleshooting` · `safety` · `biosafetyLevel` · `limitations` · `sources*` · `provenance`

| 对象 | 必填 | 字段 |
|---|---|---|
| `metadata` | title, purpose | title, protocolId, version, family, category, purpose, scope, estimatedTime, beforeYouBegin[], tags[] |
| `material` | id, name | id(`^m\d+$`), name, amount(num\|null), amountMax, unit, workingConcentration, specification, vendor, catalogNumber, rawText, needsReview, sourceReferences[] |
| `equipment` | id, name | id(`^e\d+$`), name, model, settings, needsReview, sourceReferences[] |
| `step` | id, action | id(`^s\d+$`), number, phase, action, optional, materialIds[], equipmentIds[], parameters[], dependsOn[], decisionPoint, expectedResult, criticalNotes, safetyNotes, needsReview, sourceReferences[] |
| `parameter` | type, rawText | type(枚举), value(num\|null), valueMax, unit, rawText, needsReview |
| `control` | name | name, description, needsReview |
| `troubleshooting` | problem | problem, cause, solution |
| `source` | id, kind | id(`^src\d+$`), kind(file/article/standard/book/url/kit-insert/other), title, file, doi, url, license, licenseVerified |
| `sourceReference` | sourceId | sourceId, page, excerpt |
| `provenance` | — | versionId, parentVersionId, derivedFromVersionId, contentHash, library(public/private/lab), owner, status(draft/submitted/approved/changes_requested/published/archived) |

### 3.2 参数类型（跨学科枚举，20 种 + 兜底）
`time · temperature · volume · speed · concentration · mass · ratio · pH · count · length · area · pressure · wavelength · frequency · voltage · current · force · energy · dataSize · other`
——覆盖物理/化学/生物/计算；没列到的量用 `other` + 自由 `unit`，保证 schema 不因学科而改。

### 3.3 渲染器与校验器（`renderer/`）
- `renderer.js`：框架无关核心 `renderProtocolHTML(protocol)`（浏览器/Node 通用）；`ProtocolRenderer.jsx`：React 版（供网站集成）。
- `validate.mjs`：0 依赖校验器——**结构 + 引用完整性**（`materialIds/equipmentIds/dependsOn/sourceReferences` 必须能解析到真实 id；参数类型在枚举内；枚举从 schema 读取，保持同步）。
- `demo.html`：自包含演示，5 个协议实时渲染 + 「看 JSON 源」+ 「看 Schema」。
- **实跑**：`validate.mjs` = **5/5 PASS**（WB 18 步 / qPCR 12 / cell 10 / gel 12 / protein 12）。

---

## 4. 前端四版方案（请 mentor 选）

打开 `renderer/design-options.html`，顶部切 4 版，**同一份 JSON、四种界面**：

| 方案 | 形态 | 适用场景 |
|---|---|---|
| **Document** | 期刊文章式，表格版式（默认） | 阅读、审阅、发布、打印存档 |
| **Checklist · Run** | 每步一张带勾选框的卡片 | **在实验台边做实验**（run-mode 手感，protocols.io 风） |
| **Timeline** | 纵向时间线/步进器，按 Phase 里程碑 | 快速看整体流程与阶段 |
| **Compact · Print** | 左材料/设备侧栏 + 右紧凑编号步骤 | 快速参考、A4 打印 |

四版都保留 `needsReview` 高亮与类型化参数——差别只在**呈现**。选定后我按那版收敛主渲染器。

---

## 5. Section 3 — 库/权限/版本 管理系统设计（`03-library-version-design.md`）

**原则**：① 学科无关（只管 `ProtocolVersion` 记录，不看学科字段）；② 发布版**不可变**、内容寻址（`contentHash`）；③ 溯源永不丢；④ 公共更新不波及他人已依赖内容；⑤ run 绑定精确版本。

**实体**：`User / Lab / LabMembership / Protocol / ProtocolVersion / SavedReference / LabSubmission / Review / Run`。其中 `ProtocolVersion.{body,status,parentVersionId,derivedFromVersionId,license,contentHash}` 与 canonical schema 的 `provenance` 块**一一对应**（同一份真相）。

**三库与权限**：
| 库 | Owner | 谁能改 | 保存行为 |
|---|---|---|---|
| Public | LabRecord | 仅管理员 | 用户**保存引用**到精确版本（不复制） |
| Private | 个人 | 本人 | 编辑公共协议 → 生成**私有 fork** |
| Lab | 实验室 | editor 改草稿，reviewer/owner 批准 | 公共/私有提交 → 生成**实验室草稿** |
权限在 `library`+归属/成员级强制，**不看协议内容**，故跨学科一致；他人私有协议/无关 lab 协议不可见（终测项 5）。

**流转 / 血缘**：
```
PUBLIC v3 ──save ref──► SavedReference（仍指向 v3）
   └─fork──► PRIVATE fork v1 ──edit──► v2 ──submit──► LAB draft ──review──► approved LAB v1 ──run──► Run#104+快照
```
规则：草稿可变、保存即冻结（盖 `contentHash`）；`parentVersionId` 串同一血缘；`derivedFromVersionId` 记跨血缘来源；公共更新**新建版本**、旧引用仍指旧版并提示「有新版」；每次批准/每次 run 都绑定精确 `versionId`+`contentHash`。

**审核状态机**：`draft → submitted → approved | changes_requested`；**已批准版的编辑必须新建版本 + 重新审核**；`Review` 行是不可变审计。

**Run**：从精确版本创建并存 body 快照；新建 lab 版本**不影响**旧 run（终测项 4）。

**归档**：被引用/fork/run 的版本**只墓碑化**（`status=archived`）不硬删，`contentHash/sources/license` 仍可解析；license 随 body 走，fork/提交不能剥离溯源。

**API 预览（Section 4 起点）**：`POST /protocols`（校验→建草稿）、`/versions`（冻结）、`/save-ref`、`/fork`、`/submissions`、`/review`、`/runs`、`GET /history`——每个写路径先跑 Section 2 校验器，杜绝畸形/编造值入库。

---

## 6. 跨学科通用性论证

1. **Schema 无学科字段**：只有 `metadata/materials/equipment/steps/controls/expectedOutputs/troubleshooting/safety/sources/provenance` 通用槽。
2. **参数 = 类型化 + 单位自由文本 + `other` 兜底**：v0.3 已 **28 类**枚举（新增 `amountOfSubstance/resistance/capacitance/conductance/power/flowRate/titer/config` 等）覆盖物理/化学/生物/计算。
3. **示例本身跨学科**：蛋白(WB)/分子(qPCR)/细胞(传代)/分离(层析)/定量(A280/BCA/Bradford)。
4. **换学科怎么落**：有机合成→参数用 `temperature/pressure/time/mass`、expectedResult=产率/纯度；生信→materials=数据集、equipment=软件/算力、参数用 `dataSize/count/time`；电生理/物理→`voltage/current/frequency/force/energy`。**同一套结构、同一渲染器、同一管理系统，无需为学科改 schema。**

---

## 7. GitHub 借鉴与经验教训 → v0.2 backlog（`references-github-issues.md`）

调研 LabOP / ISA / Opentrons / ORD / protocols.io / BioSchemas / CWL 的真实 issue（均有可点 URL）。

**我们已对齐（别人踩过的坑）**：严格 `additionalProperties:false` + 校验器；必填极少、大量可选；plan 与 execution 分离（provenance + Section 3 的 run）；JSON 原生而非 RDF。

**v0.2 待改**：
| 教训 | v0.2 动作 |
|---|---|
| 别存裸数字，绑 value+unit(+precision)；"N/A"≠0≠null | 参数升级为 `Quantity{value,unit,min/max,precision}` |
| 材料 identity/amount/role 三分离（ORD #511） | 材料只存 identity，用量放到步骤里的 usage |
| schema 版本是契约，要迁移策略（Opentrons v1→v8） | 加 MIGRATION 说明 + `MAX_SUPPORTED_VERSION` |
| 发严格 schema 供 CI/IDE + JSON-LD 语义 | 增补 JSON-LD `@context` 对接 schema.org/OBO |

**两点做了就领先所有项目**：把范围/公差/不确定度做成一等 `Quantity`；几乎所有字段默认可选（protocols.io 真实语料只有 4 字段可靠非空）。

---

## 8. 现状、验证与运行方式

**本轮实跑**（schema v0.3）：
- `validate.mjs`（引用完整性）+ `validate-schema.mjs`（完整 JSON Schema / ajv）→ **30/30 PASS**（5 baseline v0.1 + 15 test-set v0.2 + 6 stress v0.2 + 4 v0.3 exemplar）。
- `renderer/demo.html` 渲染 v0.3 字段（software/materialUses/studyDesign/tables/layout/acceptance/repeat），浏览器 DOM 核验 0 报错。
- `renderer/design-options.html` 四版前端；`canonical-schema.json` 解析通过。

**怎么跑**：
```bash
node protocol-standard/renderer/validate.mjs          # 校验全部协议 JSON
node protocol-standard/serve.mjs                       # 起本地服务
#   → http://localhost:4173/renderer/demo.html            主渲染 demo
#   → http://localhost:4173/renderer/design-options.html  四版前端方案对比
```
或直接双击 `demo.html` / `design-options.html`（自包含，file:// 也能开）。

---

## 9. 路线图与待拍板项

| 事项 | 现状 | 谁定 |
|---|---|---|
| **Section 4 落地**（DB+API+网站，按 §5 的 API 起步） | 待做，下一步大头 | 范围/技术栈——你/师姐 |
| **protocol 列表** | 未收到 | 师姐提供 |
| **前端选哪版** | 4 版就绪 | 你 + mentor |
| **Schema v0.2**（§7 backlog） | 已列 | 我可继续 |
| 5am 定时复查 | 已取消（脚本留存未注册） | — |

---

## 10. 文件地图
- **主文档（本文）**：`LabRecord-协议库-总文档.md`
- 任务/汇报：`任务与进度说明.md`、`protocol-standard/presentation-plan.md`
- 标准与理由：`protocol-standard/01-literature-summary.md`、`02-format-standard.md`
- 数据结构：`protocol-standard/canonical-schema.json`
- 示例：`protocol-standard/examples/*.{md,json}`
- 渲染/演示：`protocol-standard/renderer/{renderer.js,ProtocolRenderer.jsx,validate.mjs,demo.html,design-options.html}`
- 管理系统设计：`protocol-standard/03-library-version-design.md`
- GitHub 借鉴/坑：`protocol-standard/references-github-issues.md`
- 跨学科测试与缺口：`protocol-standard/schema-coverage-report.md`、`schema-stress-test-report.md`
- 数据管理借鉴：`protocol-standard/references-data-management.md`
- 版本契约/变更：`protocol-standard/SCHEMA-CHANGELOG.md`
- 校验器：`protocol-standard/renderer/{validate.mjs, validate-schema.mjs, analyze-fields.mjs}`
- 全量分析器：`protocol-standard/renderer/analyze-all.mjs`（30 文件 + v0.3 字段覆盖）
- 迁移脚本：`protocol-standard/renderer/migrate-trim.mjs`
- Core/Extension 分类：`protocol-standard/core-extension-spec.md`
- 库管理 API：`protocol-standard/library/{store,validator,permissions,api,server}.mjs`
- 跨学科示例：`protocol-standard/examples/{test-set,stress-set,v03-demos}/*.json`

---

## 11. v0.3 跨学科更新（2026-08-21 增补）

面向"协议不止生物、要全面通用"，做了两步并据结果把 schema 升到 **v0.3**（全部 additive，v0.1/v0.2 向后兼容）。

**测试驱动**：
- 15 条经典生物协议编码入库（`schema-coverage-report.md`）：双校验器 20/20；证明 samples/containers/tables/inputs/outputs 重度使用，`precision`/`media` 未用（裁剪候选）。
- 6 条跨学科压力测试（`schema-stress-test-report.md`）：化学/物理/计算/在体各一个硬案例，逼出"生物之外"的缺口。

**v0.3 按学科补的字段**（详见 `SCHEMA-CHANGELOG.md`）：
- **计算**：`software[]` + step `softwareIds`/`command`；`sample.kind=dataset`+`dataType`；参数 `config`+`valueText`。
- **化学**：step `materialUses[]`（用量绑材料 + `equivalents`/`limitingReagent`）；material `smiles`/`molecularWeight`；`amountOfSubstance`；`perUnit`/`formula`；`comparator`。
- **物理**：参数 `resistance/capacitance/conductance/power/flowRate/titer`；`step.repeat`（循环/扫描/until）。
- **在体**：`studyDesign`（分组/N/随机/盲法/时间点/统计）+ `compliance`（IACUC/IRB/知情同意/废物）——修掉"拿 biosafetyLevel 当伦理"。
- **通用**：step `acceptanceCriteria`（结构化 QC/判据）；`container.layout`（孔位+析因）；`equipment.rawText`、`parameter.sourceReferences`（溯源对齐）。

**验证**：全部 **30** 文件双校验器通过；四类学科各一个 v0.3 exemplar 端到端证明（`v03-demos/`：计算 `rnaseq-pipeline`、化学 `organic-synthesis`、在体 `pk-animal-study`、物理 `patch-clamp`），把 v0.2 的 `other`/notes/workaround-`tables` 全部替换成原生构造；渲染器已支持并显示这些新字段（DOM 核验 0 报错）。

**最简化**：已完成——见 §12。

---

## 12. 最简化 — Core/Extension 分层 + 字段裁剪（2026-08-21）

基于 `renderer/analyze-all.mjs` 对全部 **30** 个文件跑字段使用率统计，数据驱动裁剪。

### 裁掉的字段

| 字段 | 使用率 | 处理 |
|---|---|---|
| `parameter.precision` | 4 实例 / 1 文件 | rawText 已含 ±N 信息，删除字段 |
| `parameter.type: length` | 0 实例 | 从 enum 移除 |
| `parameter.type: area` | 0 实例 | 从 enum 移除 |
| `step.decisionPoint` | 6/30 文件 | 文本迁移到 `branches[0].condition`，删除字段 |
| `step.media` + `$defs/media` | 0/30 文件 | 整体删除 |

**结果**：参数类型枚举 28→**26** 个；schema 减少 5 个属性 + 1 个 $def。迁移脚本：`renderer/migrate-trim.mjs`。

### Core / Extension / Rare 三层分类（见 `core-extension-spec.md`）

- **CORE**（≥60% 文件使用）：11/13 顶层块、全部 metadata 基本字段、step 的 number/phase/materialIds/equipmentIds/parameters/expectedResult/criticalNotes/inputIds/outputIds 等
- **EXT**（20–59%）：storage/hazard/vendor/pausePoint/branches/comparator/formula/optional 等
- **RARE**（<20%）：studyDesign/compliance/software/smiles/dependsOn/materialUses/softwareIds/command 等

RARE 字段保留在 schema 中——它们在专业协议（化学/物理/在体/计算）里是必要的，只是整体使用率低。

### 验证

迁移后双校验器 **30/30 PASS**（7 个文件被脚本更新）。demo.html 已重新构建（11 protocols）。

---

## 13. Section 4 — 库管理 API 参考实现（2026-08-21）

基于 §5 (Section 3) 设计，用纯 Node.js（零外部依赖）实现了完整的协议库管理参考系统。

### 架构

| 模块 | 文件 | 职责 |
|---|---|---|
| 数据层 | `library/store.mjs` | 内存 Map 存储；SHA-256 contentHash；immutability 执行；lineage (parentVersionId/derivedFromVersionId) |
| 校验层 | `library/validator.mjs` | 复用 canonical-schema.json 枚举 + ajv 全 JSON Schema 校验；引用完整性检查 |
| 权限层 | `library/permissions.mjs` | Section 3 §2 权限矩阵：8 个动作 × 6 角色 |
| API 层 | `library/api.mjs` | 自建路由（无 Express），12 个端点，`X-User-Id` 认证 |
| 入口 | `library/server.mjs` | 端口 4174，种子数据（admin + 2 user + 1 lab + 2 公开协议） |

### 12 个 API 端点

| 方法 | 路径 | 功能 |
|---|---|---|
| `POST` | `/api/protocols` | 创建 draft（校验前置） |
| `GET` | `/api/protocols/:id` | 获取协议 + 当前版本 |
| `POST` | `/api/protocols/:id/versions` | 冻结 draft → 不可变版本（+contentHash） |
| `GET` | `/api/protocols/:id/history` | 版本链 + 血缘图 |
| `POST` | `/api/public/:versionId/save-ref` | 创建 SavedReference（无拷贝） |
| `POST` | `/api/public/:versionId/fork` | Fork 到私有库（derivedFrom 设置） |
| `POST` | `/api/labs/:labId/submissions` | 提交到 Lab（进入审核） |
| `POST` | `/api/submissions/:id/review` | 批准/退回 |
| `POST` | `/api/versions/:versionId/runs` | 创建 Run（+ body 快照） |
| `GET` | `/api/views/public` | 公开库视图 |
| `GET` | `/api/views/my` | 个人私有协议 |
| `GET` | `/api/views/lab/:labId` | Lab 协议 |

### 关键设计落地

- **校验前置**：每个写入路径先过 `validateProtocol(body)` → 拒绝不合格 JSON
- **不可变性**：已冻结/已批准版本不能修改（`status !== 'draft'` → 403）
- **权限矩阵**：Public(anyone view) / Private(owner only) / Lab(RBAC: viewer/editor/reviewer/owner)
- **血缘追踪**：fork 和 submission 都设 `derivedFromVersionId`；版本链用 `parentVersionId`
- **Run 快照**：每个 Run 存一份 body snapshot，不受后续版本影响

### 验证

服务器启动成功（端口 4174），种子 2 条公开协议（qPCR + cell-culture）。公开视图 API 正确返回 2 条协议（含 contentHash）。权限层正确拦截未认证请求（401）。
