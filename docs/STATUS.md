# 当前交接状态

## PDF 与官方链接的独立转化对照（2026-08-22 / 本地）

### 这次做了什么

- **用户决定**：为检验信息压缩是否影响转化，既有 7 份 001 JSON 保留为 PDF 基线；从附件中提取出的官方 source link 及其官方关联页面另行独立转化。链接组不得读取附件 PDF 正文或既有 JSON。
- **助手执行**：新增 7 份 `*-link.json`（PCR/GAM/EGB/NAP/PWP/MC/QQC）。数据字段只来自官方链接或其直接关联的厂商/机构页面；例如 QIAGEN 和 NanoDrop 的厂商链接本身指向官方说明书，未回看附件。官方页面未给出的载体专属克隆条件、限制酶温度/时间、样品与空白液具体身份等均省略或标记 `needsReview`。
- **助手执行**：`protocol-standard/renderer/viewer.html` 的原有 7 项全部改为 `codex-pdf/`；新增一一对应的 `codex-link/` 项，供 Viewer 中并列对照。

### 现在真实状态（本次实跑）

- 链接组 7 份 JSON 合计 **38 steps、37 materials、12 equipment、8 tables、9 sources、30 needsReview**（本次 PowerShell 汇总）。
- `node protocol-standard/renderer/validate.mjs`：**46/46 protocols valid**。
- `node protocol-standard/renderer/validate-schema.mjs`：**46/46 files pass full JSON Schema**。
- 本地 HTTP 验证：`renderer/viewer.html` 返回 **HTTP 200**、含 **14** 个 `codex-pdf/` 或 `codex-link/` 条目；7 份 link JSON 均返回 **HTTP 200** 且可被 JSON 解析。

### 卡在哪

- 无当前技术阻塞。

### 还没验证的（下一个会话从这里怀疑）

- 这是一项来源路径对照，并不单独证明“PDF 转化”造成信息丢失：链接页面可能是不同版本、不同产品变体或不同粒度的资料。后续比较应按字段覆盖率、数值一致性、`needsReview` 数和来源版本逐项核对。
- 当前只验证了 Viewer 文件和 JSON 的 HTTP 可加载性，尚未对 14 个下拉项逐一做浏览器交互与视觉回归。
- 所有新来源仍为 `licenseVerified:false`；本仓库未保存或镜像链接页面/说明书正文。

### 要用户定的

- 对照结论通过后，是否以 `codex-link/` 组替换 PDF 组，或长期保留两组作为来源差异测试集。

## 压缩包各分类 001 协议转化 + Viewer 接入（2026-08-22 / 本地）

### 这次做了什么

- **用户决定**：将目标从 PCR-002 至 PCR-006 调整为 `protocol_pdfs.zip` 中每个分类的 `001` 协议；要求遵循 LabRecord canonical schema v0.3、更新 Viewer 并推送 GitHub。
- **助手执行**：完整阅读 `protocol-standard/canonical-schema.json` 和既有 PCR-001 样例后，从压缩包逐份提取文本并渲染页面目检；新增 6 份 v0.3 JSON：
  - `examples/gam-001-crispr-cas9-sgrna-design-cloning.json`
  - `examples/egb-001-agarose-gel-electrophoresis.json`
  - `examples/nap-001-plasmid-dna-miniprep.json`
  - `examples/pwp-001-protein-extraction-ripa-tper.json`
  - `examples/mc-001-restriction-enzyme-digestion.json`
  - `examples/qqc-001-nanodrop-nucleic-acid-quantification.json`
- **助手判断**：压缩包的 `PCR-001_standard_pcr.pdf` SHA-256 为 `083D242F...C7E31E625`，与既有 JSON 所引本地 PDF SHA-256 `919CF20C...8608A33F` 不同；为保持此批来源一致，已重写 `examples/pcr-001-standard-pcr.json` 为压缩包中的 NEB Q5 高保真 PCR 版本，而不是保留旧 Taq 通用版。
- **助手执行**：`renderer/viewer.html` 的 protocols 数组曾新增/更新 7 个以 `codex/` 开头的条目（PCR/GAM/EGB/NAP/PWP/MC/QQC 001）；后续独立对照工作已将其改名为 `codex-pdf/`，详见上节。所有温度、时间、体积、浓度仅在 PDF 明示时编码；未选定的试剂、仪器条件和分支均以 `needsReview` 或省略处理。表格采用 `tables`（8 张，包括运行记录模板及 MC-001 反应设置）；循环用 `step.repeat`。

### 现在真实状态（本次实跑）

- 7 份目标 JSON：共 **76 steps、65 materials、8 tables、20 sources、30 needsReview**；逐份明细来自本次脚本输出：EGB-001 (10/7/1/2/4)、GAM-001 (12/14/1/4/7)、MC-001 (9/7/2/3/5)、NAP-001 (14/13/1/3/3)、PCR-001 (10/9/1/3/3)、PWP-001 (10/9/1/2/6)、QQC-001 (11/6/1/3/2)，字段顺序为 steps/materials/tables/sources/needsReview。
- `node protocol-standard/renderer/validate.mjs`：**39/39 protocols valid**（包含新 7 份的引用完整性校验）。
- `node protocol-standard/renderer/validate-schema.mjs`：**39/39 files pass full JSON Schema**（Draft 2020-12）。
- 本地 HTTP 验证：`http://127.0.0.1:4173/renderer/viewer.html` 返回 **HTTP 200**，含 **7** 个 `codex/` 条目；7 个新增/重写 JSON 均返回 **HTTP 200** 且可解析。

### 卡在哪

- 无当前技术阻塞。待本次变更提交并推送后，远端 GitHub Pages 是否已刷新需要另行访问核验。

### 还没验证的（下一个会话从这里怀疑）

- 未逐个访问 PDF 中列出的厂商 URL 核对当前网页/手册版本；JSON 的可执行数值只以本次压缩包 PDF 为证据，外链均 `licenseVerified:false`。
- PDF 本身未指定的条件不能直接上机：例如 Q5 的具体反应配方与循环时长、限制酶选择/温度/时间、RIPA/T-PER 的裂解及澄清条件、NanoDrop 推荐上样体积、载体特异 sgRNA 退火/连接条件，均须在具体实验前按选定试剂或仪器说明书复核。
- Viewer 已经以 HTTP 200 确认文件可加载，尚未对 7 个下拉选项逐个进行浏览器交互与视觉回归。

### 要用户定的

