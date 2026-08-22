/*
 * Phase 1 category registry for parallel protocol-collection sessions.
 * This file contains category metadata and search objects only; it does not
 * reproduce protocol instructions or source text.
 */
(function () {
  const categories = [];
  const add = (domain, id, label, aliases, priority, assayTypes, searchObjects, notes) => {
    categories.push({
      id,
      domain,
      label,
      aliases,
      priority,
      assayTypes,
      searchObjects,
      notes,
      status: "not-started",
      representative: null,
      screenedCount: 0,
      candidateCount: 0
    });
  };

  // Molecular biology and nucleic acid workflows
  add("Molecular biology", "pcr-endpoint", "Conventional PCR", ["PCR", "endpoint PCR", "DNA amplification"], "core", ["amplification", "genotyping", "cloning"], ["conventional PCR protocol", "endpoint PCR protocol", "DNA amplification protocol"], "Separate from RT-PCR, qPCR, digital PCR, and long-range PCR when the chemistry or readout changes.");
  add("Molecular biology", "pcr-quantitative", "Quantitative PCR", ["qPCR", "real-time PCR", "RT-qPCR"], "core", ["quantitative amplification", "gene expression", "copy number"], ["qPCR protocol", "real-time PCR protocol", "SYBR probe qPCR"], "Track dye/probe chemistry and instrument platform as variants.");
  add("Molecular biology", "pcr-reverse-transcription", "Reverse transcription PCR", ["RT-PCR", "cDNA PCR", "reverse transcription"], "core", ["RNA-to-cDNA", "transcript detection"], ["reverse transcription PCR protocol", "RT-PCR protocol", "cDNA synthesis and PCR"], "Do not merge with qPCR unless the endpoint and quantification model match.");
  add("Molecular biology", "pcr-digital", "Digital PCR", ["dPCR", "ddPCR", "droplet digital PCR"], "common", ["absolute quantification", "rare variant detection"], ["digital PCR protocol", "ddPCR protocol", "droplet digital PCR"], "Keep platform and partitioning method as facets.");
  add("Molecular biology", "pcr-long-range", "Long-range PCR", ["long PCR", "high-fidelity amplification"], "common", ["large amplicon amplification"], ["long-range PCR protocol", "large amplicon PCR", "high-fidelity PCR"], "Separate by amplicon length and polymerase family.");
  add("Molecular biology", "dna-extraction", "Genomic DNA extraction", ["DNA isolation", "gDNA extraction"], "core", ["sample lysis", "DNA purification"], ["genomic DNA extraction protocol", "gDNA isolation protocol", "DNA purification from tissue"], "Keep organism, sample type, and extraction chemistry as variants.");
  add("Molecular biology", "rna-extraction", "Total RNA extraction", ["RNA isolation", "total RNA purification"], "core", ["RNA purification", "sample preparation"], ["total RNA extraction protocol", "RNA isolation protocol", "RNA purification from cells"], "Separate column, phenol, magnetic-bead, and plant workflows.");
  add("Molecular biology", "small-rna-extraction", "Small RNA enrichment", ["miRNA isolation", "small RNA purification"], "common", ["small RNA preparation"], ["small RNA extraction protocol", "miRNA isolation protocol", "small RNA enrichment"], "Keep size-selection chemistry explicit.");
  add("Molecular biology", "dna-rna-cleanup", "Nucleic acid cleanup and concentration", ["DNA cleanup", "RNA cleanup", "PCR cleanup"], "core", ["cleanup", "concentration", "buffer exchange"], ["PCR cleanup protocol", "DNA cleanup and concentration", "RNA cleanup protocol"], "Track input type and cleanup technology.");
  add("Molecular biology", "cdna-synthesis", "cDNA synthesis", ["reverse transcription", "first-strand cDNA"], "core", ["RNA-to-cDNA conversion"], ["cDNA synthesis protocol", "first strand cDNA synthesis", "reverse transcription protocol"], "Do not merge with RT-PCR unless PCR readout is part of the record.");
  add("Molecular biology", "restriction-digest", "Restriction enzyme digestion", ["restriction digest", "DNA digestion"], "core", ["DNA cutting", "mapping", "cloning"], ["restriction digest protocol", "restriction enzyme digestion", "DNA restriction mapping"], "Track enzyme, buffer system, and DNA substrate.");
  add("Molecular biology", "dna-ligation", "DNA ligation", ["ligation", "vector insert ligation"], "core", ["construct assembly", "DNA joining"], ["DNA ligation protocol", "vector insert ligation", "T4 DNA ligase protocol"], "Keep sticky-end, blunt-end, and adapter ligation separate.");
  add("Molecular biology", "gibson-assembly", "Gibson or isothermal assembly", ["Gibson assembly", "HiFi assembly", "NEBuilder"], "core", ["DNA assembly", "cloning"], ["Gibson assembly protocol", "isothermal DNA assembly", "HiFi DNA assembly"], "Record overlap design and fragment count as facets.");
  add("Molecular biology", "golden-gate", "Golden Gate assembly", ["Type IIS assembly", "modular cloning"], "common", ["DNA assembly", "modular cloning"], ["Golden Gate assembly protocol", "Type IIS cloning protocol", "modular DNA assembly"], "Keep enzyme cycling and part standard as variants.");
  add("Molecular biology", "site-directed-mutagenesis", "Site-directed mutagenesis", ["point mutation", "plasmid mutagenesis"], "core", ["construct editing", "variant generation"], ["site-directed mutagenesis protocol", "plasmid point mutation", "PCR mutagenesis"], "Separate whole-plasmid amplification from fragment replacement.");
  add("Molecular biology", "plasmid-miniprep", "Plasmid DNA miniprep", ["plasmid isolation", "alkaline lysis"], "core", ["plasmid purification"], ["plasmid miniprep protocol", "alkaline lysis plasmid prep", "plasmid DNA isolation"], "Track scale, host strain, and column or precipitation method.");
  add("Molecular biology", "bacterial-transformation", "Bacterial transformation", ["chemical transformation", "heat shock", "electroporation"], "core", ["plasmid introduction", "competent cells"], ["bacterial transformation protocol", "heat shock transformation", "electroporation protocol bacteria"], "Keep heat shock and electroporation as separate variants.");
  add("Molecular biology", "dna-sequencing-sanger", "Sanger sequencing", ["capillary sequencing", "plasmid sequencing"], "core", ["sequence validation", "construct QC"], ["Sanger sequencing protocol", "plasmid sequencing protocol", "capillary DNA sequencing"], "Separate sequencing reaction setup from post-reaction cleanup and analysis.");
  add("Molecular biology", "southern-blot", "Southern blot", ["DNA blotting", "Southern hybridization"], "common", ["DNA detection", "genome copy number"], ["Southern blot protocol", "Southern hybridization protocol", "DNA blotting"], "Track probe labeling and transfer format.");
  add("Molecular biology", "northern-blot", "Northern blot", ["RNA blotting", "Northern hybridization"], "common", ["RNA detection", "transcript size"], ["Northern blot protocol", "Northern hybridization protocol", "RNA blotting"], "Keep RNA integrity and probe type as facets.");
  add("Molecular biology", "crispr-guide-design", "CRISPR guide design and cloning", ["sgRNA design", "gRNA cloning", "CRISPR construct"], "core", ["genome editing setup"], ["CRISPR guide design protocol", "sgRNA cloning protocol", "gRNA construct assembly"], "Design and wet-lab delivery are related but separate collection targets.");
  add("Molecular biology", "crispr-gene-editing", "CRISPR genome editing", ["Cas9 editing", "base editing", "prime editing"], "core", ["gene knockout", "knock-in", "base editing"], ["CRISPR gene editing protocol", "Cas9 knockout protocol", "base editing protocol"], "Split by editor, delivery mode, and readout.");
  add("Molecular biology", "genotyping-pcr", "PCR-based genotyping", ["allele-specific PCR", "colony PCR", "genotyping"], "core", ["genotype confirmation", "colony screening"], ["PCR genotyping protocol", "colony PCR protocol", "allele-specific PCR"], "Keep colony PCR and organism genotyping separate where sample preparation differs.");

  // Protein, biochemistry, and analytical assays
  add("Protein and biochemistry", "protein-extraction", "Soluble protein extraction", ["cell lysis", "protein lysate"], "core", ["protein preparation", "cell lysis"], ["protein extraction protocol", "cell lysis protein assay", "soluble protein lysate"], "Track organism, compartment, lysis chemistry, and inhibitors.");
  add("Protein and biochemistry", "protein-quantification", "Protein concentration assay", ["BCA", "Bradford", "protein assay"], "core", ["protein quantification"], ["BCA protein assay protocol", "Bradford assay protocol", "protein concentration assay"], "Keep assay chemistry and standard protein explicit.");
  add("Protein and biochemistry", "sds-page", "SDS-PAGE", ["protein gel electrophoresis", "denaturing PAGE"], "core", ["protein separation"], ["SDS-PAGE protocol", "denaturing protein gel", "protein electrophoresis"], "Track gel percentage, reducing conditions, and sample type.");
  add("Protein and biochemistry", "western-blot", "Western blot", ["immunoblot", "Western blotting"], "core", ["protein detection", "antibody detection"], ["Western blot protocol", "immunoblot protocol", "western blotting"], "Keep transfer system, detection chemistry, and sample type as facets.");
  add("Protein and biochemistry", "elisa", "ELISA", ["enzyme-linked immunosorbent assay", "sandwich ELISA"], "core", ["protein quantification", "antigen detection"], ["ELISA protocol", "sandwich ELISA protocol", "enzyme-linked immunosorbent assay"], "Separate direct, indirect, sandwich, and competitive formats.");
  add("Protein and biochemistry", "immunoprecipitation", "Immunoprecipitation", ["IP", "antibody pull-down"], "core", ["protein enrichment", "target capture"], ["immunoprecipitation protocol", "antibody pull-down protocol", "IP assay"], "Co-IP is a separate interaction-focused category.");
  add("Protein and biochemistry", "co-immunoprecipitation", "Co-immunoprecipitation", ["co-IP", "protein interaction pull-down"], "core", ["protein interaction"], ["co-immunoprecipitation protocol", "co-IP protocol", "protein interaction pull-down"], "Track native versus cross-linked conditions.");
  add("Protein and biochemistry", "affinity-purification", "Affinity purification", ["His-tag purification", "GST purification", "tagged protein purification"], "core", ["protein purification"], ["His-tag protein purification protocol", "GST affinity purification", "tagged protein purification"], "Split by tag, resin, and native or denaturing mode.");
  add("Protein and biochemistry", "size-exclusion", "Size-exclusion chromatography", ["SEC", "gel filtration"], "common", ["protein purification", "complex separation"], ["size exclusion chromatography protocol", "SEC protein purification", "gel filtration protocol"], "Track column chemistry, calibration, and target size.");
  add("Protein and biochemistry", "ion-exchange", "Ion-exchange chromatography", ["IEX", "anion exchange", "cation exchange"], "common", ["protein purification"], ["ion exchange chromatography protocol", "anion exchange protein purification", "cation exchange protocol"], "Keep charge mode and pH regime as variants.");
  add("Protein and biochemistry", "enzyme-kinetics", "Enzyme kinetics assay", ["Michaelis-Menten", "activity assay"], "core", ["enzyme activity", "kinetics"], ["enzyme kinetics protocol", "Michaelis-Menten assay", "enzyme activity assay"], "Record substrate, readout, temperature, and fitting model.");
  add("Protein and biochemistry", "spectrophotometric-assay", "Spectrophotometric biochemical assay", ["absorbance assay", "colorimetric assay"], "common", ["enzyme activity", "metabolite measurement"], ["spectrophotometric assay protocol", "colorimetric biochemical assay", "absorbance assay"], "Keep target analyte and wavelength as facets.");
  add("Protein and biochemistry", "protein-dialysis", "Protein dialysis and buffer exchange", ["desalting", "buffer exchange"], "common", ["sample preparation", "protein formulation"], ["protein dialysis protocol", "buffer exchange protein", "protein desalting protocol"], "Track membrane cutoff and downstream use.");
  add("Protein and biochemistry", "protein-crystallization", "Protein crystallization", ["crystallization screen", "X-ray crystallography prep"], "common", ["structural biology", "crystal growth"], ["protein crystallization protocol", "crystallization screen protein", "protein crystal growth"], "Separate screening, optimization, harvesting, and cryoprotection.");
  add("Protein and biochemistry", "spr-binding", "Surface plasmon resonance binding assay", ["SPR", "Biacore"], "common", ["kinetic binding", "affinity measurement"], ["surface plasmon resonance protocol", "SPR binding assay", "Biacore kinetics"], "Track immobilization mode and analyte format.");
  add("Protein and biochemistry", "itc-binding", "Isothermal titration calorimetry", ["ITC", "thermodynamic binding"], "extended", ["binding thermodynamics"], ["isothermal titration calorimetry protocol", "ITC binding assay", "protein ligand thermodynamics"], "Track buffer matching, concentration regime, and analysis model.");

  // Cell biology and tissue culture
  add("Cell biology", "cell-culture-maintenance", "Mammalian cell culture maintenance", ["cell culture", "passaging", "confluency"], "core", ["cell growth", "routine culture"], ["mammalian cell culture protocol", "cell passaging protocol", "cell culture maintenance"], "Track cell line, medium, coating, and incubator conditions.");
  add("Cell biology", "cell-thawing", "Cell thawing and recovery", ["cryovial recovery", "cell recovery"], "core", ["cell bank recovery"], ["cell thawing protocol", "cell recovery after cryopreservation", "cryovial cell recovery"], "Separate primary cells and immortalized lines.");
  add("Cell biology", "cell-cryopreservation", "Cell cryopreservation and banking", ["cell freezing", "master cell bank"], "core", ["cell banking"], ["cell cryopreservation protocol", "cell freezing protocol", "cell bank preparation"], "Track cryoprotectant, cooling method, and cell type.");
  add("Cell biology", "mycoplasma-testing", "Mycoplasma testing", ["cell culture contamination", "mycoplasma assay"], "core", ["cell line QC"], ["mycoplasma testing protocol", "mycoplasma PCR assay", "cell culture contamination test"], "Keep PCR, luminescence, and staining methods separate.");
  add("Cell biology", "transfection", "Mammalian cell transfection", ["lipofection", "DNA transfection", "RNA transfection"], "core", ["gene delivery", "expression"], ["mammalian cell transfection protocol", "lipofection protocol", "siRNA transfection"], "Separate DNA, siRNA, mRNA, and reagent platforms.");
  add("Cell biology", "viral-transduction", "Viral transduction of cultured cells", ["lentiviral transduction", "AAV transduction"], "core", ["gene delivery", "stable expression"], ["viral transduction protocol", "lentiviral transduction", "AAV transduction cells"], "Split by vector family and target cell type.");
  add("Cell biology", "lentivirus-production", "Lentivirus production and titration", ["lentiviral packaging", "viral titer"], "common", ["viral vector production"], ["lentivirus production protocol", "lentiviral packaging protocol", "lentivirus titration"], "Keep production, concentration, and functional titration as separate facets.");
  add("Cell biology", "cell-viability", "Cell viability assay", ["MTT", "resazurin", "ATP luminescence"], "core", ["viability", "cytotoxicity"], ["cell viability assay protocol", "MTT assay protocol", "resazurin cell viability"], "Separate endpoint chemistry and cell type.");
  add("Cell biology", "cell-proliferation", "Cell proliferation assay", ["EdU", "BrdU", "growth assay"], "core", ["proliferation", "DNA synthesis"], ["cell proliferation assay protocol", "EdU incorporation protocol", "BrdU assay"], "Track pulse labeling and readout modality.");
  add("Cell biology", "apoptosis-assay", "Apoptosis assay", ["caspase assay", "Annexin V", "programmed cell death"], "core", ["cell death", "apoptosis"], ["apoptosis assay protocol", "Annexin V staining protocol", "caspase activity assay"], "Do not merge Annexin V, caspase, and morphology-only assays.");
  add("Cell biology", "cell-cycle", "Cell-cycle analysis", ["DNA content", "PI cell cycle", "EdU cell cycle"], "core", ["cell-cycle profiling"], ["cell cycle analysis protocol", "propidium iodide cell cycle", "flow cytometry cell cycle"], "Track fixation, stain, and instrument model.");
  add("Cell biology", "clonogenic-assay", "Clonogenic survival assay", ["colony formation assay", "clonogenicity"], "common", ["long-term survival", "colony formation"], ["clonogenic assay protocol", "colony formation assay cells", "clonogenic survival"], "Track plating density and colony scoring rules.");
  add("Cell biology", "wound-healing", "Scratch wound-healing assay", ["scratch assay", "cell migration"], "core", ["2D migration", "wound closure"], ["scratch wound healing assay protocol", "scratch assay cell migration", "wound closure assay"], "Track imaging schedule and analysis method.");
  add("Cell biology", "transwell-migration", "Transwell migration and invasion assay", ["Boyden chamber", "Matrigel invasion"], "core", ["migration", "invasion"], ["Transwell migration assay protocol", "Boyden chamber protocol", "Matrigel invasion assay"], "Separate migration from matrix-coated invasion.");
  add("Cell biology", "organoid-culture", "Organoid culture", ["3D organoid", "stem cell organoid"], "common", ["3D culture", "self-organization"], ["organoid culture protocol", "3D organoid protocol", "stem cell organoid culture"], "Split by tissue, matrix, and differentiation intent.");
  add("Cell biology", "primary-cell-isolation", "Primary cell isolation", ["tissue dissociation", "primary culture"], "core", ["cell isolation", "primary culture"], ["primary cell isolation protocol", "tissue dissociation protocol", "primary cell culture"], "Track tissue source, species, enzyme, and mechanical dissociation.");

  // Immunology and cytometry
  add("Immunology", "immunofluorescence", "Immunofluorescence staining", ["IF", "fluorescent antibody staining"], "core", ["cell imaging", "protein localization"], ["immunofluorescence protocol", "fluorescent antibody staining", "cell IF staining"], "Track fixation, permeabilization, antigen retrieval, and imaging platform.");
  add("Immunology", "immunohistochemistry", "Immunohistochemistry", ["IHC", "chromogenic staining"], "core", ["tissue staining", "protein localization"], ["immunohistochemistry protocol", "IHC staining protocol", "chromogenic tissue staining"], "Separate frozen and paraffin sections.");
  add("Immunology", "flow-cytometry", "Flow cytometry immunophenotyping", ["FACS", "surface marker staining"], "core", ["cell phenotyping", "quantification"], ["flow cytometry staining protocol", "FACS immunophenotyping", "surface marker flow cytometry"], "Track panel, fluorophores, compensation, and instrument.");
  add("Immunology", "cell-sorting", "Fluorescence-activated cell sorting", ["FACS sorting", "cell sorting"], "common", ["cell isolation", "population enrichment"], ["FACS cell sorting protocol", "fluorescence activated cell sorting", "cell sorter protocol"], "Keep sort purity, viability, and downstream culture as facets.");
  add("Immunology", "pbmc-isolation", "PBMC isolation", ["peripheral blood mononuclear cells", "Ficoll"], "core", ["blood cell isolation"], ["PBMC isolation protocol", "Ficoll density gradient PBMC", "peripheral blood mononuclear cell isolation"], "Track blood source, anticoagulant, and processing delay.");
  add("Immunology", "t-cell-activation", "T-cell activation and stimulation", ["T cell stimulation", "CD3 CD28"], "common", ["immune cell activation"], ["T cell activation protocol", "CD3 CD28 stimulation", "primary T cell stimulation"], "Track cell source and stimulation format.");
  add("Immunology", "cytokine-assay", "Cytokine measurement", ["multiplex cytokines", "Luminex", "cytokine ELISA"], "core", ["secreted factor quantification"], ["cytokine assay protocol", "multiplex cytokine assay", "Luminex cytokine protocol"], "Separate single-analyte and multiplex platforms.");
  add("Immunology", "cytotoxicity-assay", "Immune-cell cytotoxicity assay", ["NK killing", "T-cell killing", "target-cell lysis"], "common", ["immune effector function"], ["immune cell cytotoxicity assay", "NK cell killing assay", "T cell cytotoxicity protocol"], "Track target cell, effector ratio, and readout.");

  // Microbiology and virology
  add("Microbiology", "bacterial-culture", "Routine bacterial culture", ["liquid culture", "agar plate culture"], "core", ["microbial growth", "culture maintenance"], ["bacterial culture protocol", "bacterial liquid culture", "agar plate bacterial culture"], "Track organism, medium, temperature, aeration, and selection.");
  add("Microbiology", "bacterial-growth-curve", "Bacterial growth curve", ["OD600 growth", "growth kinetics"], "core", ["growth kinetics"], ["bacterial growth curve protocol", "OD600 growth kinetics", "microbial growth assay"], "Track reader path length and sampling interval.");
  add("Microbiology", "cfu-enumeration", "Colony-forming unit enumeration", ["CFU assay", "viable count"], "core", ["viable microbial count"], ["CFU enumeration protocol", "colony forming unit assay", "bacterial viable count"], "Track dilution scheme and plating mode.");
  add("Microbiology", "antimicrobial-susceptibility", "Antimicrobial susceptibility testing", ["MIC", "disk diffusion", "drug sensitivity"], "core", ["microbial drug response"], ["antimicrobial susceptibility protocol", "MIC assay protocol", "disk diffusion assay"], "Separate broth microdilution, agar dilution, and disk diffusion.");
  add("Microbiology", "biofilm-assay", "Microbial biofilm assay", ["crystal violet biofilm", "biofilm biomass"], "common", ["biofilm formation", "biofilm quantification"], ["biofilm assay protocol", "crystal violet biofilm assay", "bacterial biofilm quantification"], "Track static, flow, and biomass/readout method.");
  add("Microbiology", "bacterial-conjugation", "Bacterial conjugation", ["plasmid transfer", "mating assay"], "common", ["horizontal gene transfer"], ["bacterial conjugation protocol", "plasmid transfer mating assay", "bacterial mating protocol"], "Track donor/recipient strains and selection scheme.");
  add("Microbiology", "phage-plaque-assay", "Bacteriophage plaque assay", ["phage titer", "plaque formation"], "common", ["virus-like particle quantification"], ["phage plaque assay protocol", "bacteriophage titer", "plaque formation assay"], "Track host lawn and overlay format.");
  add("Microbiology", "yeast-culture", "Yeast culture and transformation", ["Saccharomyces culture", "yeast transformation"], "common", ["fungal culture", "genetic manipulation"], ["yeast culture protocol", "yeast transformation protocol", "Saccharomyces transformation"], "Separate culture maintenance, transformation, and selection.");
  add("Microbiology", "fungal-spore-assay", "Fungal spore preparation and germination", ["conidia", "spore germination"], "extended", ["fungal development"], ["fungal spore preparation protocol", "conidia germination assay", "spore germination protocol"], "Track species and developmental stage.");
  add("Virology", "virus-infection", "Cellular virus infection assay", ["viral infection", "MOI", "virus challenge"], "core", ["infection", "replication"], ["virus infection cell culture protocol", "MOI infection protocol", "cellular viral infection assay"], "Track virus, host cell, MOI, adsorption, and endpoint.");
  add("Virology", "viral-titration", "Viral titration", ["TCID50", "plaque assay", "focus-forming assay"], "core", ["infectious titer"], ["viral titration protocol", "TCID50 protocol", "focus forming assay"], "Keep assay endpoint and virus family as variants.");

  // Genomics, sequencing, transcriptomics, and epigenomics
  add("Genomics and sequencing", "ngs-library-dna", "DNA sequencing library preparation", ["NGS library prep", "Illumina library preparation"], "core", ["short-read sequencing"], ["DNA NGS library preparation protocol", "Illumina library prep", "sequencing library preparation"], "Track input type, fragmentation, indexing, and platform.");
  add("Genomics and sequencing", "ngs-library-rna", "RNA-seq library preparation", ["RNA-seq library prep", "transcriptome library"], "core", ["bulk transcriptomics"], ["RNA-seq library preparation protocol", "mRNA sequencing library", "total RNA-seq library prep"], "Separate poly(A), rRNA depletion, and small RNA libraries.");
  add("Genomics and sequencing", "amplicon-sequencing", "Amplicon sequencing", ["targeted sequencing", "amplicon NGS"], "core", ["targeted sequencing"], ["amplicon sequencing protocol", "targeted NGS protocol", "amplicon library preparation"], "Track target locus, primer design, and platform.");
  add("Genomics and sequencing", "whole-genome-sequencing", "Whole-genome sequencing", ["WGS", "genome sequencing"], "core", ["genome-wide variant discovery"], ["whole genome sequencing protocol", "WGS library preparation", "genome sequencing workflow"], "Separate sample prep from bioinformatics pipeline.");
  add("Genomics and sequencing", "whole-exome-sequencing", "Whole-exome sequencing", ["WES", "exome capture"], "core", ["coding variant discovery"], ["whole exome sequencing protocol", "exome capture library prep", "WES workflow"], "Track capture chemistry and sequencing platform.");
  add("Genomics and sequencing", "targeted-panel-sequencing", "Targeted DNA panel sequencing", ["amplicon panel", "hybrid capture panel"], "common", ["targeted variant detection"], ["targeted sequencing panel protocol", "gene panel sequencing", "hybrid capture panel"], "Separate amplicon and hybrid-capture designs.");
  add("Genomics and sequencing", "single-cell-rna-seq", "Single-cell RNA sequencing", ["scRNA-seq", "single-cell transcriptomics"], "core", ["single-cell transcriptomics"], ["single-cell RNA sequencing protocol", "scRNA-seq library prep", "single cell transcriptomics"], "Track droplet, plate, combinatorial, and sample multiplexing methods.");
  add("Genomics and sequencing", "single-cell-atac-seq", "Single-cell ATAC-seq", ["scATAC-seq", "single-cell chromatin accessibility"], "common", ["single-cell epigenomics"], ["single-cell ATAC-seq protocol", "scATAC library preparation", "single cell chromatin accessibility"], "Track nuclei prep, transposition chemistry, and platform.");
  add("Genomics and sequencing", "bulk-rna-seq", "Bulk RNA sequencing", ["RNA-seq", "transcriptome sequencing"], "core", ["transcriptomics"], ["bulk RNA-seq protocol", "RNA sequencing workflow", "transcriptome sequencing"], "Keep library prep, sequencing, and analysis as separate records.");
  add("Genomics and sequencing", "atac-seq", "ATAC-seq", ["chromatin accessibility", "Assay for Transposase-Accessible Chromatin"], "core", ["epigenomics"], ["ATAC-seq protocol", "chromatin accessibility assay", "Assay for Transposase-Accessible Chromatin"], "Track nuclei versus whole-cell input and bulk versus single-cell.");
  add("Genomics and sequencing", "chip-seq", "ChIP-seq", ["chromatin immunoprecipitation sequencing", "ChIP"], "core", ["DNA-protein binding"], ["ChIP-seq protocol", "chromatin immunoprecipitation sequencing", "ChIP library preparation"], "Track target antibody, cross-linking, and input control.");
  add("Genomics and sequencing", "cut-run", "CUT&RUN", ["targeted chromatin profiling", "CUTANA"], "common", ["DNA-protein binding"], ["CUT&RUN protocol", "targeted chromatin profiling", "CUTANA protocol"], "Separate CUT&RUN and CUT&Tag; track permeabilization and antibody.");
  add("Genomics and sequencing", "cut-tag", "CUT&Tag", ["chromatin profiling", "Nextera Tn5 chromatin"], "common", ["DNA-protein binding"], ["CUT&Tag protocol", "CUTTAG chromatin profiling", "single-cell CUT&Tag"], "Track bulk/single-cell format and antibody target.");
  add("Genomics and sequencing", "bisulfite-sequencing", "DNA methylation sequencing", ["bisulfite sequencing", "methyl-seq"], "common", ["epigenetic methylation"], ["bisulfite sequencing protocol", "DNA methylation sequencing", "methyl-seq library prep"], "Separate conversion, array, amplicon, and whole-genome workflows.");
  add("Genomics and sequencing", "16s-amplicon", "16S rRNA amplicon sequencing", ["microbiome sequencing", "16S sequencing"], "core", ["microbial community profiling"], ["16S rRNA sequencing protocol", "16S amplicon library prep", "microbiome sequencing"], "Track variable region, primers, and sequencing platform.");
  add("Genomics and sequencing", "shotgun-metagenomics", "Shotgun metagenomic sequencing", ["metagenomics", "microbial whole-community sequencing"], "common", ["microbial community profiling"], ["shotgun metagenomics protocol", "metagenomic library preparation", "microbial community sequencing"], "Separate sample extraction, library prep, and analysis.");
  add("Genomics and sequencing", "spatial-transcriptomics", "Spatial transcriptomics", ["spatial RNA-seq", "spatial omics"], "common", ["spatial gene expression"], ["spatial transcriptomics protocol", "spatial RNA sequencing", "spatial omics library prep"], "Track platform, tissue sectioning, and capture chemistry.");
  add("Genomics and sequencing", "crispr-screen", "Pooled CRISPR screen", ["genetic screen", "CRISPR library screen"], "common", ["functional genomics"], ["pooled CRISPR screen protocol", "CRISPR library screening", "genetic screen sequencing"], "Separate library amplification, delivery, selection, and sequencing.");

  // Proteomics, metabolomics, and biophysical readouts
  add("Proteomics and metabolomics", "lc-ms-proteomics", "LC-MS/MS proteomics sample preparation", ["bottom-up proteomics", "shotgun proteomics"], "core", ["protein mass spectrometry"], ["LC-MS/MS proteomics protocol", "bottom-up proteomics sample prep", "shotgun proteomics"], "Track digestion, cleanup, fractionation, and instrument mode.");
  add("Proteomics and metabolomics", "label-free-proteomics", "Label-free quantitative proteomics", ["LFQ", "DDA proteomics"], "common", ["quantitative proteomics"], ["label-free proteomics protocol", "DDA proteomics workflow", "quantitative LC-MS proteomics"], "Separate acquisition, search, and quantification steps.");
  add("Proteomics and metabolomics", "tmt-proteomics", "Isobaric labeling proteomics", ["TMT", "iTRAQ", "multiplexed proteomics"], "common", ["multiplex quantitative proteomics"], ["TMT proteomics protocol", "isobaric labeling proteomics", "multiplexed LC-MS proteomics"], "Track labeling chemistry and plex size.");
  add("Proteomics and metabolomics", "phosphoproteomics", "Phosphoproteomics enrichment", ["phosphopeptide enrichment", "PTM proteomics"], "common", ["post-translational modification"], ["phosphoproteomics protocol", "phosphopeptide enrichment", "PTM mass spectrometry"], "Track enrichment chemistry and sample type.");
  add("Proteomics and metabolomics", "metabolite-extraction", "Small-molecule metabolite extraction", ["metabolomics sample prep", "metabolite quench"], "core", ["metabolite preparation"], ["metabolite extraction protocol", "metabolomics sample preparation", "cell metabolite quenching"], "Track organism, matrix, solvent, and quenching method.");
  add("Proteomics and metabolomics", "targeted-metabolomics", "Targeted metabolomics", ["MRM", "SRM", "targeted LC-MS"], "common", ["small-molecule quantification"], ["targeted metabolomics protocol", "MRM metabolomics", "targeted LC-MS assay"], "Track transitions, standards, and instrument.");
  add("Proteomics and metabolomics", "lipidomics", "Lipidomics", ["lipid profiling", "LC-MS lipidomics"], "common", ["lipid quantification"], ["lipidomics protocol", "LC-MS lipid profiling", "lipid extraction for mass spectrometry"], "Track extraction, ionization, and lipid class coverage.");
  add("Proteomics and metabolomics", "gc-ms-metabolomics", "GC-MS metabolomics", ["GC-MS", "derivatized metabolomics"], "common", ["volatile and derivatized metabolites"], ["GC-MS metabolomics protocol", "derivatization metabolomics", "gas chromatography mass spectrometry metabolites"], "Track derivatization chemistry and column.");
  add("Proteomics and metabolomics", "nmr-metabolomics", "NMR metabolomics", ["NMR profiling", "metabolic fingerprinting"], "extended", ["metabolite profiling"], ["NMR metabolomics protocol", "NMR metabolic profiling", "metabolomics NMR sample preparation"], "Track sample state, field strength, and preprocessing.");

  // Microscopy, histology, and imaging
  add("Imaging and histology", "sample-fixation", "Biological sample fixation", ["PFA fixation", "formalin fixation", "methanol fixation"], "core", ["sample preservation"], ["biological sample fixation protocol", "paraformaldehyde fixation", "formalin fixation protocol"], "Track sample type, fixative, time, and downstream assay.");
  add("Imaging and histology", "paraffin-embedding", "Paraffin embedding and sectioning", ["FFPE", "paraffin sectioning"], "core", ["histology sample preparation"], ["paraffin embedding protocol", "FFPE tissue processing", "paraffin sectioning"], "Separate tissue processing, embedding, and sectioning.");
  add("Imaging and histology", "cryosectioning", "Cryosectioning", ["frozen section", "cryostat section"], "common", ["histology sample preparation"], ["cryosectioning protocol", "frozen tissue sectioning", "cryostat section protocol"], "Track embedding medium and section thickness.");
  add("Imaging and histology", "he-staining", "Hematoxylin and eosin staining", ["H&E", "routine histology"], "core", ["histology"], ["H&E staining protocol", "hematoxylin eosin staining", "routine histology protocol"], "Track tissue preparation and staining automation.");
  add("Imaging and histology", "confocal-microscopy", "Confocal microscopy", ["laser scanning confocal", "optical sectioning"], "core", ["fluorescence imaging"], ["confocal microscopy protocol", "laser scanning confocal imaging", "confocal image acquisition"], "Separate fixed-sample and live-cell acquisition.");
  add("Imaging and histology", "live-cell-imaging", "Live-cell fluorescence imaging", ["time-lapse microscopy", "live imaging"], "core", ["dynamic cell imaging"], ["live-cell imaging protocol", "time-lapse fluorescence microscopy", "live cell microscopy"], "Track environmental control and phototoxicity settings.");
  add("Imaging and histology", "super-resolution", "Super-resolution microscopy", ["SIM", "STED", "PALM", "STORM"], "common", ["high-resolution imaging"], ["super-resolution microscopy protocol", "SIM imaging protocol", "STED microscopy"], "Keep instrument modality as a required variant.");
  add("Imaging and histology", "electron-microscopy", "Electron microscopy sample preparation", ["TEM", "SEM", "ultrastructure"], "common", ["electron imaging"], ["electron microscopy sample preparation", "TEM sample prep protocol", "SEM biological sample preparation"], "Separate TEM, SEM, negative stain, and cryo workflows.");
  add("Imaging and histology", "image-analysis", "Microscopy image analysis", ["segmentation", "quantification", "ImageJ"], "core", ["image quantification"], ["microscopy image analysis protocol", "ImageJ image quantification", "cell segmentation workflow"], "Track software, segmentation target, and output metric.");
  add("Imaging and histology", "clearing-3d-imaging", "Tissue clearing and 3D imaging", ["cleared tissue", "light-sheet microscopy"], "common", ["whole-mount imaging"], ["tissue clearing protocol", "cleared tissue light-sheet imaging", "3D tissue imaging"], "Separate clearing chemistry, tissue type, and imaging platform.");

  // Plant, animal, and developmental workflows
  add("Plant biology", "plant-dna-extraction", "Plant genomic DNA extraction", ["plant DNA isolation", "leaf DNA"], "core", ["plant genotyping"], ["plant genomic DNA extraction protocol", "leaf DNA isolation", "plant DNA purification"], "Track tissue, polysaccharide removal, and downstream assay.");
  add("Plant biology", "plant-rna-extraction", "Plant RNA extraction", ["plant RNA isolation", "TRIzol plant"], "core", ["plant transcriptomics"], ["plant RNA extraction protocol", "plant RNA isolation", "RNA from plant tissue"], "Track tissue type, phenolic removal, and chemistry.");
  add("Plant biology", "agrobacterium-transformation", "Agrobacterium-mediated plant transformation", ["floral dip", "plant transformation"], "common", ["plant genetic transformation"], ["Agrobacterium plant transformation protocol", "floral dip protocol", "plant transformation"], "Split by species, explant, and delivery route.");
  add("Plant biology", "plant-tissue-culture", "Plant tissue culture and regeneration", ["callus culture", "micropropagation"], "common", ["plant regeneration"], ["plant tissue culture protocol", "callus induction protocol", "plant regeneration"], "Track species, explant, and hormone regime.");
  add("Plant biology", "protoplast-isolation", "Plant protoplast isolation and transfection", ["protoplast", "plant cell transfection"], "common", ["plant single-cell preparation"], ["plant protoplast isolation protocol", "protoplast transfection", "plant protoplast preparation"], "Track tissue, enzymes, and transfection modality.");
  add("Plant biology", "seed-germination", "Seed germination and seedling growth", ["germination assay", "seedling assay"], "core", ["plant development"], ["seed germination protocol", "seedling growth assay", "plant germination assay"], "Track species, stratification, light, and substrate.");
  add("Plant biology", "photosynthesis-assay", "Photosynthesis and chlorophyll assay", ["chlorophyll fluorescence", "Fv/Fm"], "common", ["plant physiology"], ["chlorophyll fluorescence protocol", "photosynthesis assay protocol", "Fv/Fm measurement"], "Track instrument, dark adaptation, and tissue.");
  add("Animal and developmental biology", "animal-tissue-collection", "Animal tissue collection and preservation", ["tissue harvest", "organ collection"], "core", ["animal sample preparation"], ["animal tissue collection protocol", "organ harvest and preservation", "tissue sample processing"], "Track species, tissue, preservation, and downstream assay.");
  add("Animal and developmental biology", "perfusion-fixation", "Perfusion fixation", ["transcardial perfusion", "animal perfusion"], "common", ["whole-animal tissue preservation"], ["perfusion fixation protocol", "transcardial perfusion", "animal tissue perfusion"], "Use only under approved institutional procedures; track species and endpoint.");
  add("Animal and developmental biology", "primary-neuron-culture", "Primary neuron culture", ["neuronal culture", "embryonic neurons"], "common", ["primary neural culture"], ["primary neuron culture protocol", "neuronal cell culture", "embryonic neuron isolation"], "Track species, developmental stage, substrate, and medium.");

  // Bioinformatics and computational analysis
  add("Bioinformatics", "fastq-qc", "FASTQ quality control", ["read QC", "FastQC", "sequencing QC"], "core", ["sequencing data QC"], ["FASTQ quality control workflow", "FastQC protocol", "sequencing read QC"], "Track read type, platform, and QC thresholds.");
  add("Bioinformatics", "read-trimming", "Read trimming and filtering", ["adapter trimming", "quality trimming"], "core", ["sequencing preprocessing"], ["read trimming workflow", "adapter trimming protocol", "FASTQ filtering"], "Separate short-read and long-read preprocessing.");
  add("Bioinformatics", "short-read-alignment", "Short-read alignment", ["BWA", "Bowtie", "genome mapping"], "core", ["sequence alignment"], ["short-read alignment workflow", "BWA alignment protocol", "Bowtie mapping workflow"], "Track reference build and alignment mode.");
  add("Bioinformatics", "rna-seq-quantification", "RNA-seq quantification", ["featureCounts", "Salmon", "transcript quantification"], "core", ["expression quantification"], ["RNA-seq quantification workflow", "featureCounts protocol", "Salmon transcript quantification"], "Separate alignment-based and pseudoalignment workflows.");
  add("Bioinformatics", "differential-expression", "Differential expression analysis", ["DESeq2", "edgeR", "limma"], "core", ["statistical expression analysis"], ["differential expression workflow", "DESeq2 analysis protocol", "edgeR RNA-seq analysis"], "Track experimental design, normalization, and contrast.");
  add("Bioinformatics", "variant-calling", "Germline variant calling", ["GATK", "SNP calling", "indel calling"], "core", ["variant discovery"], ["germline variant calling workflow", "GATK variant calling", "SNP indel calling pipeline"], "Separate germline and somatic workflows.");
  add("Bioinformatics", "somatic-variant-calling", "Somatic variant calling", ["tumor normal variants", "cancer variant calling"], "common", ["somatic variant discovery"], ["somatic variant calling workflow", "tumor normal variant pipeline", "cancer variant calling"], "Track matched normal, purity, and caller.");
  add("Bioinformatics", "chip-atac-peak-calling", "ChIP-seq or ATAC-seq peak calling", ["MACS2", "peak analysis"], "core", ["regulatory genomics"], ["ChIP-seq peak calling workflow", "ATAC-seq peak analysis", "MACS2 protocol"], "Track assay type, genome build, and replicate handling.");
  add("Bioinformatics", "single-cell-analysis", "Single-cell RNA analysis", ["Seurat", "Scanpy", "scRNA analysis"], "core", ["single-cell data analysis"], ["single-cell RNA analysis workflow", "Seurat analysis protocol", "Scanpy scRNA-seq workflow"], "Track normalization, integration, clustering, and cell-type annotation.");
  add("Bioinformatics", "metagenomics-analysis", "Metagenomics and microbiome analysis", ["QIIME2", "taxonomic profiling", "microbiome bioinformatics"], "core", ["community profiling"], ["metagenomics analysis workflow", "QIIME2 microbiome protocol", "taxonomic profiling pipeline"], "Separate amplicon and shotgun pipelines.");
  add("Bioinformatics", "phylogenetic-analysis", "Phylogenetic analysis", ["multiple sequence alignment", "tree inference"], "common", ["evolutionary analysis"], ["phylogenetic analysis workflow", "multiple sequence alignment protocol", "maximum likelihood tree"], "Track sequence type, alignment method, and tree model.");
  add("Bioinformatics", "protein-structure-prediction", "Protein structure prediction", ["AlphaFold", "structure modeling"], "common", ["structural bioinformatics"], ["protein structure prediction workflow", "AlphaFold protocol", "protein modeling"], "Separate prediction, refinement, and validation.");
  add("Bioinformatics", "molecular-docking", "Molecular docking", ["ligand docking", "virtual screening"], "common", ["structure-based screening"], ["molecular docking workflow", "ligand docking protocol", "virtual screening"], "Track receptor preparation, ligand preparation, and scoring engine.");

  // Laboratory operations and assay support
  add("Laboratory operations", "buffer-preparation", "Buffer and reagent preparation", ["stock solution", "lab buffer"], "core", ["reagent preparation"], ["laboratory buffer preparation protocol", "stock solution preparation", "biochemistry reagent prep"], "Track concentration, pH, grade, storage, and expiration.");
  add("Laboratory operations", "sterile-technique", "Aseptic technique", ["sterile technique", "biosafety cabinet"], "core", ["contamination control"], ["aseptic technique protocol", "sterile cell culture technique", "biosafety cabinet workflow"], "Keep training SOPs separate from assay protocols.");
  add("Laboratory operations", "sample-aliquoting", "Sample aliquoting and labeling", ["sample management", "cryovial labeling"], "core", ["sample tracking"], ["biological sample aliquoting protocol", "sample labeling workflow", "cryovial sample management"], "Track sample identity, freeze-thaw limits, and chain of custody.");
  add("Laboratory operations", "centrifugation", "Centrifugation and separation", ["density gradient", "pelleting", "centrifuge"], "core", ["sample separation"], ["biological sample centrifugation protocol", "density gradient centrifugation", "cell pelleting protocol"], "Track rotor, RCF, temperature, and sample type.");
  add("Laboratory operations", "filtration", "Sterile filtration and membrane separation", ["syringe filtration", "filter sterilization"], "common", ["sample clarification", "sterilization"], ["sterile filtration protocol", "syringe filter sample preparation", "membrane filtration"], "Track membrane chemistry, pore size, and sample compatibility.");
  add("Laboratory operations", "spectrophotometer-qc", "Spectrophotometer and plate-reader QC", ["instrument QC", "absorbance calibration"], "common", ["instrument quality control"], ["plate reader QC protocol", "spectrophotometer calibration", "absorbance instrument QC"], "Track instrument model, calibration standard, and acceptance criteria.");
  add("Laboratory operations", "sample-integrity-qc", "Nucleic acid and protein integrity QC", ["Bioanalyzer", "TapeStation", "sample QC"], "core", ["sample quality control"], ["RNA integrity QC protocol", "Bioanalyzer sample QC", "protein sample quality control"], "Track platform, metric, and pass/fail threshold.");
  add("Laboratory operations", "biological-replicates", "Biological and technical replicate planning", ["replicate design", "experimental controls"], "core", ["experimental design"], ["biological replicate design", "technical replicate protocol", "experimental controls planning"], "This is a planning category; do not treat it as a wet-lab procedure.");

  window.COMMON_PROTOCOL_CATEGORIES = categories;
  window.COLLECTION_PROMPT_TEMPLATE = `You are a protocol-curation agent working on one category from a local biological protocol registry.

CATEGORY TO PROCESS
{{CATEGORY_JSON}}

LOCAL REGISTRY RULES
- This is a metadata-first project. Do not copy protocol instructions, figures, tables, videos, or long source passages.
- Search only publicly accessible sources and respect each source's terms, robots rules, API limits, and record-level license.
- Use the category's aliases and search objects to find candidate protocol records. Prefer a direct, stable protocol page or DOI over a search page.
- Do not assume that free-to-read, open-access, or a source-level CC statement grants reuse of a specific record.
- Do not merge materially different sample types, organisms, platforms, chemistries, or intended readouts. Keep those as variants.
- Before selecting a representative, map the category's major specimen/organism, platform, chemistry, readout, safety, and workflow variants. Mark the result partial when the representative covers only one material variant.
- Use canonical source names exactly: protocols.io, Bio-protocol, Nature Protocols, Nature Protocol Exchange, Addgene, New England Biolabs, Thermo Fisher Scientific, NCBI Bookshelf, PubMed Central, or the named publisher/organization. Do not use mixed labels such as Protocols.io / Partner.
- Keep scientific match confidence, coverage completeness, metadata verification, and license rights separate. Do not use 0.90+ confidence for a partial or blocked category.

SINGLE-CRAWLER DATA CONTRACT
- This is an exception template for a coordinator-approved one-category crawler. The normal workflow is the multi-category session prompt from process-manager.html.
- Read data/README.md and data/session-result.schema.json before working.
- Your only writable result path is data/ad-hoc/{{CATEGORY_ID}}/result.json. Create it if needed; do not edit another crawler's directory, shared queue files, or the static website.
- Write the result JSON yourself, then re-read and parse it before declaring the task complete. The data file is the deliverable; the final chat reply should only summarize the written path and status.
- This ad-hoc path is not automatically assigned to one of the 43 dashboard packets. Use it only when the coordinator explicitly authorizes an isolated follow-up.
- Store metadata, citations, source URLs, license evidence URLs, and short evidence notes only. Do not download or copy source PDFs, protocol steps, figures, videos, or long text unless a coordinator separately confirms that the license permits it.
- Use null rather than undefined for unknown values. Set licenseEvidencePass to false unless every representative has direct record-level license evidence. Crossref or other API metadata may corroborate a license but must not be the sole evidence by default.

SCOPE STRATEGY
- A category is a coverage unit, not a demand for one separate session per protocol record. It can contain many candidate protocol records.
- This prompt covers one category so its candidates, variants, and screening decisions stay auditable. Return one representative only, plus all meaningful screened alternatives.
- Do not split the category into new tasks merely because it has multiple sources. Split only when organism, specimen, platform, chemistry, safety level, or intended readout creates a materially different variant. Report those split suggestions in coverageGaps.
- A coordinator may batch a few small, closely related categories into one crawler packet, but each category must still produce a separate categoryResults entry. Keep broad or high-variation categories in their own run.
- Do not mark a broad category complete because one narrow record was found. Record missing child variants and concrete follow-up searches in coverageGaps and nextSearchSuggestions.

TASK
1. Search the candidate sources and list the strongest matching protocol records for this category.
2. Select one representative protocol only when it is the most specific, authoritative, complete, and reproducible-looking record available.
3. Mark other candidates as screened alternatives, rejected duplicates, wrong-variant records, inaccessible records, or license-unclear records. Do not silently discard them.
4. Use exact source URLs, source record IDs, DOIs, authors, publication dates, last-updated dates, and record-level license evidence when available. Use null when unknown.
5. Write a concise evidence note explaining why the representative was selected and why each alternative was not.
6. Write, re-read, and self-verify data/ad-hoc/{{CATEGORY_ID}}/result.json before finishing.
7. For every screened candidate, preserve publication/update dates, confidence if assessed, license fields, metadata verification time, and evidence status when available. Do not silently discard rejected candidates.

WRITE THIS JSON CONTRACT TO data/ad-hoc/{{CATEGORY_ID}}/result.json
{
  "schemaVersion": "1.0",
  "sessionId": "ad-hoc-{{CATEGORY_ID}}",
  "sessionTitle": "{{CATEGORY_LABEL}}",
  "packetStatus": "complete | partial | blocked | in-progress",
  "startedAt": "YYYY-MM-DDTHH:MM:SSZ",
  "writtenAt": "YYYY-MM-DDTHH:MM:SSZ",
  "worker": "crawler session identifier",
  "sourcesSearched": [],
  "categoryResults": [
    {
      "categoryId": "{{CATEGORY_ID}}",
      "categoryLabel": "{{CATEGORY_LABEL}}",
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
    "expectedCategoryIds": ["{{CATEGORY_ID}}"],
    "actualCategoryIds": ["{{CATEGORY_ID}}"],
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
- A representative without a unique record URL, DOI, or record ID should normally remain provisional.
- Treat license and metadata verification as separate from scientific match confidence.
- Never invent dates, authors, DOIs, licenses, or protocol contents. Never emit the literal string undefined.
- Do not mark packetStatus complete until result.json has been written, parsed, and verified against the single expected category ID.`;
})();
