export const CLINGEN_PREDICTORS = [
  { tool: "REVEL", version: "1.3", scoreRange: "0 to 1 (higher = more likely damaging)" },
  { tool: "AlphaMissense", scoreRange: "0 to 1 (higher = more likely damaging)" },
  { tool: "BayesDel", scoreRange: "-1.29334 to 0.75731 (higher = more likely damaging)" },
  { tool: "ESM1b", scoreRange: "-24.358 to 6.937 (lower = more likely damaging)" },
  { tool: "MutPred2", scoreRange: "0 to 1 (higher = more likely damaging)" },
  { tool: "VARITY_R", scoreRange: "0 to 1 (higher = more likely damaging)" },
  { tool: "VEST4", scoreRange: "0 to 1 (higher = more likely damaging)" },
] as const;

export const OTHER_PREDICTORS = [
  { tool: "CADD", scoreRange: "-7.535 to 35.789 (higher = more likely damaging)" },
  { tool: "MPC", scoreRange: "" },
  { tool: "PrimateAI-3D", scoreRange: "0 to 1 (higher = more likely damaging)" },
  { tool: "SIFT", scoreRange: "0 to 1 (lower = more likely damaging)" },
  { tool: "Mutation Taster", scoreRange: "0 to 1 (probability of the prediction being correct)" },
  { tool: "PROVEAN", scoreRange: "-14 to 14 (lower = more likely damaging)" },
] as const;

export const GERMLINE_INTERPRETATIONS: unknown[] = [];

export function criteriaSpecOptionsFor(geneSymbol: string | null | undefined): string[] {
  if (!geneSymbol) return [];
  return [
    `ClinGen ${geneSymbol} VCEP Specifications v1.0 (placeholder -- no live VCEP document source wired up yet)`,
  ];
}

export const refSeqTranscripts: unknown[] = [];
export const ensemblTranscripts: unknown[] = [];
export const ancestryRows: unknown[] = [];

export const PE_VARIANT_TYPE_LABEL: Record<string, string> = {
  missense: "Missense",
  nonsense: "Nonsense",
  "canonical-splice": "Canonical Splice",
};

export const GUIDANCE_DOC_LINKS: Record<string, unknown> = {
  predictedEffect: {
    missense: [{ text: "SUPPLEMENTARY MATERIAL 6. MISSENSE VARIANTS", url: "https://docs.google.com/document/d/1eerqnL0kRq1se341-pxHxNI7HrPP9_kDlLL4eDvt-Gk/edit?tab=t.0#heading=h.9gxc2jomj4e" }],
    "canonical-splice": [{ text: "SUPPLEMENTARY MATERIAL 11. CANONICAL SPLICE VARIANTS", url: "https://docs.google.com/document/d/1LGSPW90-n0EbqGjfLKQ2MpTHPK8Ai-hUuMAkqqhyi80/edit?tab=t.0" }],
    nonsense: [{ text: "SUPPLEMENTARY MATERIAL 8. NONSENSE VARIANTS", url: "https://docs.google.com/document/d/1LFqIBpmw_plE8CFmRLbS2aeUYMibpVpxDjkbzJPHQsA/edit?tab=t.0" }],
  },
  informativeVariants: [{ text: "SUPPLEMENTARY MATERIAL 19. INFORMATIVE VARIANTS", url: "https://docs.google.com/document/d/1hNfdtdvDT4dob9oDBrL_UzVV_MYiWnwERfli76EAbyQ/edit?tab=t.0" }],
  functionalData: [{ text: "SUPPLEMENTAL MATERIAL 20. FUNCTIONAL ASSAY EVIDENCE", url: "https://docs.google.com/document/d/1X68otBl4YvdXlP1bOD83JO4kIod0Ol5BoLB4CLxqijA/edit?tab=t.0" }],
  clinicalAndLocus: [
    { text: "SUPPLEMENTARY MATERIAL 4. CLINICAL OBSERVATIONS", url: "https://docs.google.com/document/d/17XnPmgTpzgQ8hfzOZNCcXIBwnNwbVkP0KIv3Dw5Bz_M/edit?tab=t.0" },
    { text: "SUPPLEMENTARY MATERIAL 5. SPECIFIC PHENOTYPE AND SEGREGATION", url: "https://docs.google.com/document/d/15arEcguLCzjiKKjibE3U0SNdrUjbKjpPoDoBPi2o40Y/edit?tab=t.0" },
  ],
};

