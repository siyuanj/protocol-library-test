# 完整展示方案（给 mentor 看）

> 定位一句话：**为 LabRecord 建一套「通用的、跨学科的」协议数据结构 + 管理系统地基。**
> 之前做的是「关于协议的元数据目录」（标题/来源/许可/聚类），方向不对；现在做的是**协议内容本身**的通用标准（材料+用量、设备+参数、逐步 QC、控制项），以及围绕它的库/权限/版本管理系统。

当前完成度：**Section 1（格式标准）✅、Section 2（规范 Schema + 渲染器）✅、Section 3（库/版本/权限管理系统设计）✅**。Section 4（落库+API+网站实现）与 Section 5（解析/MCP）押后。

---

## 一、建议的演示顺序（怎么讲，约 10–12 分钟）

1. **问题与方向纠偏（1 min）**：为什么要「协议内容本身的通用数据结构」，而不是元数据目录。
2. **通用性是第一原则（2 min）**：打开 `renderer/demo.html`，左侧 5 个示例横跨**蛋白 / 分子 / 细胞 / 层析 / 定量**四类学科——说明 schema 没有任何学科专属字段，靠「类型化参数 + 单位自由文本 + other 兜底」适配任意学科（见第三节论证）。
3. **Section 2 数据结构（3 min）**：`canonical-schema.json` 是固定 JSON Schema；点任一协议展开「Show JSON source」，演示**同一份 JSON → 人类可读文档**（渲染器）。强调 `needsReview`——来源没写的值一律标橙、绝不编造。
4. **真实 PDF 生成的两个测试（1 min）**：Gel Filtration、Protein Concentration 是直接从你给的 `test_protocol/` 前两个 PDF 生成进标准格式的——证明标准能吃真实源文件（含三联标准曲线表）。
5. **前端呈现四版方案，请 mentor 选（2 min）**：打开 `renderer/design-options.html`，顶部切换 **Document / Checklist·Run / Timeline / Compact·Print**，同一份数据四种界面，问 mentor 更偏好哪种（或分场景各用）。
6. **Section 3 管理系统设计（3 min）**：`03-library-version-design.md`——Public/Private/Lab 三库的归属与权限、引用/fork/版本/血缘、提交→审核→批准流程、归档与许可保全；这些**只作用于版本记录，不看协议学科内容**，所以对所有学科一致。
7. **路线图（1 min）**：Section 4 落地（DB+内部 API+网站，保存前校验、旧数据迁移、三视图、按版本建 run）；Section 5 解析（LLM 把 PDF/图片→JSON，MCP 类）押后。

---

## 二、怎么打开（现场跑）

```bash
# 校验全部协议 JSON（结构 + 引用完整性）
node protocol-standard/renderer/validate.mjs
# 起本地服务后浏览器打开
node protocol-standard/serve.mjs
#   → http://localhost:4173/renderer/demo.html            主渲染 demo
#   → http://localhost:4173/renderer/design-options.html  四版前端方案对比
```

或直接双击打开 `renderer/demo.html` / `renderer/design-options.html`（已自包含，file:// 也能跑）。

现状：`validate.mjs` = **5/5 通过**；两个页面浏览器实测 0 报错。

---

## 三、通用性论证（回应「无论哪个学科都要适用」）

1. **Schema 无学科字段**：只有 `metadata / materials / equipment / steps / controls / expectedOutputs / troubleshooting / safety / sources / provenance`，全是通用槽位。
2. **参数是「类型化 + 单位自由文本 + other 兜底」**：`parameter.type` 枚举已扩到 `time/temperature/volume/speed/concentration/mass/ratio/pH/count/length/area/pressure/wavelength/frequency/voltage/current/force/energy/dataSize/other`——覆盖物理/化学/生物/计算；任何没列到的量用 `other` + 自由 `unit` 表达。
3. **示例本身跨学科**：蛋白（WB）、分子（qPCR）、细胞（传代）、分离（层析）、定量（A280/BCA/Bradford）。
4. **换个学科怎么落**（举例，说明映射）：
   - *有机合成*：materials=试剂（含 CAS/摩尔量）、steps 参数用 `temperature/pressure/time/mass`、expectedResult=产率/纯度。
   - *生物信息*：materials=输入数据集、equipment=软件/算力、steps 参数用 `dataSize/count/time`、sources 挂 DOI。
   - *电生理/物理*：参数用 `voltage/current/frequency/force/energy`。
   - 结论：**同一套结构、同一个渲染器、同一套管理系统**，无需为学科改 schema。

---

## 四、参考的优秀 GitHub / 开源项目（借鉴点）

| 项目 | 借鉴点 | 链接 |
|---|---|---|
| **protocols.io**（API v3 数据模型） | Step→StepComponent 的**类型化组件**（Amount/Duration/Temperature/Concentration）、`cases[]` 分支、版本化 DOI、fork | github.com/ethanwillis/protocolsio_schemas |
| **LabOP / Bioprotocols**（原 PAML） | 最完整的现代可执行协议模型：UML 控制流（分支/循环）、`Measure(value, unit)`、PROV 溯源 | github.com/Bioprotocols/labop |
| **ISA-tools（ISA-JSON）** | Investigation→Study→Assay 三层、Protocol/Parameter/ParameterValue、样品→数据 DAG 溯源 | github.com/ISA-tools/isa-api |
| **Opentrons JSON Protocol** | 官方**版本化 JSON Schema**、命令 `params` 强类型 | github.com/Opentrons/opentrons |
| **Open Reaction Database (ORD)** | 量的最佳建模：`Amount = oneof{Mass\|Moles\|Volume\|Concentration}{value, precision, unit}` | docs.open-reaction-database.org |
| **schema.org HowTo + Bioschemas LabProtocol** | Web 可发现 JSON-LD、`QuantitativeValue`（value+unit+**min/max**）、HowToSection 分组 | bioschemas.org/profiles/LabProtocol |

> 结论：我们的 v0.1 已经吸收了这些的核心思想（类型化参数、范围、分组、血缘/版本、许可）。**v0.2 可选升级**：单位改用 UCUM 标准码、amount 与试剂身份解耦、expectedResult 结构化并支持 `onFail` 分支、加一层 JSON-LD `@context` 对接 schema.org/OBO（详见 `01-literature-summary.md` 与各 agent 调研）。

---

## 五、交付物清单（都在 `protocol-standard/`）

- `01-literature-summary.md`：文献/标准调研 + 对比表 + 引用（Section 1.1）
- `02-format-standard.md`：选定格式 + 理由段 + 局限（Section 1.2/1.3）
- `canonical-schema.json`：通用固定 JSON Schema（Section 2.1/2.2）
- `examples/*.{md,json}`：3 个规定示例 + 2 个真实 PDF 生成（Section 1.4 / 2.3）
- `renderer/`：渲染器（`renderer.js` 核心 + `ProtocolRenderer.jsx` React 版）、校验器、`demo.html`、`design-options.html`（四版前端）
- `03-library-version-design.md`：管理系统设计（Section 3）
- `README.md`：总览与运行方式

---

## 六、要 mentor / 你拍板的

1. **前端方案**：四版里选哪个作主界面？（建议：阅读/发布用 Document，做实验用 Checklist·Run，二者都要。）
2. **管理系统范围**：Section 4 先做「三库 + 版本 + 校验保存」最小闭环，还是一步到位含 Lab 审核流？
3. **v0.2 schema 升级**是否现在就上（UCUM 单位、amount 解耦、结构化 QC、JSON-LD）——会更规范但更重。
4. 具体要收哪些学科的 protocol 列表（你说之后给）——给了之后我按此标准逐条生成。
