(() => {
  const sessions = [
    { id:"molecular-pcr-core", title:"PCR core methods", domain:"Molecular biology", mode:"focused", categoryIds:["pcr-endpoint","pcr-quantitative","pcr-reverse-transcription"], note:"Keep endpoint PCR, qPCR, and RT-PCR as separate returned category results." },
    { id:"molecular-pcr-variants", title:"PCR variants and genotyping", domain:"Molecular biology", mode:"batch", categoryIds:["pcr-digital","pcr-long-range","genotyping-pcr"], note:"Separate amplification chemistry and genotyping use cases." },
    { id:"molecular-extraction-qc", title:"Nucleic acid extraction and cleanup", domain:"Molecular biology", mode:"focused", categoryIds:["dna-extraction","rna-extraction","small-rna-extraction","dna-rna-cleanup"], note:"Keep DNA, total RNA, small RNA, and cleanup variants distinct." },
    { id:"molecular-conversion-detection", title:"Nucleic acid conversion and detection", domain:"Molecular biology", mode:"batch", categoryIds:["cdna-synthesis","dna-sequencing-sanger","southern-blot","northern-blot"], note:"Return one result per conversion, sequencing, or blotting category." },
    { id:"molecular-dna-assembly", title:"DNA digestion, ligation, and assembly", domain:"Molecular biology", mode:"focused", categoryIds:["restriction-digest","dna-ligation","gibson-assembly","golden-gate"], note:"Do not merge restriction-ligation and isothermal/type-IIS assembly records." },
    { id:"molecular-engineering", title:"Plasmid and CRISPR engineering", domain:"Molecular biology", mode:"focused", categoryIds:["site-directed-mutagenesis","plasmid-miniprep","bacterial-transformation","crispr-guide-design","crispr-gene-editing"], note:"Keep cloning, transformation, guide design, and editing records separate." },

    { id:"protein-prep-gel-blot", title:"Protein preparation, gels, and Western blot", domain:"Protein and biochemistry", mode:"focused", categoryIds:["protein-extraction","protein-quantification","sds-page","western-blot"], note:"Separate extraction, assay, gel, and immunoblot records." },
    { id:"protein-immuno-enrichment", title:"Protein immunoassays and enrichment", domain:"Protein and biochemistry", mode:"focused", categoryIds:["elisa","immunoprecipitation","co-immunoprecipitation","affinity-purification"], note:"Do not treat ELISA and enrichment workflows as interchangeable." },
    { id:"protein-chromatography", title:"Protein chromatography and exchange", domain:"Protein and biochemistry", mode:"batch", categoryIds:["size-exclusion","ion-exchange","protein-dialysis"], note:"Keep separation mechanism and buffer-exchange scope explicit." },
    { id:"protein-activity-binding", title:"Protein activity and binding assays", domain:"Protein and biochemistry", mode:"focused", categoryIds:["enzyme-kinetics","spectrophotometric-assay","spr-binding"], note:"Preserve readout and instrument differences." },
    { id:"protein-structure-thermodynamics", title:"Protein structure and thermodynamics", domain:"Protein and biochemistry", mode:"batch", categoryIds:["protein-crystallization","itc-binding"], note:"Use distinct outputs for crystallization and calorimetry." },

    { id:"cell-maintenance", title:"Mammalian cell maintenance and banking", domain:"Cell biology", mode:"focused", categoryIds:["cell-culture-maintenance","cell-thawing","cell-cryopreservation","mycoplasma-testing"], note:"Keep routine culture, recovery, banking, and contamination testing separate." },
    { id:"cell-delivery", title:"Cell transfection and viral delivery", domain:"Cell biology", mode:"focused", categoryIds:["transfection","viral-transduction","lentivirus-production"], note:"Retain delivery chemistry and virus-production variants separately." },
    { id:"cell-fate-assays", title:"Cell viability, proliferation, and fate", domain:"Cell biology", mode:"focused", categoryIds:["cell-viability","cell-proliferation","apoptosis-assay","cell-cycle"], note:"Keep each assay readout as a separate category result." },
    { id:"cell-phenotype-assays", title:"Cell phenotype and migration assays", domain:"Cell biology", mode:"batch", categoryIds:["clonogenic-assay","wound-healing","transwell-migration"], note:"Separate colony formation, scratch closure, and Transwell readouts." },
    { id:"cell-complex-models", title:"Primary cells and organoid models", domain:"Cell biology", mode:"focused", categoryIds:["organoid-culture","primary-cell-isolation"], note:"Materially different specimens or organoid systems must remain variants." },

    { id:"immuno-staining-cytometry", title:"Immunostaining and cytometry", domain:"Immunology", mode:"focused", categoryIds:["immunofluorescence","immunohistochemistry","flow-cytometry","cell-sorting"], note:"Keep tissue staining, flow panels, and sorting methods distinct." },
    { id:"immuno-cell-functions", title:"Immune-cell isolation and function", domain:"Immunology", mode:"focused", categoryIds:["pbmc-isolation","t-cell-activation","cytokine-assay","cytotoxicity-assay"], note:"Preserve cell type, stimulation, and readout variants." },

    { id:"microbial-culture-growth", title:"Microbial culture, growth, and CFU", domain:"Microbiology", mode:"batch", categoryIds:["bacterial-culture","bacterial-growth-curve","cfu-enumeration"], note:"Keep culture, kinetic growth, and enumeration as separate results." },
    { id:"microbial-response-transfer", title:"Microbial response and transfer", domain:"Microbiology", mode:"batch", categoryIds:["antimicrobial-susceptibility","biofilm-assay","bacterial-conjugation"], note:"Do not merge antimicrobial response, biofilm, and conjugation methods." },
    { id:"microbial-specialty", title:"Specialty microbial assays", domain:"Microbiology", mode:"batch", categoryIds:["phage-plaque-assay","yeast-culture","fungal-spore-assay"], note:"Keep host system and organism class explicit." },
    { id:"virology-infection-titration", title:"Virus infection and titration", domain:"Virology", mode:"focused", categoryIds:["virus-infection","viral-titration"], note:"Separate infection design from the titer readout." },

    { id:"genomics-dna-whole-genome", title:"DNA libraries and whole-genome sequencing", domain:"Genomics and sequencing", mode:"focused", categoryIds:["ngs-library-dna","whole-genome-sequencing","whole-exome-sequencing","targeted-panel-sequencing"], note:"Keep library chemistry and sequencing scope as distinct category results." },
    { id:"genomics-rna-bulk", title:"RNA libraries and bulk RNA-seq", domain:"Genomics and sequencing", mode:"focused", categoryIds:["ngs-library-rna","bulk-rna-seq"], note:"Separate library preparation from the complete bulk workflow." },
    { id:"genomics-amplicon-microbiome", title:"Amplicon and microbiome sequencing", domain:"Genomics and sequencing", mode:"focused", categoryIds:["amplicon-sequencing","16s-amplicon","shotgun-metagenomics"], note:"Do not merge marker-gene and shotgun approaches." },
    { id:"genomics-single-cell-spatial", title:"Single-cell and spatial sequencing", domain:"Genomics and sequencing", mode:"focused", categoryIds:["single-cell-rna-seq","single-cell-atac-seq","spatial-transcriptomics"], note:"Keep assay modality and platform-specific variants separate." },
    { id:"genomics-chromatin", title:"Chromatin accessibility and profiling", domain:"Genomics and sequencing", mode:"focused", categoryIds:["atac-seq","chip-seq","cut-run","cut-tag"], note:"Return one result per chromatin assay; do not merge antibody- and transposase-based methods." },
    { id:"genomics-methylation-crispr", title:"Methylation sequencing and CRISPR screens", domain:"Genomics and sequencing", mode:"batch", categoryIds:["bisulfite-sequencing","crispr-screen"], note:"Keep epigenetic sequencing and perturbation-screen workflows distinct." },

    { id:"proteomics-core-quant", title:"Core quantitative proteomics", domain:"Proteomics and metabolomics", mode:"focused", categoryIds:["lc-ms-proteomics","label-free-proteomics","tmt-proteomics"], note:"Separate sample preparation, label-free quantification, and isobaric labeling." },
    { id:"proteomics-phospho-metabolite", title:"Phosphoproteomics and targeted metabolite work", domain:"Proteomics and metabolomics", mode:"focused", categoryIds:["phosphoproteomics","metabolite-extraction","targeted-metabolomics"], note:"Preserve enrichment and metabolite-extraction boundaries." },
    { id:"metabolomics-lipid-gcms-nmr", title:"Lipidomics, GC-MS, and NMR metabolomics", domain:"Proteomics and metabolomics", mode:"batch", categoryIds:["lipidomics","gc-ms-metabolomics","nmr-metabolomics"], note:"Keep analytical platform and analyte class explicit." },

    { id:"histology-processing", title:"Tissue processing and routine histology", domain:"Imaging and histology", mode:"focused", categoryIds:["sample-fixation","paraffin-embedding","cryosectioning","he-staining"], note:"Retain fixation, embedding, sectioning, and staining as separate outputs." },
    { id:"fluorescence-imaging", title:"Fluorescence and live-cell imaging", domain:"Imaging and histology", mode:"focused", categoryIds:["confocal-microscopy","live-cell-imaging","super-resolution"], note:"Keep imaging modality and live/fixed preparation variants separate." },
    { id:"advanced-imaging-analysis", title:"Advanced imaging and image analysis", domain:"Imaging and histology", mode:"batch", categoryIds:["electron-microscopy","image-analysis","clearing-3d-imaging"], note:"Do not merge sample preparation, computational analysis, and clearing workflows." },

    { id:"plant-nucleic-culture", title:"Plant nucleic acids and tissue culture", domain:"Plant biology", mode:"focused", categoryIds:["plant-dna-extraction","plant-rna-extraction","agrobacterium-transformation","plant-tissue-culture"], note:"Separate molecular extraction from transformation and regeneration workflows." },
    { id:"plant-cells-physiology", title:"Plant cells, germination, and physiology", domain:"Plant biology", mode:"batch", categoryIds:["protoplast-isolation","seed-germination","photosynthesis-assay"], note:"Keep organism stage and readout explicit." },
    { id:"animal-tissue-neural", title:"Animal tissue, perfusion, and primary neurons", domain:"Animal and developmental biology", mode:"focused", categoryIds:["animal-tissue-collection","perfusion-fixation","primary-neuron-culture"], note:"Do not merge collection, fixation, and primary neural culture records." },

    { id:"bioinformatics-read-processing", title:"Sequence read processing", domain:"Bioinformatics", mode:"focused", categoryIds:["fastq-qc","read-trimming","short-read-alignment"], note:"Keep QC, trimming, and alignment as separate category outputs." },
    { id:"bioinformatics-rna-single-cell", title:"RNA-seq and single-cell analysis", domain:"Bioinformatics", mode:"focused", categoryIds:["rna-seq-quantification","differential-expression","single-cell-analysis"], note:"Do not merge quantification, statistical comparison, and single-cell analysis." },
    { id:"bioinformatics-variants-peaks-microbiome", title:"Variants, peaks, and microbiome analysis", domain:"Bioinformatics", mode:"focused", categoryIds:["variant-calling","somatic-variant-calling","chip-atac-peak-calling","metagenomics-analysis"], note:"Preserve germline/somatic distinction and analysis modality." },
    { id:"bioinformatics-phylogeny-structure", title:"Phylogeny and structural bioinformatics", domain:"Bioinformatics", mode:"batch", categoryIds:["phylogenetic-analysis","protein-structure-prediction","molecular-docking"], note:"Return a distinct result per analysis objective." },

    { id:"lab-operations-prep", title:"Laboratory preparation operations", domain:"Laboratory operations", mode:"batch", categoryIds:["buffer-preparation","sterile-technique","sample-aliquoting","centrifugation"], note:"Keep each general laboratory operation separate." },
    { id:"lab-operations-qc-design", title:"Laboratory QC and experimental design", domain:"Laboratory operations", mode:"batch", categoryIds:["filtration","spectrophotometer-qc","sample-integrity-qc","biological-replicates"], note:"Do not treat planning or QC operations as wet-lab assay protocols." }
  ];

  const categories = Array.isArray(window.COMMON_PROTOCOL_CATEGORIES) ? window.COMMON_PROTOCOL_CATEGORIES : [];
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const assigned = sessions.flatMap((session) => session.categoryIds);
  const duplicateCategoryIds = assigned.filter((id, index) => assigned.indexOf(id) !== index);
  const unknownCategoryIds = assigned.filter((id) => !categoryById.has(id));
  const unassignedCategoryIds = categories.map((category) => category.id).filter((id) => !assigned.includes(id));

  window.COLLECTION_SESSION_BATCHES = sessions.map((session) => ({ ...session, categoryCount:session.categoryIds.length }));
  window.COLLECTION_SESSION_VALIDATION = {
    sessionCount:sessions.length,
    assignedCategoryCount:assigned.length,
    duplicateCategoryIds:[...new Set(duplicateCategoryIds)],
    unknownCategoryIds:[...new Set(unknownCategoryIds)],
    unassignedCategoryIds
  };

  window.buildCollectionSessionPrompt = (session, inputCategories) => {
    const categoryPackets = inputCategories.map((category) => ({
      id:category.id,
      domain:category.domain,
      label:category.label,
      aliases:category.aliases,
      priority:category.priority,
      assayTypes:category.assayTypes,
      searchObjects:category.searchObjects,
      notes:category.notes
    }));
    const sessionPacket = {
      id:session.id,
      title:session.title,
      domain:session.domain,
      mode:session.mode,
      categoryCount:categoryPackets.length,
      categoryIds:categoryPackets.map((category) => category.id),
      note:session.note
    };
    const expectedCategoryIds = categoryPackets.map((category) => category.id);
    const resultPath = `data/sessions/${session.id}/result.json`;

    return `You are an independent Protocol Atlas crawler responsible for one complete collection packet. Treat this conversation as a self-contained crawler, not as a research assistant that returns data to a coordinator. You own the research, source verification, self-check, and local result write for this packet. Continue until every assigned category is complete, partial with explicit gaps, or blocked with a concrete reason.

SESSION PACKET
${JSON.stringify(sessionPacket, null, 2)}

CATEGORY PACKETS
${JSON.stringify(categoryPackets, null, 2)}

OWNED DATA OUTPUT
- Read data/README.md and data/session-result.schema.json before writing.
- Your only writable crawler output path is: ${resultPath}
- Create that directory if it does not exist, then write one valid JSON file named result.json. Do not create or edit a central index: the static website already knows this fixed path.
- Do not edit another crawler's data/sessions/<session-id>/ directory, common-protocol-categories.js, collection-session-batches.js, process-manager.html, or queue configuration.
- After writing, re-read result.json, parse it as JSON, and self-check that sessionId, category IDs, status, source URLs, and verification fields match this packet.
- In your final chat response, give only a concise completion summary, packet status, and the written path. Do not paste the JSON into chat. The data file, not the chat response, is the deliverable.

PROJECT FILE MAP
- data/README.md: authoritative crawler rules and local-server instructions.
- data/session-result.schema.json: required JSON contract for this packet.
- data/sessions/<session-id>/result.json: isolated output for one assigned crawler packet; this is the only path you may write.
- data/ad-hoc/<category-id>/result.json: coordinator-approved exception work only; do not use it for this packet.
- process-manager.html: coordinator dashboard and prompt copier. It reads result files but must not be edited by crawlers.
- index.html: delivery catalog. It reads session result files and shows one representative with screened alternatives hidden by default.

CRAWLER WORKFLOW
- Process every category packet independently inside this one crawler run. This packet has multiple categories to reduce chat count, but result.json must retain a separate categoryResults entry for each category.
- Do not open a separate task for each source record. A category can contain many public protocol records and meaningful variants.
- Return one representative protocol per category only when it is the strongest specific, authoritative, complete, reproducible-looking match. Retain meaningful alternatives as screened records with reasons.
- If a category is too broad because of material organism, specimen, platform, chemistry, safety, or readout differences, record a suggested child category in coverageGaps instead of silently mixing variants.
- Do not stop after finding one plausible source. Search across the relevant public source families until the packet has coverage for every assigned category or an explicit, evidence-based blocked/partial state. "Complete" means the defined category has been systematically covered against the stated source scope; it does not mean every protocol ever published has been found.

COVERAGE AND STATUS GATES
- Before selecting a representative, make a short variant matrix for each category: specimen or organism, platform, chemistry, intended readout, safety context, and major workflow family. Use it to decide whether the category is complete or needs child categories.
- Mark a category partial when the representative covers only one material variant, when a major source family was inaccessible, or when an important child category has no qualified representative. Do not mark a broad category complete merely because one high-quality record exists.
- Use no-qualified-record only after searching the defined public source scope and recording the searches, candidates, and reason no representative qualified.
- Set packetStatus to partial whenever any category is partial, blocked, or no-qualified-record. Set it to complete only when every assigned category is complete and the verification fields prove that no category is missing.
- coverageGaps must name the missing variant or evidence type, and nextSearchSuggestions must be concrete searches or source families rather than generic reminders.

SOURCE NORMALIZATION
- Use a controlled canonical value in source, such as protocols.io, Bio-protocol, Nature Protocols, Nature Protocol Exchange, Addgene, New England Biolabs, Thermo Fisher Scientific, NCBI Bookshelf, PubMed Central, or the named publisher/organization. Match capitalization exactly and do not use protocols.io / Partner or Protocols.io as composite source labels.
- Keep partner or author attribution in authors and selectionNote. Keep source as the host of the exact record URL. Put the stable DOI in doi and the direct record page or DOI landing page in sourceUrl.
- sourcesSearched should use the same canonical source names. Do not count a search-engine result page as a source family.

LICENSE AND EVIDENCE GATES
- Scientific match confidence, metadata verification, coverage completeness, and reuse rights are separate dimensions. Free access, an open-access article, a DOI, or a site-wide policy is not record-level license evidence.
- Set licenseEvidenceUrl only to an exact record-level license statement, exact source terms page that governs the record, or an explicit license field on the source record. A Crossref/API response can corroborate metadata but must not be the sole license evidence unless the source explicitly treats it as authoritative.
- If record-level license evidence is absent, use licenseCode:null (or Unknown), licenseEvidenceUrl:null, licenseVerifiedAt:null, and explain the uncertainty in evidenceStatus or selectionNote. Set verification.licenseEvidencePass to false when any representative lacks the required evidence.
- Never describe a record as reusable solely because it is publicly readable. Preserve copyright or exclusive-license statements as metadata and keep the record discovery-only when appropriate.

CONFIDENCE RUBRIC
- confidence is the scientific/category match score, not a completeness or reuse-rights score. Use 0.90-0.95 only for an exact direct record with strong metadata and corroboration; 0.80-0.89 for a strong but narrow or incompletely corroborated match; 0.70-0.79 for provisional matches; below 0.70 for weak discovery candidates.
- Do not assign 0.90 or higher to a category marked partial, blocked, or no-qualified-record. Do not inflate confidence to compensate for missing metadata or unclear licensing.
- scoreBreakdown.overall must equal confidence. Include coverageCompleteness, evidenceStrength, licenseClarity, and clusterAgreement when they can be assessed, and keep each component between 0 and 1.
- Write null rather than undefined for unknown scalar fields and [] for unknown lists. Never emit the literal string undefined.

METADATA, SOURCE, AND RIGHTS RULES
- This is metadata-first. Do not copy protocol instructions, tables, figures, videos, PDFs, or long source passages.
- Search only publicly accessible sources and respect terms, robots rules, API limits, and record-level licenses.
- Prefer direct, stable protocol pages, original repositories, publisher record pages, and DOI landing pages over search-result pages.
- Do not assume that free-to-read, open-access, or a site-wide Creative Commons statement grants reuse of a specific record.
- Record exact source URLs, source record IDs, DOIs, authors, publication dates, update dates, and record-level license evidence when available. Use null when unknown; never invent them.
- Preserve metadata, citations, source URLs, license-evidence URLs, and short evidence notes only. Do not store copied protocol steps, long source passages, figures, videos, or PDFs.
- For every screened candidate, preserve the same basic identity fields when available: source record ID, DOI, publication/update dates, confidence if assessed, license code/evidence, and metadata verification timestamp. A screened record may be rejected, but it must remain auditable.

WRITE THIS JSON CONTRACT TO ${resultPath}
{
  "schemaVersion": "1.0",
  "sessionId": "${session.id}",
  "sessionTitle": "${session.title}",
  "packetStatus": "complete | partial | blocked | in-progress",
  "startedAt": "YYYY-MM-DDTHH:MM:SSZ",
  "writtenAt": "YYYY-MM-DDTHH:MM:SSZ",
  "worker": "crawler session identifier",
  "sourcesSearched": [],
  "categoryResults": [
    {
      "categoryId": "one input category id",
      "categoryLabel": "one input category label",
      "status": "complete | partial | blocked | no-qualified-record",
      "searchedAt": "YYYY-MM-DD",
      "sourcesSearched": [],
      "representative": {
        "title": "",
        "protocolType": "",
        "assay": "",
        "operation": "",
        "source": "",
        "sourceUrl": "",
        "sourceRecordId": null,
        "doi": null,
        "authors": [],
        "published": null,
        "updated": null,
        "licenseCode": null,
        "licenseUrl": null,
        "licenseEvidenceUrl": null,
        "licenseVerifiedAt": null,
        "metadataVerifiedAt": "YYYY-MM-DDTHH:MM:SSZ",
        "specimen": null,
        "organism": null,
        "platform": null,
        "methodVariant": null,
        "safetyLevel": "not specified",
        "confidence": 0,
        "scoreBreakdown": {
          "recordSpecificity": 0,
          "sourceAuthority": 0,
          "metadataCompleteness": 0,
          "freshness": 0,
          "corroboration": 0,
          "overall": 0
        },
        "evidenceStatus": "unverified",
        "selectionNote": ""
      },
      "screened": [
        {
          "title": "",
          "source": "",
          "sourceUrl": "",
          "sourceRecordId": null,
          "doi": null,
          "published": null,
          "updated": null,
          "confidence": null,
          "licenseCode": null,
          "licenseUrl": null,
          "licenseEvidenceUrl": null,
          "licenseVerifiedAt": null,
          "metadataVerifiedAt": null,
          "evidenceStatus": "metadata-only",
          "screenStatus": "alternative | duplicate | wrong-variant | inaccessible | license-unclear",
          "reason": ""
        }
      ],
      "coverageGaps": [],
      "nextSearchSuggestions": []
    }
  ],
  "verification": {
    "expectedCategoryIds": ${JSON.stringify(expectedCategoryIds, null, 4)},
    "actualCategoryIds": ${JSON.stringify(expectedCategoryIds, null, 4)},
    "missingCategoryIds": [],
    "duplicateCategoryIds": [],
    "unexpectedCategoryIds": [],
    "coveragePass": true,
    "sourceUrlPass": true,
    "licenseEvidencePass": true,
    "selfVerifiedAt": "YYYY-MM-DDTHH:MM:SSZ",
    "selfCheckNotes": []
  },
  "runNotes": []
}

QUALITY BAR
- The categoryResults array must contain exactly one result for every input category packet, in the same order.
- Set packetStatus to complete only when verification.coveragePass is true, actualCategoryIds matches expectedCategoryIds exactly, and every category result has an appropriate completion or explicit no-qualified-record state.
- Partial and blocked files are valid only when coverageGaps and selfCheckNotes explain what remains and why.
- A representative without a unique record URL, DOI, or source record ID should normally remain provisional.
- Treat scientific match confidence, metadata verification, and license verification as separate dimensions.
- Never invent dates, authors, DOIs, licenses, source identifiers, or protocol contents. Do not claim the write is complete until result.json has been written and re-read successfully.
- Before finishing, scan the JSON for the literal string undefined, mixed source labels, confidence above the rubric for a partial category, and a true licenseEvidencePass when any representative lacks direct license evidence.`;
  };
})();
