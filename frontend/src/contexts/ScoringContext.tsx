import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// Initial Evidence Points data
const initialEvidencePoints = {
  AlphaMissense: [
    { range: [0.99, Number.POSITIVE_INFINITY], points: 4.0 },
    { range: [0.972, 0.989], points: 3.0 },
    { range: [0.906, 0.971], points: 2.0 },
    { range: [0.792, 0.905], points: 1.0 },
    { range: [0.17, 0.791], points: 0.0 },
    { range: [0.1, 0.169], points: -1.0 },
    { range: [0.071, 0.099], points: -2.0 },
    { range: [0.0, 0.07], points: -3.0 },
  ],
  BayesDel: [
    { range: [0.5, Number.POSITIVE_INFINITY], points: 4.0 },
    { range: [0.41, 0.499], points: 3.0 },
    { range: [0.27, 0.409], points: 2.0 },
    { range: [0.13, 0.269], points: 1.0 },
    { range: [-0.179, 0.129], points: 0.0 },
    { range: [-0.359, -0.18], points: -1.0 },
    { range: [-0.519, -0.36], points: -2.0 },
    { range: [Number.NEGATIVE_INFINITY, -0.52], points: -3.0 },
  ],
  ESM1b: [
    { range: [Number.NEGATIVE_INFINITY, -24.0], points: 4.0 },
    { range: [-23.9, -14.0], points: 3.0 },
    { range: [-13.9, -12.2], points: 2.0 },
    { range: [-12.1, -10.7], points: 1.0 },
    { range: [-10.6, -6.4], points: 0.0 },
    { range: [-6.3, -3.2], points: -1.0 },
    { range: [-3.1, 8.9], points: -2.0 },
    { range: [8.8, Number.POSITIVE_INFINITY], points: -3.0 },
  ],
  MutPred2: [
    { range: [0.932, Number.POSITIVE_INFINITY], points: 4.0 },
    { range: [0.895, 0.931], points: 3.0 },
    { range: [0.829, 0.894], points: 2.0 },
    { range: [0.737, 0.828], points: 1.0 },
    { range: [0.392, 0.736], points: 0.0 },
    { range: [0.198, 0.391], points: -1.0 },
    { range: [0.032, 0.197], points: -2.0 },
    { range: [0.011, 0.031], points: -3.0 },
    { range: [0.0, 0.01], points: -4.0 },
  ],
  REVEL: [
    { range: [0.932, Number.POSITIVE_INFINITY], points: 4.0 },
    { range: [0.879, 0.931], points: 3.0 },
    { range: [0.773, 0.878], points: 2.0 },
    { range: [0.644, 0.772], points: 1.0 },
    { range: [0.291, 0.643], points: 0.0 },
    { range: [0.184, 0.29], points: -1.0 },
    { range: [0.053, 0.183], points: -2.0 },
    { range: [0.017, 0.052], points: -3.0 },
    { range: [0.0, 0.016], points: -4.0 },
  ],
  VARITY_R: [
    { range: [0.966, Number.POSITIVE_INFINITY], points: 4.0 },
    { range: [0.915, 0.965], points: 3.0 },
    { range: [0.842, 0.914], points: 2.0 },
    { range: [0.675, 0.841], points: 1.0 },
    { range: [0.252, 0.674], points: 0.0 },
    { range: [0.117, 0.251], points: -1.0 },
    { range: [0.063, 0.116], points: -2.0 },
    { range: [0.037, 0.062], points: -3.0 },
    { range: [0.0, 0.036], points: -4.0 },
  ],
  VEST4: [
    { range: [0.965, Number.POSITIVE_INFINITY], points: 4.0 },
    { range: [0.909, 0.964], points: 3.0 },
    { range: [0.861, 0.908], points: 2.0 },
    { range: [0.764, 0.86], points: 1.0 },
    { range: [0.45, 0.763], points: 0.0 },
    { range: [0.303, 0.449], points: -1.0 },
    { range: [0.078, 0.302], points: -2.0 },
    { range: [0.0, 0.077], points: -3.0 },
  ],
}