- 若要将这些 `draft` 协议升级为可执行/发布版本，需要逐份指定实际 kit、载体、仪器、样品以及机构生物安全/EHS 要求，并回填所有 `needsReview`。


## PCR-001 转化 + Viewer 更新 + GitHub Pages 部署（2026-08-21 / 本地 20:38 CST）

（工作线：**Viewer UI 完善 + 新测试数据转化 + GitHub Pages 部署**。与下方 v0.3 in-vivo 验证、v0.2 压力测试是不同工作线。）

### 这次做了什么

- **用户决定**：① Tab 标签改英文并居中；② Tab 3 改名 "Materials & Setup"，Tab 4 改名 "Notes & Safety"；③ Overview 也要显示侧边导航栏；④ 创建 GitHub 仓库并启用 Pages；⑤ 用新测试数据 PCR-001 替换列表中无法显示的条目。
- **助手执行**：
  - `protocol-standard/renderer/viewer.html`：Tab 标签改英文（Overview / Procedure / Materials & Setup / Notes & Safety）；标题和 Tab 居中（`justify-content:center`）；Overview Tab 也显示侧边 outline；移除 7 个无法加载的 stress-test 协议条目，保留 6 个可用条目（PCR-001 排首位）。
  - `protocol-standard/examples/pcr-001-standard-pcr.json`（新建）：从用户提供的 `PCR-001_standard_pcr.pdf`（LabOS Protocol Library，4 页 SOP）转化为 canonical schema v0.3 JSON。7 材料（含 storage 如 "Store at -20°C; keep on ice; do NOT vortex"）、5 设备、3 表格（Reaction Setup recipe / Cycling Program / Primer Design Checklist）、10 步骤 3 阶段（Reaction Setup / Thermal Cycling / Post-run QC）、3 controls、4 troubleshooting 条目、3 sources（2 Addgene URL + 1 本地 PDF）。
  - GitHub 仓库 `siyuanj/protocol-library-test`（public）：初始提交 + Pages 部署 workflow（`.github/workflows/deploy-pages.yml`）+ `.nojekyll`。
  - 已 push 至 main，Pages 自动重新部署。

### 现在真实状态（本次实跑）

- Viewer 在 localhost:4173 四个 Tab 均正常渲染，PCR-001 内容完整，0 console error。
- GitHub Pages 在线地址：`https://siyuanj.github.io/protocol-library-test/protocol-standard/renderer/viewer.html`
- Git commit `68784c3`，已 push 到 origin/main。

### 还没验证的（下一个会话从这里怀疑）

- GitHub Pages 重新部署后是否能正常加载 PCR-001 JSON（路径 `../examples/pcr-001-standard-pcr.json` 依赖相对路径）。
- 用户 zip 中还有 PCR-002 至 PCR-006 共 5 个协议未转化。
- PCR-001 JSON 中 Template DNA 的 `amount` 未指定（标 `needsReview: true`），因 PDF 原文给的是范围（1-10 ng plasmid / 10-500 ng gDNA）。
- Viewer 的 outline 在 Overview Tab 显示的条目取决于 `buildOutline()` 对 `h4[id]` 和 `.ov-phase[id]` 的查询，未做全部协议类型的边界测试。

### 要用户定的

- 是否继续转化 PCR-002 至 PCR-006。
- 仓库是否改名或转为 private。
- 现有 5 个旧协议（Western Blot / RT-qPCR / Cell Culture / Gel Filtration / Protein Concentration）是否保留在列表中。


## v0.3 in-vivo 构造验证：PK 动物实验协议编码完成（2026-08-21 / 本地 13:37 CST）

（工作线：Protocol Library 核心标准的 **schema v0.3 in-vivo/ethics 构造端到端验证**。任务：用 v0.3 原生构造把一份真实的啮齿类单剂量 PK（IV vs PO，连续采血）协议编码，证明 studyDesign/compliance 修复了 v0.2「无伦理/设计层」的缺口。与上方 v0.2 test-set、Section 1&2&3、LabRecord 部署是不同工作线。）

### 这次做了什么（助手判断，非用户逐条指定）
- 新建 `protocol-standard/examples/v03-demos/pk-animal-study.json`（v0.3，8 步/7 材料/6 样品/22 needsReview），作为 v0.2 `examples/stress-set/pk-animal-study.json` 的「after」版本。
- 用到的 v0.3 原生构造：顶层 `studyDesign`（两臂 IV/PO + 各 n=3 + 随机化 + 盲法 + 7 个 timepoints + NCA 统计计划，全部落在结构化字段而非散文）；顶层 `compliance`（IACUC 门 + consent=N/A + wasteDisposal + 3Rs notes）；`samples.kind` organism（sp1/sp2 小鼠）+ physical（sp3 全血 / sp4 血浆）+ dataset（sp5/sp6）并用 step inputIds/outputIds 串物料流；`step.repeat`（s5 连续采血 count=7 + over + untilCondition = 到齐 7 点或达 10% 血量上限）；`step.acceptanceCriteria`（s1 入组体重门、s5 累计采血福利上限、s6 血浆质量门、s7 生物分析 QC ±15% 接受标准，onFailStepId=s7）；另用了 `parameter.formula`（s8 的 F%/CL/t1/2 公式）、`metadata.discipline=Pharmacology`。
- **biosafetyLevel 从 v0.2 的 `needsReview`（被当伦理占位符误用）改为正确的 `not specified`**；伦理门迁到 `compliance.iacuc`。这是本次要证明的核心修复点。
- 来源全部经 PubMed 核实（真实 DOI，未编造）：src1 Peng 2009 J Pharm Sci `10.1002/jps.21533`（小鼠隐静脉连续采血 PK 方法学，主源）、src2 Diehl 2001 J Appl Toxicol `10.1002/jat.727`（给药/采血体积与福利上限）、src3 Parasuraman 2010 `10.4103/0976-500X.72350`（小动物采血）、src4 Turner 2011 JAALAS（PMC3189662，无 DOI，用 PMC URL）。IACUC 批号按规定**不编造**，只在 compliance 里写明「开工前必须记录」。

### 现在真实状态（本次实跑）
- `node renderer/validate.mjs` = **29/29 PASS**（引用完整性）；`node renderer/validate-schema.mjs` = **29/29 PASS full JSON Schema**（ajv，draft2020-12，additionalProperties:false 全覆盖）。新文件行：`PASS examples\v03-demos\pk-animal-study.json (v0.3, 8 steps, 7 materials, 6 samples, 22 needsReview)`。
- 文件纯 ASCII（node 核实 non-ASCII count=0），规避 µ/°C 编码坑；单位用 uL/degC/mg/kg/mL/kg/x g。

