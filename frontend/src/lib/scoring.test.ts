// Expected values come from sources independent of this code, so the tests can catch a wrong table:
//   [guidance] the SVCv4 summaries written for the curation UI (Supplements 4 and 5)
//   [Pejaver]  Pejaver et al. 2022, ClinGen-calibrated predictor thresholds
//   [provisional] SVCv4 hasn't finalized the value; this pins the current behavior
//   [prototype] matches the prototype's scoring; confirm the numbers against the cited supplement table
import { describe, expect, it } from "vitest";
import type { Proband } from "./scoring";
import {
  caseScoreFor,
  classificationFor,
  clnCcsDnvScore,
  clnAffScore,
  clnAltScore,
  clnCcsEligible,
  clnCcsScore,
  clnTableFor,
  functionalEvidencePoints,
  locCombinedScore,
  locPheAfterSegregation,
  locPheScore,
  misPredictorScore,
} from "./scoring";

const AD = "Autosomal dominant inheritance (HP:0000006)";
const AR = "Autosomal recessive inheritance (HP:0000007)";
const XLR = "X-linked recessive inheritance (HP:0001419)";

const proband = (overrides: Partial<Proband> = {}): Proband => ({ clnAff: {}, clnDnv: {}, ...overrides });

const CLEAN_CLN_AFF = {
  testingRelevance: "All relevant genes for MDE were tested",
  nonGeneticEtiology: "Unlikely",
  variantsOfInterest: "No additional variants of interest identified",
};

describe("CLN_CCS case-control [guidance]", () => {
  it("is eligible with at least 5 cases in at least 100 individuals", () => {
    expect(clnCcsEligible(5, 100)).toBe(true);
    expect(clnCcsEligible("5", "100")).toBe(true);
    expect(clnCcsEligible(4, 100)).toBe(false);
    expect(clnCcsEligible(5, 99)).toBe(false);
  });

  it("scores +4.0 only when the odds ratio exceeds 5.0 and the 95% CI excludes 1.0", () => {
    expect(clnCcsScore("5.1", "yes")).toBe(4.0);
    expect(clnCcsScore("5.0", "yes")).toBe(0.0);
    expect(clnCcsScore("12", "no")).toBe(0.0);
  });

  it("is not evaluated until both inputs are given", () => {
    expect(clnCcsScore("", "yes")).toBeNull();
    expect(clnCcsScore("12", undefined)).toBeNull();
  });
});

describe("CLN_DNV de novo within a case-control cohort (Supplement 4, Table 3) [prototype]", () => {
  it("scores by phenotype specificity and parental confirmation for dominant disorders", () => {
    expect(clnCcsDnvScore(AD, "Specific for MDE", "Is de novo", "Confirmed")).toBe(7.0);
    expect(clnCcsDnvScore(AD, "Specific for MDE", "Is de novo", "Assumed")).toBe(2.0);
    expect(clnCcsDnvScore(AD, "Consistent with MDE", "Is de novo", "Confirmed")).toBe(4.0);
    expect(clnCcsDnvScore(AD, "Consistent with MDE", "Is de novo", "Assumed")).toBe(1.0);
  });

  it("scores 0 when the phenotype is inconsistent or the variant isn't de novo", () => {
    expect(clnCcsDnvScore(AD, "Not consistent", "Is de novo", "Confirmed")).toBe(0.0);
    expect(clnCcsDnvScore(AD, "Specific for MDE", "Not de novo", "Confirmed")).toBe(0.0);
  });

  it("is not evaluated for MOIs Table 3 doesn't cover, or before both answers are given", () => {
    expect(clnCcsDnvScore(XLR, "Specific for MDE", "Is de novo", "Confirmed")).toBeNull();
    expect(clnCcsDnvScore(AD, undefined, "Is de novo", "Confirmed")).toBeNull();
  });
});

describe("Supplement 4 table choice by MOI [guidance]", () => {
  it("uses the monoallelic table for dominant disorders", () => {
    expect(clnTableFor(AD, proband())).toBe("monoallelic");
  });

  it("uses the biallelic table for recessive disorders", () => {
    expect(clnTableFor(AR, proband())).toBe("biallelic");
  });

  it("depends on sex for X-linked recessive disorders", () => {
    expect(clnTableFor(XLR, proband({ sex: "Female" }))).toBe("biallelic");
    expect(clnTableFor(XLR, proband({ sex: "Male" }))).toBe("monoallelic");
  });

  it("has no table for MOIs Supplement 4 doesn't address", () => {
    expect(clnTableFor("Mitochondrial inheritance (HP:0001427)", proband())).toBeNull();
  });
});

describe("CLN_AFF affected proband, monoallelic [guidance]", () => {
  it("scores higher for a phenotype specific to the MDE", () => {
    const specific = proband({ clnAff: { ...CLEAN_CLN_AFF, phenotypicSpecificity: "Specific for MDE" } });
    const consistent = proband({ clnAff: { ...CLEAN_CLN_AFF, phenotypicSpecificity: "Consistent with MDE" } });
    expect(clnAffScore(AD, specific)).toBe(1.0);
    expect(clnAffScore(AD, consistent)).toBe(0.5);
  });

  it("scores lower when testing was incomplete", () => {
    const partial = proband({
      clnAff: {
        ...CLEAN_CLN_AFF,
        testingRelevance: "Not all relevant genes for disorder tested OR High number of unexplained cases",
        phenotypicSpecificity: "Specific for MDE",
      },
    });
    expect(clnAffScore(AD, partial)).toBe(0.5);
  });

  it("scores 0 when the phenotype is not consistent or another P/LP variant explains it", () => {
    expect(clnAffScore(AD, proband({ clnAff: { ...CLEAN_CLN_AFF, phenotypicSpecificity: "Not consistent" } }))).toBe(0.0);
    const explained = proband({
      clnAff: {
        ...CLEAN_CLN_AFF,
        phenotypicSpecificity: "Specific for MDE",
        variantsOfInterest: "Additional P/LP variant identified that explains phenotype",
      },
    });
    expect(clnAffScore(AD, explained)).toBe(0.0);
  });

  it("is not evaluated until the required questions are answered", () => {
    expect(clnAffScore(AD, proband({ clnAff: { phenotypicSpecificity: "Specific for MDE" } }))).toBeNull();
  });
});