// Informative details options based on classification
const informativeDetailsOptions = {
  pathogenic: [
    "Distinct nucleotide change, same amino acid change",
    "Distinct amino acid change, Grantham Difference of Informative Variant ≤ Variant being considered",
  ],
  benign: [
    "Distinct nucleotide change, same amino acid change",
    "Distinct amino acid change, Grantham Difference of Informative Variant ≥ Variant being considered",
  ],
}

// Scoring rubric for informative variants
const informativeVariantScoring = {
  "Distinct nucleotide change, same amino acid change": {
    pathogenic: { first: 4.0, additional: 2.0 },
    benign: { first: -4.0, additional: -2.0 },
  },
  "Distinct amino acid change, Grantham Difference of Informative Variant ≤ Variant being considered": {
    pathogenic: { first: 2.0, additional: 1.0 },
  },
  "Distinct amino acid change, Grantham Difference of Informative Variant ≥ Variant being considered": {
    benign: { first: -2.0, additional: -1.0 },
  },
}

interface InformativeVariant {
  variantId: string
  variantTitle: string
  classification: string
  informativeDetails: string
}

interface ScoringContextType {
  // Step management
  scoringStep: number
  setScoringStep: (step: number) => void
  handleNextStep: () => void
  handlePreviousStep: () => void

  // Predictor selection
  selectedPredictor: string
  setSelectedPredictor: (predictor: string) => void
  customPredictorName: string
  setCustomPredictorName: (name: string) => void
  predictorScore: string
  setPredictorScore: (score: string) => void
  evidencePoints: number | string
  setEvidencePoints: (points: number | string) => void
  showScoreInput: boolean
  setShowScoreInput: (show: boolean) => void
  manualImpactPoints: number
  setManualImpactPoints: (points: number) => void

  // Transcript relevance
  transcriptRelevance: string
  setTranscriptRelevance: (relevance: string) => void
  modifiedImpactPoints: number | string
  setModifiedImpactPoints: (points: number | string) => void

  // Informative variants
  informativeVariants: InformativeVariant[]
  setInformativeVariants: (variants: InformativeVariant[]) => void
  newVariant: InformativeVariant
  setNewVariant: (variant: InformativeVariant) => void
  totalInformativePoints: number
  setTotalInformativePoints: (points: number) => void

  // Splicing assessment
  splicingAssessment: string
  setSplicingAssessment: (assessment: string) => void
  splicingPredictorTool: string
  setSplicingPredictorTool: (tool: string) => void
  splicingPredictionScore: string
  setSplicingPredictionScore: (score: string) => void
  splicingAssessmentComment: string
  setSplicingAssessmentComment: (comment: string) => void
  splicingScore: number | string | null
  setSplicingScore: (score: number | string | null) => void
  splicingPredictorScore: number | string | null
  setSplicingPredictorScore: (score: number | string | null) => void
  splicingInformativeScore: number | string | null
  setSplicingInformativeScore: (score: number | string | null) => void

  // Summary
  predictedEffectExplanation: string
  setPredictedEffectExplanation: (explanation: string) => void

  // Helper functions
  handlePredictorChange: (predictor: string) => void
  handleScoreChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  getExistingPredictorScore: (predictor: string) => string | null
  calculateEvidencePoints: (predictor: string, score: string) => void
  formatRangeDisplay: (range: number[], predictor: string) => string
  handleVariantInputChange: (field: string, value: string) => void
  handleAddVariant: () => void
  handleRemoveVariant: (index: number) => void
  calculateVariantPoints: (variant: InformativeVariant, variants: InformativeVariant[]) => number
  calculateTotalInformativePoints: (variants: InformativeVariant[]) => void
  getInformativeDetailsOptions: (classification: string) => string[]
  handleSplicingAssessmentChange: (value: string) => void