### 还没验证的（下一个会话从这里怀疑）
- 未在渲染器（`build-demo.mjs`/`demo.html`）里目视渲染这份 v0.3 文件，也未确认是否要纳入 demo 列表。
- 具体 mg/kg 剂量（IV 1 / PO 10）是助手设的标准 discovery 默认值（写进 studyDesign.treatment），非来自源；给药体积上限（IV<=5、PO<=10 mL/kg）与 10% 血量上限来自 Diehl/Parasuraman。载体、禁食状态、每次采血 uL、生物分析方法、离心参数、NCA 软件均标 needsReview，未回填真实值。
- 每次采血 ~20 uL 是按 10% 血量上限反推（25 g 小鼠 ~180 uL 帽 / 7 点）的助手判断，已标 needsReview；Peng 摘要未给具体每点体积。

### 要用户定的
- 这份是否纳入渲染器 demo 与展示；n=3/臂 与 IV1/PO10 剂量是否按此定稿。
- SCHEMA-CHANGELOG 说 v0.3 后仍有「minimize later」裁剪（length/area/precision）；本文件未触发这些，可作为 in-vivo 侧的保留证据。


## v0.2 压力测试：test-set 三个经典协议编码完成（2026-08-21 / 本地 12:15 CST）

（工作线：Protocol Library 核心标准的 **schema v0.2 压力测试**。用真实权威来源把三个经典协议编码成符合 `canonical-schema.json` v0.2 的 JSON，检验 schema 的可执行性与字段覆盖。与上方 Section 1&2&3、以及 LabRecord 部署是不同工作线。）

### 这次做了什么（助手判断，非用户逐条指定）
- 新建 `protocol-standard/examples/test-set/` 并写入 3 份 v0.2 JSON（全部通过 Draft2020-12 schema 校验 + 交叉引用完整性校验）：
  - `ni-nta-purification.json`：Ni-NTA 天然条件批式纯化。源=QIAexpressionist 手册（QIAGEN 06/2003，Harvard 镜像 PDF）。缓冲液咪唑梯度 10/20/250 mM 用 `tables` 表达；samples 走 pellet→cleared lysate→resin-bound→eluate；含 flow-through/wash 分数。
  - `sds-page.json`：Laemmli 不连续 SDS-PAGE。源=Bio-protocol e80（Fanglian He 2011）给胶配方/样品缓冲液/跑胶缓冲液；200 V 运行条件来自 Bio-Rad Mini-PROTEAN 手册（src2）——e80 未给电压/时间，时间标 `needsReview`。10% 分离胶 + 5% 浓缩胶配方用两列 `tables`。
  - `gibson-assembly.json`：Gibson 等温组装。源=NEB E2611（protocols.io imsupm）。反应配置表（2-3 / 4-6 片段 / 阳性对照，均 20 µL，Master Mix 10 µL）用 `tables`；50 °C 15/60 min 用 `branches` + `decisionPoint`；片段+载体→construct→转化子走 inputIds/outputIds。
- PDF 文本抽取用 `pdftotext -layout`（WebFetch 对 PDF 解析失败），确认了全部关键数值（缓冲液成分、离心、结合/洗脱体积、pmol、温度时间）来自源文件而非记忆。

### 现在真实状态（本次实跑）
- `scratchpad/validate.py`（jsonschema 4.26.0）对 3 份文件：schema=PASS、references=PASS、参数 rawText/type=PASS。
- 计数：ni-nta(材料9/设备3/样品6/容器2/表1/步11/源1)、sds-page(12/4/3/2/2/12/2)、gibson(7/2/5/2/1/8/1)。

### 还没验证的（下一个会话从这里怀疑）
- 未用仓库自带的 `renderer/validate.mjs` 跑这 3 份（只用了独立的 Python jsonschema 校验）；也未在渲染器里目视渲染。
- 未确认这些新文件是否要纳入 `build-demo.mjs` 的 5→8 份 demo 列表。
- 各文件里的 `needsReview` 项未回填：Ni-NTA 生物安全等级/PMSF/RNase-DNase 可选项；SDS-PAGE 跑胶时间；Gibson 化学转化体积（源只给电转 1 µL/3× 稀释，2 µL→50 µL 感受态属 NEB 产品页而非本协议源）。

### 要用户定的
- 这 3 份是否升级/替换现有 examples，或仅作为独立 test-set 保留。
- 是否要我把 test-set 也接入渲染器 demo 与仓库校验脚本。


## Protocol 通用数据结构 + 管理系统地基：Section 1&2 完成、Section 3 设计（2026-08-21 本地）

（工作线：Protocol Library 核心标准。与下方 LabRecord MCP/Cloudflare 部署、GitHub Pages 精选站是**不同工作线**；本线按用户多轮指示把方向从「元数据目录」纠偏到「协议内容本身的通用数据结构 + 管理系统」。）

### 这次做了什么（用户定 vs 我判断已标注）
- **用户决定（多轮）**：① 之前的元数据目录方向「不太行」，改做 Google Doc「To Do 0822」的 Section 1（格式标准）+ Section 2（规范 schema/渲染器）；② 目标是把**后台管理系统**做好，MCP/部署押后；③ 数据结构与管理系统必须**跨学科通用**，不能只针对某一实验；④ **不**大批量收集 protocol（具体列表之后给），重点是结构与系统；⑤ 前端呈现做**几版方案**给 mentor 选；⑥ 用 `test_protocol/` 前两个 PDF 作测试数据生成；⑦ 今天 5am 定时复查（见「还没验证的」）。
- **助手执行**：新建 `protocol-standard/`，不动旧的 crawler/元数据目录/public-site/mcp-demo。
  - Section 1：`01-literature-summary.md`（文献/标准调研，多后台 agent 完成，DOI/URL 已核实：MIQE、Nature/STAR/Bio-protocol/protocols.io、schema.org/Bioschemas、SMART Protocols、EXACT2、ISA、OBI、Autoprotocol、Aquarium、LabOP、CWL、PROV-O、FAIR、Giraldo 2018 17 要素）；`02-format-standard.md`（选型=adapt + 理由段 + 局限）；`examples/{western-blot,qpcr,cell-culture}.md`（WB 基于真实 PDF、qPCR 对齐 MIQE、细胞传代）。
  - Section 2：`canonical-schema.json`（通用 JSON Schema，draft 2020-12；`parameter.type` 枚举扩到物理/化学/生物/计算 + `other` 兜底以保证跨学科通用）；`examples/*.json` 共 5 份；`renderer/`（`renderer.js` 核心 + `ProtocolRenderer.jsx` React 版 + `validate.mjs` 零依赖校验 + `build-demo.mjs` + `demo.html`）。
  - 真实 PDF 生成：`examples/gel-filtration.{md,json}`、`examples/protein-concentration.{md,json}`（源 `test_protocol/1、2`，needsReview 标注未确认值）。
  - 前端四版：`renderer/design-options.html`（Document / Checklist·Run / Timeline / Compact·Print）+ `variants.js/variants.css/build-variants.mjs`。
  - Section 3：`03-library-version-design.md`（Public/Private/Lab 三库归属与权限矩阵、引用/fork/版本/血缘、提交→审核→批准状态机、归档与许可保全；全部只作用于版本记录、与学科无关；字段映射到 schema 的 `provenance` 块）。
  - `presentation-plan.md`（中文展示方案）、`README.md`、`serve.mjs`、`.claude/launch.json`。

