# PDF 与官方链接转化对照

## 对照方法

- `codex-pdf/`：2026-08-22 由附件 PDF 生成的 7 份基线 JSON。
- `claude-link/`：2026-08-22 从 PDF 提取的官方 URL、以及这些页面直接链接的厂商/机构说明书独立生成的 JSON。生成这组时没有读取附件正文或基线 JSON。文件名后缀为 `*-claude-link.json`。
- claude-link JSON 的每个 `steps[]` 都通过 `sourceReferences[].excerpt` 记录其官方来源步骤或小节。它是源步骤到 JSON 步骤的可检索映射，不依赖文档外的编号表。
- 以下统计以 JSON 的当前内容为准。`needsReview` 使用仓库 `renderer/validate.mjs` 的统计口径。

## 结构字段覆盖

| 协议 | PDF：steps / materials / tables / parameters / review | Link：steps / materials / tables / parameters / review | Link 源步骤映射 | 解释 |
|---|---:|---:|---:|---|
| PCR-001 | 10 / 9 / 1 / 5 / 3 | 7 / 7 / 2 / 1 / 4 | 7/7 | NEB 只有 2 个编号指令，另有反应与循环表；link 逐一保留 6 个循环行。PDF 组额外拆出了 master mix、模板、聚合酶和 post-run 等执行性步骤。 |
| GAM-001 | 12 / 14 / 1 / 1 / 7 | 7 / 4 / 1 / 0 / 11 | 7/7 | Addgene 链接是设计指南，未给出选定载体；link 只能映射其 7 个有顺序的设计/克隆计划小节。 |
| EGB-001 | 10 / 7 / 1 / 1 / 4 | 10 / 7 / 2 / 6 / 2 | 10/10 | Thermo 的 UltraPure Agarose 分支有明确的 10 条 directions，link 与其一一对应。 |
| NAP-001 | 14 / 13 / 1 / 10 / 3 | 11 / 8 / 0 / 17 / 1 | 11/11 | QIAGEN 说明书有明确 11 步，link 与其一一对应；PDF 组把若干源步骤拆分，并加入后续定量/记录。 |
| PWP-001 | 10 / 9 / 1 / 2 / 6 | 5 / 3 / 0 / 3 / 7 | 5/5 | 直接链接的 T-PER user guide 只有 5 个组织裂解步骤；PDF 基线混合了 RIPA、培养细胞和组织裂解范围。 |
| MC-001 | 9 / 7 / 2 / 2 / 5 | 5 / 5 / 1 / 3 / 7 | 5/5 | NEB 有 3 个 digest steps、反应 setup 和 1 个条件化 cleanup 指引；具体酶条件仍不可选择。 |
| QQC-001 | 11 / 6 / 1 / 1 / 2 | 9 / 3 / 1 / 2 / 4 | 9/9 | NanoDrop 用户指南有明确 9 步，link 与其一一对应。 |

`parameters` 是结构化 `steps[].parameters[]` 的数目，而非表格单元格数。故 PCR 的配方和循环数值保存在两张 `tables` 中；NAP 的参数数更高，是因为逐源步骤保留了离心、温度、时间、体积和倒转次数。

## 数值比较

| 协议 | 可直接比较的数值 | 结论 |
|---|---|---|
| PCR-001 | Q5 反应配置和常规循环表 | 重叠配方与循环数值一致；link 将其保存在独立表格中。 |
| EGB-001 | 1 g agarose、100 mL 1X TBE、50–55 °C/10 min、5 µL stain、30 min、100 V/40 min | link 给出 Thermo UltraPure Agarose 方案的完整数值。PDF 基线是较通用的跑胶描述，不能把未写出的数值当作不一致。 |
| NAP-001 | 5 mL、37 °C/12–16 h、250/250/350/500/750/60 µL、3/5/10 min 等 | link 与 QIAGEN 11 步原始说明书一致；其 60 µL Buffer EB 与 PDF 基线中的 50 µL 通用洗脱建议不同，后者不应覆盖厂家 high-yield 说明书。 |
| PWP-001 | T-PER ~1 g:20 mL、10,000 × g/5 min | link 是具体 T-PER 组织裂解手册；PDF 基线的 5–30 min 和 −80 °C 属于泛化 RIPA/T-PER 流程，无法视为同一来源的数值冲突。 |
| MC-001 | 50 µL、1 µg DNA、5 µL buffer、1 µL enzyme、10 µL stop solution | 重叠的典型反应配置一致。温度和消化时长必须由所选限制酶决定，两组均不应填固定值。 |
| QQC-001 | 1–2 µL blank 和 sample | link 直接保留用户指南的上样量。PDF 基线中通用的“推荐体积”不应替代这一精确来源。 |
| GAM-001 | 无可比的执行数值 | 官方链接未指定 gRNA 载体，因此没有可安全比较或补齐的退火、酶切、连接和转化数值。 |

## 对照结论

1. 先前 link 组的 **38 steps** 是二次合并造成的，不能用于判断 PDF 转化是否丢失信息。重做后 link 组为 **54 steps**；其中 EGB、NAP、QQC 和 PWP 分别保留了可用的 10、11、9、5 个源级原子步骤。
2. 步数仍不必与 PDF 组相同：PCR 的主源将多个热循环阶段写成一张表；GAM 未提供载体特异协议；PWP 的直接来源只覆盖 T-PER 组织裂解。这些是来源范围差异，不是自动转化损失的证据。
3. 对“是否发生压缩”的可靠判断应按上述原子步骤映射和数值表逐项进行。若需要真正一对一的 gRNA 克隆或限制酶消化对照，必须先指定载体或限制酶，或取得包含它们的官方协议链接。