  // Data
  initialEvidencePoints: typeof initialEvidencePoints
}

const ScoringContext = createContext<ScoringContextType | undefined>(undefined)

export const useScoringContext = () => {
  const context = useContext(ScoringContext)
  if (!context) {
    throw new Error("useScoringContext must be used within a ScoringProvider")
  }
  return context
}

interface ScoringProviderProps {
  children: ReactNode
}

export const ScoringProvider: React.FC<ScoringProviderProps> = ({ children }) => {
  // Step management
  const [scoringStep, setScoringStep] = useState(1)

  // Predictor selection
  const [selectedPredictor, setSelectedPredictor] = useState("")
  const [customPredictorName, setCustomPredictorName] = useState("")
  const [predictorScore, setPredictorScore] = useState("")
  const [evidencePoints, setEvidencePoints] = useState<number | string>(0)
  const [showScoreInput, setShowScoreInput] = useState(false)
  const [manualImpactPoints, setManualImpactPoints] = useState(0)

  // Transcript relevance
  const [transcriptRelevance, setTranscriptRelevance] = useState("")
  const [modifiedImpactPoints, setModifiedImpactPoints] = useState<number | string>(0)

  // Informative variants
  const [informativeVariants, setInformativeVariants] = useState<InformativeVariant[]>([])
  const [newVariant, setNewVariant] = useState<InformativeVariant>({
    variantId: "",
    variantTitle: "display HGVS",
    classification: "",
    informativeDetails: "",
  })
  const [totalInformativePoints, setTotalInformativePoints] = useState(0)

  // Splicing assessment
  const [splicingAssessment, setSplicingAssessment] = useState("")
  const [splicingPredictorTool, setSplicingPredictorTool] = useState("")
  const [splicingPredictionScore, setSplicingPredictionScore] = useState("")
  const [splicingAssessmentComment, setSplicingAssessmentComment] = useState("")
  const [splicingScore, setSplicingScore] = useState<number | string | null>(null)
  const [splicingPredictorScore, setSplicingPredictorScore] = useState<number | string | null>(null)
  const [splicingInformativeScore, setSplicingInformativeScore] = useState<number | string | null>(null)

  // Summary
  const [predictedEffectExplanation, setPredictedEffectExplanation] = useState("")

  // In silico predictors data (mock data)
  const inSilicoPredictors = [
    { tool: "REVEL", score: "0.368" },
    { tool: "VEST4", score: "0.083" },
    { tool: "BayesDel", score: "-0.333827" },
    { tool: "AlphaMissense", score: "0.89" },
    { tool: "ESM1b", score: "0.012" },
    { tool: "MutationTaster", score: "1.2" },
    { tool: "PROVEAN", score: "-2.41" },
  ]

  // Helper functions
  const getExistingPredictorScore = (predictor: string): string | null => {
    if (!predictor) return null
    const predictorData = inSilicoPredictors.find((p) => p.tool === predictor)
    return predictorData ? predictorData.score : null
  }

  const handlePredictorChange = (predictor: string) => {
    setSelectedPredictor(predictor)

    if (predictor === "None") {
      setPredictorScore("")
      setShowScoreInput(false)
      setEvidencePoints("Not Met")
      return
    }

    if (predictor === "Other") {
      setCustomPredictorName("")
      setShowScoreInput(false)
      setPredictorScore("")
      return
    }

    const existingScore = getExistingPredictorScore(predictor)

    if (existingScore) {
      setPredictorScore(existingScore)
      setShowScoreInput(false)
      calculateEvidencePoints(predictor, existingScore)
    } else {
      setPredictorScore("")
      setShowScoreInput(true)
      setEvidencePoints(0)
    }
  }

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const score = e.target.value
    setPredictorScore(score)
    calculateEvidencePoints(selectedPredictor, score)
  }

  const calculateEvidencePoints = (predictor: string, score: string) => {
    if (!predictor || !score || isNaN(Number.parseFloat(score))) {
      setEvidencePoints(0)
      return
    }

    const numericScore = Number.parseFloat(score)
    const pointsTable = initialEvidencePoints[predictor as keyof typeof initialEvidencePoints]

    if (!pointsTable) {
      setEvidencePoints(0)
      return
    }

    for (const entry of pointsTable) {
      const [min, max] = entry.range
      if (numericScore >= min && numericScore <= max) {
        setEvidencePoints(entry.points)
        return
      }
    }

    setEvidencePoints(0)
  }

  const formatRangeDisplay = (range: number[], predictor: string): string => {
    const [min, max] = range

    if (min === Number.NEGATIVE_INFINITY) {
      return `≤ ${max}`
    } else if (max === Number.POSITIVE_INFINITY) {
      return `≥ ${min}`
    } else {
      return `${min} to ${max}`
    }
  }

  // Informative variant functions
  const handleVariantInputChange = (field: string, value: string) => {
    setNewVariant({
      ...newVariant,
      [field]: value,
      ...(field === "classification" && { informativeDetails: "" }),
    })
  }

  const handleAddVariant = () => {
    if (!newVariant.variantId || !newVariant.classification) return

    const isPLPorBLB = ["Pathogenic", "Likely Pathogenic", "Benign", "Likely Benign"].includes(
      newVariant.classification,
    )
    if (isPLPorBLB && !newVariant.informativeDetails) return

    const updatedVariants = [...informativeVariants, newVariant]
    setInformativeVariants(updatedVariants)
    calculateTotalInformativePoints(updatedVariants)

    setNewVariant({
      variantId: "",
      variantTitle: "display HGVS",
      classification: "",
      informativeDetails: "",
    })
  }

  const handleRemoveVariant = (index: number) => {
    const updatedVariants = informativeVariants.filter((_, i) => i !== index)
    setInformativeVariants(updatedVariants)
    calculateTotalInformativePoints(updatedVariants)
  }

  const calculateVariantPoints = (variant: InformativeVariant, variants: InformativeVariant[]): number => {
    if (!variant.informativeDetails) return 0

    const isStrictlyPathogenic = variant.classification === "Pathogenic"
    const isStrictlyBenign = variant.classification === "Benign"
    const isPathogenic = ["Pathogenic", "Likely Pathogenic"].includes(variant.classification)
    const isBenign = ["Benign", "Likely Benign"].includes(variant.classification)

    let scoringCategory = null
    if (isPathogenic) {
      scoringCategory =
        informativeVariantScoring[variant.informativeDetails as keyof typeof informativeVariantScoring]?.pathogenic
    } else if (isBenign) {
      scoringCategory =
        informativeVariantScoring[variant.informativeDetails as keyof typeof informativeVariantScoring]?.benign
    }

    if (!scoringCategory) return 0

    const isFirstPathogenic =
      isStrictlyPathogenic &&
      !variants.some(
        (v) =>
          v !== variant && v.classification === "Pathogenic" && v.informativeDetails === variant.informativeDetails,
      )

    const isFirstBenign =
      isStrictlyBenign &&
      !variants.some(
        (v) => v !== variant && v.classification === "Benign" && v.informativeDetails === variant.informativeDetails,
      )

    if ((isStrictlyPathogenic && isFirstPathogenic) || (isStrictlyBenign && isFirstBenign)) {
      return scoringCategory.first
    } else {
      return scoringCategory.additional
    }
  }

  const calculateTotalInformativePoints = (variants: InformativeVariant[]) => {
    let totalPoints = 0

    variants.forEach((variant) => {
      const points = calculateVariantPoints(variant, variants)
      totalPoints += points
    })

    setTotalInformativePoints(totalPoints)
  }

  const getInformativeDetailsOptions = (classification: string): string[] => {
    if (["Pathogenic", "Likely Pathogenic"].includes(classification)) {
      return informativeDetailsOptions.pathogenic
    } else if (["Benign", "Likely Benign"].includes(classification)) {
      return informativeDetailsOptions.benign
    }
    return []
  }

  // Splicing functions
  const handleSplicingAssessmentChange = (value: string) => {
    setSplicingAssessment(value)

    if (value === "no_impact") {
      setSplicingScore(-1.0)
      setSplicingPredictorScore(-1.0)
      setSplicingInformativeScore(0)
    } else if (value === "inconclusive") {
      setSplicingScore(0.0)
      setSplicingPredictorScore(0.0)
      setSplicingInformativeScore(0)
    } else if (value === "not_assessed") {
      setSplicingScore("NA")
      setSplicingPredictorScore(null)
      setSplicingInformativeScore(null)
    } else if (value === "impact_predicted") {
      setSplicingScore(null)
      setSplicingPredictorScore(null)
      setSplicingInformativeScore(null)
    } else {
      setSplicingScore(null)
      setSplicingPredictorScore(null)
      setSplicingInformativeScore(null)
    }
  }

  // Step navigation
  const handleNextStep = () => {
    if (scoringStep < 6) {
      if (scoringStep === 2 && (evidencePoints <= 0 || evidencePoints === "Not Met")) {
        setScoringStep(4)
      } else {
        setScoringStep(scoringStep + 1)
      }
    }
  }

  const handlePreviousStep = () => {
    if (scoringStep > 1) {
      if (scoringStep === 4 && (evidencePoints <= 0 || evidencePoints === "Not Met")) {
        setScoringStep(2)
      } else {
        setScoringStep(scoringStep - 1)
      }
    }
  }

  // Calculate modified impact points when transcript relevance changes
  useEffect(() => {
    if (transcriptRelevance && evidencePoints !== "Not Met") {
      setModifiedImpactPoints((Number(evidencePoints) * Number.parseInt(transcriptRelevance)) / 100)
    } else {
      setModifiedImpactPoints(evidencePoints)
    }
  }, [transcriptRelevance, evidencePoints])

  const contextValue: ScoringContextType = {
    // Step management
    scoringStep,
    setScoringStep,
    handleNextStep,
    handlePreviousStep,

    // Predictor selection
    selectedPredictor,
    setSelectedPredictor,
    customPredictorName,
    setCustomPredictorName,
    predictorScore,
    setPredictorScore,
    evidencePoints,
    setEvidencePoints,
    showScoreInput,
    setShowScoreInput,
    manualImpactPoints,
    setManualImpactPoints,

    // Transcript relevance
    transcriptRelevance,
    setTranscriptRelevance,
    modifiedImpactPoints,
    setModifiedImpactPoints,

    // Informative variants
    informativeVariants,
    setInformativeVariants,
    newVariant,
    setNewVariant,
    totalInformativePoints,
    setTotalInformativePoints,

    // Splicing assessment
    splicingAssessment,
    setSplicingAssessment,
    splicingPredictorTool,
    setSplicingPredictorTool,
    splicingPredictionScore,
    setSplicingPredictionScore,
    splicingAssessmentComment,
    setSplicingAssessmentComment,
    splicingScore,
    setSplicingScore,
    splicingPredictorScore,
    setSplicingPredictorScore,
    splicingInformativeScore,
    setSplicingInformativeScore,

    // Summary
    predictedEffectExplanation,
    setPredictedEffectExplanation,

    // Helper functions
    handlePredictorChange,
    handleScoreChange,
    getExistingPredictorScore,
    calculateEvidencePoints,
    formatRangeDisplay,
    handleVariantInputChange,
    handleAddVariant,
    handleRemoveVariant,
    calculateVariantPoints,
    calculateTotalInformativePoints,
    getInformativeDetailsOptions,
    handleSplicingAssessmentChange,

    // Data
    initialEvidencePoints,
  }

  return <ScoringContext.Provider value={contextValue}>{children}</ScoringContext.Provider>
}