### 现在真实状态（本次实跑）
- `node protocol-standard/renderer/validate.mjs` = **5/5 PASS**：cell-culture(10 步/13 needsReview)、gel-filtration(12/1)、protein-concentration(12/10)、qpcr(12/14)、western-blot(18/9)。
- `build-demo.mjs` 生成 `demo.html`（85,856 bytes）；`build-variants.mjs` 生成 `design-options.html`（77,928 bytes）。
- 浏览器实测（`serve.mjs` @ localhost:4173）：`demo.html` 渲染正常，蛋白定量协议三相 phase（A280/BCA/Bradford）齐全、badge「10 need review」，**0 console error**；`design-options.html` 的 Document/Checklist/Timeline 截图确认，Compact 经直接 `renderVariant(...,'compact')` 调用确认（有效 HTML、含 v-side/v-steps）。

### 卡在哪
- 预览工具的 click/screenshot 偶发命中错 tab（desync）；用 `preview_eval` 直接断言规避，非代码缺陷。

### 还没验证的（下一个会话从这里怀疑）
- **未在真实 LabRecord 网站/DB/API 集成**渲染器与 schema（Section 4 全未做）。
- 两个真实 PDF 的 `needsReview` 项（kit 规格、转速、批次、供应商等）**未回填真实值**。
- **schema v0.2 升级建议未实施**：UCUM 单位码、amount 与试剂身份解耦、结构化 expectedResult + `onFail` 分支、JSON-LD `@context`（来源见 `01-literature-summary.md` 与 GitHub 调研）。
- `ProtocolRenderer.jsx` 仅逻辑对齐，**未在真实 React 构建中跑过**。
- **5am 定时复查**：其触发与「云端/本地对本地仓库 `D:\...` 的可达性」尚未验证——云端 routine 大概率读不到本地文件；需用户确认用本地方式或接受只读 Google Doc + 内嵌清单的复查。

### 要用户定的
- 前端四版选哪版作主界面（建议 Document + Checklist·Run 并用）。
- Section 4 范围：先做「三库 + 版本 + 保存前校验」最小闭环，还是含 Lab 审核流一步到位。
- 是否现在上 schema v0.2（更规范但更重）。
- 之后要收哪些学科的 protocol 列表（用户将提供）。

## LabRecord Cloudflare 部署加固与自启（2026-08-20 本地约 13:11）

（工作线：LabRecord MCP Route A。承接上一节的公网部署；不涉及 A100 的 `a100-monitor`。）

### 这次做了什么
- **用户明确授权**：用户表示“后续全部允许”；据此继续完成当前已部署服务的自启与非破坏性安全加固。
- **助手执行**：`mcp-demo/website.mjs` 不再含运行用 Lab token。现改为强制读取 `LABRECORD_LABS_JSON`，并强制读取 `MCP_ALLOWED_HOSTS`；MCP transport 开启 DNS-rebinding 防护，当前生产值固定为 `labrecord.jiangsiyuantest.me`。
- **助手执行**：`mcp-server.mjs` 也不再提供默认 token；stdio 调用必须显式提供 `LABRECORD_TOKEN`。两套 verify 脚本改用隔离的测试 token，新增已忽略的 `labrecord.env` 模板和文档说明。
- **助手执行**：真实 token map 仅写入 `C:\Users\1\.cloudflared\labrecord.env`；该文件 ACL 已实际核验为仅 `JSY\1` 的非继承 FullControl，未写入 Git。Node 进程用 `--env-file` 启动。
- **助手执行**：创建 `C:\Users\1\.cloudflared\start-labrecord.ps1` 与当前用户 Startup 启动器 `...\Startup\LabRecord MCP Demo.vbs`。计划任务 `LabRecord MCP Demo` 创建被 Windows 拒绝（`Access is denied`），因此采用无需管理员权限的 Startup 文件夹方案；启动器已做幂等检查。
- **助手执行**：加固代码已提交并推送至私有仓库 `siyuanj/labrecord-mcp-demo` 的 `main`：`d518cda Harden Cloudflare MCP deployment configuration`。用户原有未跟踪的 `mcp-demo/CODEX-DEPLOY-PROMPT.md` 未改动、未提交。

### 现在真实状态（本次实跑）
- `npm run verify`（stdio）为 **10/10 PASS**；`npm run verify:http` 为 **7/7 PASS**，退出码均为 0（本次代码加固后实跑）。
- 当前本地源站为 PID **44612**：`node --env-file=C:\Users\1\.cloudflared\labrecord.env website.mjs`，监听仍为 `127.0.0.1:4100`。
- 当前 Tunnel 为 PID **34988**：`cloudflared --config C:\Users\1\.cloudflared\config.yml tunnel run labrecord`；未增加或改变任何 A100 Tunnel。
- 公网 `GET https://labrecord.jiangsiyuantest.me/api/schema` 仍为 **HTTP 200**。经公网 `https://labrecord.jiangsiyuantest.me/mcp` 的带 token MCP client 仍暴露 **4** 个工具；无 token 初始化仍被拒绝。
- 直接运行 Startup VBS 后复核：website 进程数 **1**、`labrecord` tunnel 进程数 **1**，未重复启动。