describe("CLN_ALT alternate cause [guidance]", () => {
  it("ranges from 0.0 down to -1.0 by phenotype severity", () => {
    expect(clnAltScore(proband({ clnAlt: { severityCategory: "more-severe-or-multiallele" } }))).toBe(0.0);
    expect(clnAltScore(proband({ clnAlt: { severityCategory: "not-more-severe" } }))).toBe(-0.5);
  });

  it("only allows the -1.0 tier when the alternate-cause variant is in the same gene", () => {
    const severity = "not-consistent-recessive";
    expect(clnAltScore(proband({ clnAlt: { severityCategory: severity, secondVariantGeneRelationship: "same-gene" } }))).toBe(-1.0);
    expect(clnAltScore(proband({ clnAlt: { severityCategory: severity, secondVariantGeneRelationship: "different-gene" } }))).toBeNull();
  });
});

describe("LOC_PHE specific phenotype [guidance]", () => {
  it.each([
    ["<33%", 0.0],
    ["33–50%", 1.0],
    ["51–67%", 2.0],
    ["68–81%", 3.0],
    ["≥82%", 4.0],
  ])("diagnostic yield %s scores %d", (diagnosticYield, points) => {
    expect(locPheScore(proband({ locPhe: { vbcEligible: "yes", diagnosticYield } }))).toBe(points);
  });

  it("scores 0 when the VBC isn't eligible and is not evaluated without data", () => {
    expect(locPheScore(proband({ locPhe: { vbcEligible: "no" } }))).toBe(0.0);
    expect(locPheScore(proband({ locPhe: { vbcEligible: "no-data" } }))).toBeNull();
  });
});

describe("LOC combined phenotype and segregation [guidance]", () => {
  it("caps the combined score at +4.0", () => {
    expect(locCombinedScore(3.0, 2.0)).toBe(4.0);
  });

  it("lets a confirmed non-segregation (-4.0) override everything and zero out LOC_PHE", () => {
    expect(locCombinedScore(4.0, -4.0)).toBe(-4.0);
    expect(locPheAfterSegregation(3.0, -4.0)).toBe(0.0);
    expect(locPheAfterSegregation(3.0, 2.0)).toBe(3.0);
  });

  it("is not evaluated when neither part is", () => {
    expect(locCombinedScore(null, null)).toBeNull();
  });
});

describe("caseScoreFor routes each code to its scorer", () => {
  it("matches the code-specific scorers", () => {
    const p = proband({ clnAff: { ...CLEAN_CLN_AFF, phenotypicSpecificity: "Specific for MDE" }, locPhe: { vbcEligible: "no" } });
    expect(caseScoreFor("CLN_AFF", p, AD)).toBe(clnAffScore(AD, p));
    expect(caseScoreFor("LOC_PHE", p, AD)).toBe(0.0);
  });

  it("returns null for codes that aren't scored per case", () => {
    expect(caseScoreFor("POP_FRQ", proband(), AD)).toBeNull();
  });
});

describe("REVEL missense predictor points [Pejaver]", () => {
  it.each([
    ["0.932", 4.0],
    ["0.931", 3.0],
    ["0.773", 2.0],
    ["0.772", 1.0],
    ["0.644", 1.0],
    ["0.643", 0.0],
    ["0.291", 0.0],
    ["0.290", -1.0],
    ["0.183", -2.0],
    ["0.016", -4.0],
  ])("score %s gives %d points", (score, points) => {
    expect(misPredictorScore("REVEL", score)).toBe(points);
  });

  it("returns null for an unknown predictor or a non-numeric score", () => {
    expect(misPredictorScore("NotAPredictor", "0.9")).toBeNull();
    expect(misPredictorScore("REVEL", "abc")).toBeNull();
  });
});

describe("Functional evidence (Supplement 20)", () => {
  it("scores 0 for an assay inconsistent with the molecular mechanism [guidance]", () => {
    expect(functionalEvidencePoints({ id: "a", mechanismConsistent: false, numBenignControls: 10, numPathogenicControls: 10, resultRange: "pathogenic" })).toBe(0);
  });

  it("is not evaluated until mechanism consistency is answered", () => {
    expect(functionalEvidencePoints({ id: "a", numBenignControls: 10, numPathogenicControls: 10, resultRange: "pathogenic" })).toBeNull();
    expect(functionalEvidencePoints(null)).toBeNull();
  });

  it("uses curator-entered points for model organism evidence", () => {
    expect(functionalEvidencePoints({ id: "a", kind: "model-organism", manualPoints: "2" })).toBe(2);
    expect(functionalEvidencePoints({ id: "a", kind: "model-organism", manualPoints: "" })).toBeNull();
  });
});

describe("Classification from total points [provisional]", () => {
  it.each([
    [-4, "Benign"],
    [-0.5, "Likely Benign"],
    [0, "Uncertain Significance"],
    [5.5, "Uncertain Significance"],
    [6, "Likely Pathogenic"],
    [9.5, "Likely Pathogenic"],
    [10, "Pathogenic"],
  ])("%d points is %s", (total, classification) => {
    expect(classificationFor(total)).toBe(classification);
  });
});