export const MIS_SPLICE_PREDICTOR_OPTIONS = ["SpliceAI", "Pangolin", "Other"];

export const FXN_CODE_BY_TYPE: Record<string, string> = {
  missense: "MIS_FXN",
  "canonical-splice": "SPL_FXN",
};

export const INHERITANCE_OPTIONS = [
  { value: "Autosomal dominant inheritance (HP:0000006)", label: "Autosomal dominant inheritance (HP:0000006)" },
  { value: "Autosomal recessive inheritance (HP:0000007)", label: "Autosomal recessive inheritance (HP:0000007)" },
  { value: "Mitochondrial inheritance (HP:0001427)", label: "Mitochondrial inheritance (HP:0001427)" },
  { value: "Semidominant inheritance (HP:0032113)", label: "Semidominant inheritance (HP:0032113)" },
  { value: "X-linked dominant inheritance (HP:0001423)", label: "X-linked dominant inheritance (HP:0001423)" },
  { value: "X-linked recessive inheritance (HP:0001419)", label: "X-linked recessive inheritance (HP:0001419)" },
  { value: "Other", label: "Other" },
  { value: "Undetermined mode of inheritance (HP:0000005)", label: "Undetermined mode of inheritance (HP:0000005)" },
];

export const PROBAND_SOURCE_OPTIONS = [
  "PMID",
  "Clinical Lab",
  "Clinic",
  "Research Lab",
  "Database (if data exists in multiple sources, e.g. clinical lab, PMID, and database, please choose the most detailed source)",
  "Other",
];

export const PROBAND_SOURCE_OPTION_LABELS: Record<string, string> = {
  PMID: "PMID (or other literature identifier)",
};

export const PROBAND_ZYGOSITY_OPTIONS = ["Heterozygous", "Homozygous", "Hemizygous", "Compound heterozygous", "Other"];
export const PROBAND_SEX_OPTIONS = ["Female", "Male", "Unknown"];
export const PROBAND_AGE_OPTIONS = ["<1 year", "1–5 years", "6–12 years", "13–17 years", "18–30 years", "31–50 years", "51–70 years", ">70 years", "Unknown"];
export const PROBAND_COUNTRY_OPTIONS = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Netherlands",
  "Sweden", "Italy", "Spain", "Japan", "China", "India", "Brazil", "Mexico", "South Africa", "Other / Unknown",
];
export const PROBAND_HPO_EXAMPLES = [
  "HPO:0002664 Phenotypic feature A",
  "HPO:0001250 Phenotypic feature B",
  "HPO:0001629 Phenotypic feature C",
  "HPO:0000707 Phenotypic feature D",
];

export const CLN_AFF_SECOND_VARIANT_OPTIONS = [
  { value: "confirmed-trans-plp", label: "VBC confirmed in trans with a P/LP variant" },
  { value: "assumed-trans-plp", label: "VBC assumed in trans with a P/LP variant" },
  { value: "confirmed-trans-vus", label: "VBC confirmed in trans with a VUS" },
  { value: "homozygous", label: "Homozygous VBC" },
  { value: "no-second-variant", label: "No 2nd variant, or 2nd variant in cis, or unknown phase" },
];

export const CLN_AFF_LIKELIHOOD_OPTIONS = [
  { value: "low", label: "< 0.0001" },
  { value: "high", label: "0.0001 – 0.01" },
];