### 卡在哪
- Windows 任务计划程序拒绝创建任务（本次输出 `Access is denied`）；已切换至当前用户 Startup 文件夹，下一步不需要管理员权限。若必须改用 Task Scheduler 服务级管理，需要用户以管理员身份运行或授权该目录的任务创建。

### 还没验证的
- 尚未经历一次真实 Windows 注销/重新登录，因此 Startup 触发时机本身未验证；启动器内容已实际执行并通过幂等性复核。
- 另一台电脑真实 Claude Code 的 `claude mcp add --transport http ...`、导入 PDF 的端到端闭环，以及独立中国大陆网络可达性，仍待实际设备/网络测试。
- `/api/connect` 为满足 demo 的“一条命令直连”目标，仍向网页明文返回 demo token；这不是生产认证方案。
- `cloudflared 2026.7.1` 仍提示可升级至 `2026.8.2`；未升级。JSON 文件存储也仍不具备重启恢复/多实例一致性。

### 要用户定的
- 是否需要以管理员权限将 Startup 方案改为 Windows Scheduled Task/Service；当前方案已能在用户登录时恢复，但不在用户未登录时运行。
- 是否现在从另一台（最好中国大陆网络）Claude Code 执行公网连接命令并做一次 PDF 导入验收。
- 何时将 demo `/api/connect` 换成登录后、可撤销的 per-user token，并迁移 JSON store 到真实数据库。

## LabRecord MCP 已通过自有 Cloudflare 域名部署（2026-08-20 本地约 12:59）

（工作线：LabRecord MCP 导入 demo；部署方式为 Route A，运行在本机 Windows，不触碰 A100 监控隧道。）

### 这次做了什么
- **用户决定并授权**：使用自有 `jiangsiyuantest.me` 的 Cloudflare 账号走 Route A；用户完成/授权了本机 `cloudflared` 登录。未使用 Quick Tunnel、`trycloudflare.com`、`workers.dev`，也未修改 A100 的 `a100-monitor` 隧道或 Worker。
- **助手执行**：创建独立 Cloudflare Tunnel `labrecord`（ID `bf429b5b-51ce-4f67-945b-b2e4a6660b8a`）；用 `cloudflared tunnel route dns` 新建 `labrecord.jiangsiyuantest.me` 的 CNAME 路由。
- **助手执行**：新增本机私有配置 `C:\Users\1\.cloudflared\config.yml`，仅将 `labrecord.jiangsiyuantest.me` 转发至 `http://127.0.0.1:4100`，末尾规则为 `http_status:404`；凭据 JSON 和 `cert.pem` 留在 `C:\Users\1\.cloudflared\`，未写入仓库。
- **助手执行**：已启动 `cloudflared ... tunnel run labrecord`；未改动 `mcp-demo/` 源码或 GitHub 仓库。

### 现在真实状态（本次实跑）
- 本地源站进程为 PID **37152**：`node mcp-demo/website.mjs`，仅监听 `127.0.0.1:4100`（本次 `Get-CimInstance` 输出）。
- Tunnel 进程为 PID **34988**；`cloudflared tunnel info labrecord` 显示 connector `d41c807d-32fb-4bc2-a322-fd6fe972c1ac`，已连至 **4** 个 edge：`1xlax09`、`1xlax10`、`1xsjc05`、`1xsjc10`（本次 12:59 输出）。
- `GET https://labrecord.jiangsiyuantest.me/api/schema` 返回 **HTTP 200**；`/api/connect?lab=wang-lab` 返回的 `mcpUrl` 为 `https://labrecord.jiangsiyuantest.me/mcp`，连接命令与预期公网 HTTPS 命令逐字匹配（本次实测）。
- 通过公网 URL 和 Wang Lab Bearer token 用真实 Streamable HTTP MCP client 初始化并 `listTools`：**4/4** 工具可见，分别为 `create_protocol`、`get_import_schema`、`list_protocols`、`publish_protocol`（本次实测）。
- 通过同一公网 URL 的无 token MCP client 初始化被拒绝（`unauthenticatedConnectionRejected=true`，本次实测）。

### 卡在哪
- 当前无部署技术阻塞。若 Windows 重启或这两个本地进程被停止，公网入口会中断；下一步动作是按用户决定配置 Windows 计划任务/服务，或迁移到真正常开主机。

### 还没验证的
- 尚未让另一台电脑上的真实 Claude Code 执行 `claude mcp add --transport http ...` 后新开会话并导入 PDF；公网 MCP SDK client 已验证，但 Claude Code 的实际注册/导入闭环仍需按任务说明实测。
- “国内可访问”尚未从独立中国大陆网络实际请求验证；本机已用自有域名公网 HTTPS 成功访问，避免了此前 `trycloudflare.com`/`workers.dev` 的 DNS 污染问题，但不能替代异地网络实测。
- 当前是用户会话中的后台进程，未配置重启/登录后自启。
- `cloudflared 2026.7.1` 在本次检查中提示可升级至 `2026.8.2`；未升级。
- 生产加固尚未做：demo token 仍写死、`/api/connect` 明文返回 token、MCP transport 仍为 `enableDnsRebindingProtection:false` 而未改为固定 `allowedHosts`。

### 要用户定的
- 是否将 Windows 部署改为登录后自动启动的计划任务/服务，或迁移到不关机的服务器；当前 Route A 依赖这台电脑持续运行。
- 是否在另一台电脑现在按页面命令实测 Claude Code 导入，并在中国大陆网络完成可达性复核。
- 何时把 demo token 改为可撤销的登录后凭据，并完成 `allowedHosts` 等生产加固。

## MCP demo 增加远程 HTTP 端点(远程用户可用)（2026-08-20 本地约 02:05）

（工作线:LabRecord MCP 导入 demo。）

### 这次做了什么
- 用户确认走 Route A:新用户用自己的 Claude Code(自带模型 token),登录网站→复制一条连接命令→粘进自己的 agent 一次→之后直接用。
- `website.mjs` 新增**原生远程 MCP 端点 `POST /mcp`**（Streamable HTTP，助手判断）：用 `Authorization: Bearer <LabRecord token>` 认证并绑定 lab;4 个工具与 REST 共用同一套 store helper(`createDraft`/`listDrafts`/`publishDraft`)。这样远程用户**不需要 clone**,只填一条 `claude mcp add --transport http <url>/mcp --header ...`。
- `mcp-server.mjs`(stdio 适配器)保留,供本地/离线使用。
- `/api/connect` 面板命令改为 HTTP 形式;`trust proxy` 已开,部署后 baseUrl 自动用公网 https。
- 新增 `verify-http.mjs` 与 `npm run verify:http`;README/DEPLOY 已同步远程连接说明。
- 已提交并推送 GitHub:commit `7c9fc1f`(`df233f0..7c9fc1f main -> main`)。

### 现在真实状态（本次实跑）
- `npm run verify`(stdio):**10/10 PASS**;`npm run verify:http`(HTTP):**7/7 PASS**,含"无 token 连接被 401 拒绝"。两者退出码 0。
- 本地预览(端口 4100)运行新代码;面板命令实测为 `claude mcp add --transport http labrecord http://localhost:4100/mcp --header "Authorization: Bearer lbr_sk_live_7f3a…f6a4"`。

### 还没验证的
- **未在真实 Claude Code 里用 `--transport http` 实连**(已用真实 HTTP MCP client 证明端点可用;客户端注册仍需用户实测)。
- 远程用户要真正能连,**网站必须先部署到公网**(localhost 只能本机)。Cloud Run 部署命令见 DEPLOY.md,本次未部署(需用户 gcloud)。
- 生产:`enableDnsRebindingProtection:false`,上线应改用 `allowedHosts`;`/api/connect` 仍明文吐 token,须改登录后发。

## MCP 导入 demo 已上 GitHub + Docker 化可部署（2026-08-20 本地约 01:40）

（工作线:LabRecord MCP 导入 demo,与下方"GitHub Pages 公开精选站点"是不同工作线。）

### 这次做了什么
- 用户在另一台机器实测:通过 `labrecord` MCP 从真实 Zymo ZR Plasmid Miniprep 说明书 PDF 导入了一条结构化 draft（见 `mcp-demo/data/protocols.json` 与 `mcp-demo/import-zymo-d4015.json`，needsReview 正确标注 kit 大小/转速等未确认项）。真实端到端成功证据（用户操作）。
- `website.mjs` 增加 `HOST` 环境变量（默认 127.0.0.1；容器/服务器设 0.0.0.0）（助手判断）。
- 新增 `Dockerfile`、`.dockerignore`、`DEPLOY.md`（助手判断）：Cloud Run 一条命令部署；说明 A100/HPC 不适合当公网 web 服务器（无公网入站）。
- 面板 token 改为 API-key 样式长串（`lbr_sk_live_…`），并加"Step 2 可复制提示词"（助手判断）。
- 新建**私有** GitHub 仓库并推送:`https://github.com/siyuanj/labrecord-mcp-demo`（助手执行，gh 已认证 siyuanj）。仅含 `mcp-demo/`；`node_modules/`、`data/` 已 gitignore。

### 现在真实状态（本次实跑）
- 编辑后再跑 `npm run verify`:**10/10 PASS，退出码 0**（本次输出）。
- git 初始化于 `mcp-demo/`，初始提交已推 `origin/main`（`gh repo create --push` 输出确认；`git remote -v` 指向该私有仓库）。
- 本地预览服务仍在端口 4100 运行。

### 还没验证的
- **未实际部署到 Cloud Run**（需用户 gcloud 凭据；命令见 `mcp-demo/DEPLOY.md`，本次未运行）。
- Cloud Run 上 JSON 存储为临时，重部署/多实例会不一致；生产需换数据库（未做）。
- `/api/connect` 明文暴露 demo token（仅演示；生产须登录后按用户发可吊销 token）。

### 要用户定的
- 是否部署共享服务器（推荐 Cloud Run，与现有 staging 同栈）还是各机本地运行即可；仓库是否转 public 或邀请同学作为 collaborator。

## GitHub Pages 公开精选站点（2026-08-20）

### 这次做了什么
- 用户决定：将本地归档整理为同学可查看的 GitHub Pages；未完成的 crawler packet 不做全量补爬，只展示少量明确标注后续核验的代表记录。
- 用户追加决定：公开站先扩充到至少 60 条经典方法，同学负责后续筛查（不据此视为已完成或可写入 LabRecord）。
- 新增 `public-site/`（助手判断）：独立、可部署的静态页面，不将整个项目目录、crawler JSON、LabRecord demo 或工作队列公开。
  - `index.html` / `styles.css`：Protocol Atlas 浏览页，提供关键词、方法领域和核验状态筛选。
  - `protocols.js`：手工挑选的 **60** 条 metadata-only 记录；包含标题、分类、来源链接、DOI、作者署名、记录的许可标签及可用时的许可佐证链接；不含任何 protocol 正文、表格、图片、视频、PDF 或附件。
  - 28 条来自本地标为 complete 的分类；2 条（Bacterial transformation、CRISPR genome editing）来自 partial 分类，并在页面明确显示 `Follow-up needed`；新增 **30** 条统一显示 `Peer screening`（助手判断：将可供同学筛查的候选与已完成分类隔离）。其中 21 条是本地的额外代表记录，9 条是现有筛选队列中的经典方法变体。
  - `.github/workflows/deploy-pages.yml`：推送 `main` 后发布 GitHub Pages。
- 页面文本明确说明：该站只用于定位来源；创建 processed LabRecord version 前，仍要核对来源记录、原始论文的 PLOS/PMC 合格许可、第三方材料、来源条款与实验室安全要求。

### 现在真实状态（本次实跑）
- `node --check public-site/protocols.js`：通过（退出码 0）；记录结构审计为 **60** 条，**28 complete、2 partial、30 screen**，无重复 ID、无超出元数据范围的字段、无无效 URL。
- 本地 HTTP 服务下用真实浏览器检查：页面标题为 `Protocol Atlas — curated preview`；初始显示 **60/60** 条记录；选择 `Peer-screening queue` 后显示 **30/60** 条和 30 个 `Peer screening` 徽章；控制台 **0 errors、0 warnings**。
- 本次运行 `node data/validate-session-results.mjs`：**9 complete、5 partial、29 missing、0 blocked、0 in-progress、0 invalid**。
- 已创建并推送公开仓库 [`siyuanj/protocol-atlas`](https://github.com/siyuanj/protocol-atlas)，发布提交为 `ac41c60`（`Publish Protocol Atlas preview`）。
- GitHub Pages 工作流 `Deploy Protocol Atlas Pages` 的 run `32351577785` 已成功完成；公网地址为 <https://siyuanj.github.io/protocol-atlas/>。
- 本次用真实浏览器访问公网：标题正确、初始显示 **30/30** 条记录，控制台为 **0 errors、0 warnings**。GitHub 对 workflow 内部 Node 20 action 强制改用 Node 24 的提示仅为弃用告警，未影响部署。
- 扩容提交 `d7e940c`（`Expand public catalogue to 60 records`）已推送到 `main`；Pages run `32354487249` 成功（deploy job 14 秒）。公网复核显示 **60/60**；筛选 `Peer-screening queue` 后为 **30/60**，浏览器控制台 **0 errors、0 warnings**。

### 卡在哪
- 公开部署没有技术阻塞。若继续扩充内容，只修改 `public-site/protocols.js` 中人工筛选的 metadata-only 记录，提交并推送即可触发 Pages 重新发布。
- 将任何记录变成可创建的 LabRecord processed version 前，仍须逐条核对原始论文的许可与第三方材料；这是内容合规工作，并非网页部署阻塞。

### 还没验证的
- 公开 Pages 的构建、部署 URL 与首页访问已验证；页面内的外部来源/许可证据链接未在发布后逐条重新打开核验。
- **30 条 `Peer screening` 候选尚未通过同学/团队筛查**，且全部 60 条均仍需按团队流程逐条找到并核对合规原始 PLOS 或 PMC CC0/CC BY 来源后，才可生成 LabRecord processed version；本页的 source-level license 字段不能替代该核验。

### 要用户定的
- 发布后是否需要改为私有仓库或迁移到项目组织账号；当前任务按“同学可能要看”默认使用公开、仅元数据的预览站点。

## MCP 导入 demo 重做为 stdio 版（2026-08-20 本地约 01:15）

### 这次做了什么
- 用户反馈：旧 `labrecord-protocol-mcp-demo/`（Codex 版）接真实 agent 客户端连不上（助手判断：其远程 HTTP + Origin 白名单方案对本地客户端不友好）。旧目录保留但不再作为演示路径。
- 新增 `mcp-demo/`（助手判断，全新目录）：改用 **stdio MCP server**，并把"网站"与"MCP adapter"拆成两个进程，对应真实上线架构（MCP server 包在网站 API 外层）。
  - `website.mjs`：本地 LabRecord 后端 + REST API + 浏览器库页（端口 4100；token→lab 鉴权；JSON 存储；`LABRECORD_STORE` 可覆盖存储路径以隔离测试）。
  - `mcp-server.mjs`：stdio MCP server，4 工具 `get_import_schema` / `create_protocol` / `list_protocols` / `publish_protocol`，用 Bearer token 调 website API。
  - `schema.mjs`：沿用旧版 zod draft schema（写入即 draft；不确定值进 needsReview；拒未知字段）。
  - `public/index.html`：自刷新库页（2s），draft/published 徽章、review flag 高亮、Lab 下拉可演示隔离。
  - `verify.mjs`：自带端到端测试，用真实 MCP **stdio client** 驱动。
  - `sample-protocol.md`：live demo 输入（DH5α 热激转化，含刻意含糊值供 agent 打 needsReview）。

### 现在真实状态（本次实跑）
- `npm run verify`：**10/10 PASS，退出码 0**（本次命令输出）。覆盖：4 工具暴露、创建为 draft、review flags=3 保留、无步骤被拒、列表可见、Wang Lab 草稿对 Lee Lab 不可见（隔离）、publish 门控。verify 用独立存储 `data/.verify-store.json`，不污染演示库。
- website 冒烟测试（端口 4100）：`GET /` 返回库页；带 token POST → created/status=draft/flags=1；**无 token POST → HTTP 401**；写后 `GET /api/protocols` 2 条。
- 浏览器 a11y 快照确认渲染：draft 卡（3 review flags，步骤/材料/flag 均渲染）+ published 卡。
- 演示库 `data/protocols.json` 已重写为干净 UTF-8 起始态：Coomassie（draft，1 flag）+ Bradford（published）。DH5α 留作 live 输入。
- 环境：Node v24.14.0；依赖 `@modelcontextprotocol/sdk` ^1.30、express ^5.1、zod ^3.24（本次 npm install 成功，93 包）。端口 4100 与旧版 3333 均已确认空闲。

### 还没验证的（新 demo）
- **未在真实 Claude Code / Claude Desktop 客户端里实跑 `claude mcp add`**：stdio 连通性已用真实 MCP SDK client 证明；但 GUI 客户端的工具加载/是否需重启会话，用户须自测（明天演示前务必先跑一遍）。
- 仍未接真实 LabRecord staging 后端 / 写入 API / DB / 真实字段名与认证模型（与旧版相同未决项；上线时用真实 API 替换 `website.mjs`）。
- 未接真实 PDF/OCR/语音解析；demo 只证明"结构化草稿 → MCP → 网站"闭环，不证明解析准确度。
- 已知非缺陷：用 PowerShell 直接 POST 会 mangle α/µ/°C（PowerShell 编码问题；node/agent 路径正常，已用 UTF-8 重写存储规避）。

### 要用户定的
- 明天演示以 `mcp-demo/`（stdio 版）为准；`labrecord-protocol-mcp-demo/`（旧 HTTP 版）不再使用，是否删除待定。

## 这次做了什么

- 用户决定：将 LabRecord 的 Protocol 手工编辑流程扩展为 MCP 导入体验；Agent 可把 PDF、照片、口述或文本整理成统一的、待审核的 Protocol 草稿。
- 已新增 `labrecord-protocol-mcp-demo/`（助手判断）：独立本地 demo，复刻截图所示 Protocol 结构（名称、步骤、每步材料/试剂、用量、单位、Grade/Lot），并提供对应的浏览器库页面。
- 已新增真实 Streamable HTTP MCP endpoint `http://127.0.0.1:3333/mcp`（助手判断）：`get_protocol_import_schema`、`create_protocol_draft`、`list_protocol_drafts`、`publish_protocol_draft` 四个工具；导入一律为 `draft`，发布工具要求显式的人工审核确认。
- 已新增严格 LabRecord draft schema（助手判断）：未声明字段、空步骤会被拒绝；不确定剂量、时间、温度或批次必须落入 `needsReview`，不能被 Agent 自动编造。
- 已添加 `demo-agent.mjs`（助手判断）：独立 MCP client 会先读取导入规则，再真实调用 `create_protocol_draft`；本地浏览器 UI 也以 MCP JSON-RPC 请求创建草稿。
- 用户决定：为本地已归档的 protocol collection 建立可视化网站。
- 已新增 `archive-dashboard.html`（助手判断）：作为总览页，运行时读取 `data/sessions/<session-id>/result.json`，展示收集覆盖度、元数据健康度、实际检索过的网站及每个归档批次。
- 已在 `index.html` 和 `process-manager.html` 加入通向总览页的链接。
- 已补充仓库级 `AGENTS.md`、`README.md`（助手判断）：记录数据边界、本地页面入口、HTTP 启动方式和验证命令。
- 已核对 Protocols.io 官方条款（助手判断，非法律意见）：公开用户 protocol 内容被声明为 CC BY；但条款同时禁止自动化搜索/提取/链接/索引，以及为建立数据库而复制、下载或存储站点内容。现有元数据归档没有保存协议正文，版权风险较低，但若其采集方式属于自动化爬取，仍有未解决的条款合规风险。
- 已整理 `archive-dashboard.html` 的来源明细（助手判断）：合并 `doi.org` 和 `dx.doi.org` 为一个 DOI resolver 行，并增加“定位 / 使用边界”列；分类为公开 protocol 平台、元数据/DOI 核验、期刊/开放知识库、官方机构或试剂商资料。
- 已逐站完成当前归档来源的初步版权/条款审阅（助手判断，非法律意见）：Crossref 元数据可用性最高；PLOS 文章为 CC BY；Protocols.io、Bio-protocol、PMC、NCBI、FDA 需按记录或材料核验；Addgene、NEB、Thermo Fisher、BD、QIAGEN、Abcam、Broad、MMPC、QB3 和 Zymo 没有适合本项目镜像 protocol 正文的通用许可。厂商资料及网页正文仍只保存链接和最小元数据。
- 未改动任何 crawler 归档 JSON，也未复制协议原文、表格、图片、视频或 PDF。

## 现在真实状态

- 本次实际运行 `labrecord-protocol-mcp-demo/npm run demo:agent`：成功通过 MCP 创建 `protocol_aaee9c83-de3b-4757-ab04-b217bdb11120`；该草稿有 2 个步骤、2 个待审核项，状态为 `draft`（命令输出，2026-08-20T06:46:27.256Z）。
- 本次实际运行 `npm test`（位于 `labrecord-protocol-mcp-demo/`）：3/3 通过；覆盖有效草稿、缺少步骤、未知字段被拒绝。
- 本次浏览器验证：本地 `http://127.0.0.1:3333` 可显示导入 UI 和已存草稿；点击 “Create review draft via MCP” 后出现创建成功状态，并显示新草稿的 2 review flags。
- 本次实际运行 `node data/validate-session-results.mjs`：43 个计划批次中，9 complete、5 partial、29 missing、0 blocked、0 in-progress、0 invalid。
- 本次运行 `node data/validate-session-results.mjs`：43 个计划批次中，9 complete、5 partial、29 missing、0 blocked、0 in-progress、0 invalid。
- 14 个本地 `result.json` 可读取，覆盖 51 个已写入分类；以上统计以本次验证输出为准。
- 本次通过本地 HTTP 服务验证：`archive-dashboard.html` 返回 HTTP 200，且 `data/sessions/molecular-engineering/result.json` 可读取和解析。
- 新页面文件：`archive-dashboard.html`，页面内联 JavaScript 已用 Node 语法解析检查。
- 本次修改后页面经本地 HTTP 服务返回 HTTP 200；数据验证仍为 9 complete、5 partial、29 missing、0 invalid。
- 本次版权审阅后再次运行 `node data/validate-session-results.mjs`：9 complete、5 partial、29 missing、0 blocked、0 in-progress、0 invalid。

## 卡在哪

- LabRecord staging 网站没有提供源码、写入 API、数据库或认证权限：demo 不能、也没有尝试向 `labrecord-frontend-staging-4cyxyjjnia-uw.a.run.app` 写入数据。下一步：取得后端/API 契约和测试环境凭据后，用现有 MCP 服务替换本地 JSON store。
- 当前 demo 的 PDF/图片选择器只保存浏览器本地的文件名引用，不上传或 OCR 原始内容。下一步：接入 LabRecord 的受认证、签名上传端点，再让 Agent 使用对应 `file_id`、页码/图片区域作为 `sourceReference`。
- 29 个计划批次尚未有 `result.json`：需要分别完成对应 crawler packet，并写入其固定目录。
- 5 个已写入批次为 partial：需要根据各自 `coverageGaps` 和 `nextSearchSuggestions` 继续补充；不要把不同 method variant 混成同一代表记录。
- Protocols.io 若继续作为自动化采集来源：应先取得书面许可或使用其明确允许的 API/导出渠道；在明确前，不应继续自动化采集或把该站内容作为可公开分发的数据库。

## 还没验证的

- 未获得或核对真实 LabRecord 的 Protocol API、数据库 schema、认证/实验室租户模型；demo 的 schema 是根据用户截图中可见字段建模，可能需要适配真实字段名。
- 未接入真实 PDF 文本提取、OCR、语音转写或大模型结构化，因此 demo 只证明 “结构化草稿 → MCP → 网站” 闭环，尚未证明各类源文件的解析准确度。
- 未做生产 OAuth、跨 Lab 权限隔离、恶意文档内容处理、文件存储生命周期或部署到 Cloud Run 的验证。
- 尚未做浏览器视觉检查或交互点击检查；仅确认页面和示例 JSON 经本地 HTTP 服务可访问。
- “来源网站”按归档 JSON 中的 URL 出现次数统计；它不是联网重新验证，也不代表网站当前可访问状态。
- 未逐条确认所有 Protocols.io 记录的页面许可展示、作者身份与潜在第三方材料权利；平台的 CC BY 声明不等于其他嵌入材料、商标或来源文件均可复用。
- 本次审阅是来源级规则，尚未逐条核对 51 个代表记录及全部备选记录的许可版本、第三方图表、作者/机构权利和适用法域。公开发布或全文复用前必须完成记录级核验。

## 要用户定的

- 若取得 LabRecord GitHub/API 访问：确认 Protocol 的真实实体字段、草稿/发布流程、Lab membership 授权方式、源文件保留策略，以及是否允许 MCP 创建草稿还是也允许更新已发布版本。
- 演示时，是否以当前 “本地 Protocol-only demo + MCP endpoint” 作为明天的展示版本；它不触及线上 staging 数据。
- 是否把该页面作为纯本地工具继续使用，还是在所有归档批次补齐后再考虑发布到共享站点。
- 是否联系 Protocols.io 取得自动化采集/本地元数据索引的书面许可；在未获得许可前，是否暂停将该站作为新的自动化收集来源。
