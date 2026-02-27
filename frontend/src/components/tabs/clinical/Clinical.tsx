import { useEffect, useRef, useState } from "react"
import { Button } from "../../ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/Card";
import { Input } from "../../ui/Input";
import { Textarea } from "../../ui/Textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/Select"
import { Checkbox } from "../../ui/Checkbox"
import { Label } from "../../ui/Label"

import { Plus, X, Info } from "lucide-react"


const Clinical = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"case" | "phenotype" | "family">("case");
  const [isDeNovoModalOpen, setIsDeNovoModalOpen] = useState(false);
  const [isVariantInTransModalOpen, setIsVariantInTransModalOpen] = useState(false);
  const [deNovoData, setDeNovoData] = useState<{
    status: string
    parentalConfirmation: string
  } | null>(null);
  const [tempDeNovoStatus, setTempDeNovoStatus] = useState("");
  const [tempParentalConfirmation, setTempParentalConfirmation] = useState("");
  const [variantInTransData, setVariantInTransData] = useState<{
    variantId: string
    classification: string
    phaseStatus: string
  } | null>(null);
  const [tempVariantId, setTempVariantId] = useState("");
  const [tempVariantClassification, setTempVariantClassification] = useState("");
  const [tempPhaseStatus, setTempPhaseStatus] = useState("");

  type SectionId = "section-case" | "section-phenotype" | "section-family"
  const sectionMap: Record<SectionId, "case" | "phenotype" | "family"> = {
    "section-case": "case",
    "section-phenotype": "phenotype",
    "section-family": "family",
  }
  const sectionIds: SectionId[] = ["section-case", "section-phenotype", "section-family"]
  const pendingSectionRef = useRef<SectionId | null>(null)
  const pendingSectionTimeoutRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (pendingSectionTimeoutRef.current !== null) {
        window.clearTimeout(pendingSectionTimeoutRef.current)
      }
    },
    [],
  )

  const handleDeNovoSave = () => {
    if (tempDeNovoStatus && tempParentalConfirmation) {
      setDeNovoData({
        status: tempDeNovoStatus,
        parentalConfirmation: tempParentalConfirmation,
      })
      setIsDeNovoModalOpen(false)
      setTempDeNovoStatus("")
      setTempParentalConfirmation("")
    }
  }

  const handleVariantInTransSave = () => {
    setVariantInTransData({
      variantId: tempVariantId,
      classification: tempVariantClassification,
      phaseStatus: tempPhaseStatus,
    })
    setIsVariantInTransModalOpen(false)
    setTempVariantId("")
    setTempVariantClassification("")
    setTempPhaseStatus("")
  }

  const scrollToSection = (sectionId: SectionId) => {
    pendingSectionRef.current = sectionId
    if (pendingSectionTimeoutRef.current !== null) {
      window.clearTimeout(pendingSectionTimeoutRef.current)
    }
    pendingSectionTimeoutRef.current = window.setTimeout(() => {
      pendingSectionRef.current = null
      pendingSectionTimeoutRef.current = null
    }, 1400)

    setActiveSection(sectionMap[sectionId])
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between mb-6">
          <div>
            <CardTitle className="font-bold">Clinical Information</CardTitle>
            <CardDescription>Clinical data related to this variant</CardDescription>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add proband data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-8 text-gray-500">
          {/* Main Content Area */}
          <main className="flex-1 p-8">
            <Card className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-900">
                  {/* Scored Data Section */}
                  <thead>
                    <tr>
                      <th colSpan={8} className="bg-blue-200 border border-gray-900 p-3 text-center font-bold text-base">
                        Scored data
                      </th>
                    </tr>
                    <tr>
                      <td colSpan={3} className="border border-gray-900 p-3 text-sm">
                        <div className="italic">Mode of inheritance = X-linked</div>
                        <div className="italic">Disease = Cerebral Creatine Deficiency Syndrome (MONDO:23432)</div>
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-3 text-center font-bold">
                        <div>Coy et al. 2021</div>
                        <div>PMID 2025233</div>
                        <div>CASE 2</div>
                      </td>
                      <td colSpan={2} className="border border-gray-900 p-3 text-center font-bold">
                        <div>Lee et al. 2008</div>
                        <div>PMID 202343243</div>
                        <div>Proband B</div>
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-gray-900 p-2 text-left font-bold bg-gray-100">Code</th>
                      <th className="border border-gray-900 p-2 text-left font-bold bg-gray-100">Code Component</th>
                      <th className="border border-gray-900 p-2 text-left font-bold bg-gray-100">Aggregate score</th>
                      <th className="border border-gray-900 p-2 text-center font-bold bg-gray-100">Score</th>
                      <th className="border border-gray-900 p-2 text-left font-bold bg-gray-100">Score reasoning</th>
                      <th className="border border-gray-900 p-2 text-center font-bold bg-gray-100">Score</th>
                      <th className="border border-gray-900 p-2 text-left font-bold bg-gray-100" colSpan={2}>
                        Score reasoning
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Clinical Observations Section */}
                    <tr>
                      <td rowSpan={5} className="border border-gray-900 p-3 font-bold bg-gray-100 align-top">
                        Clinical
                        <br />
                        Observations
                        <br />
                        (CLN)
                      </td>
                      <td className="border border-gray-900 p-2 text-sm">
                        <div className="font-bold">CLN_UAF</div>
                        <div className="italic">Unaffected Observations</div>
                      </td>
                      <td rowSpan={2} className="border border-gray-900 p-2 text-center bg-yellow-50"></td>
                      <td rowSpan={2} className="border border-gray-900 p-2"></td>
                      <td rowSpan={2} className="border border-gray-900 p-3 text-sm">
                        - Phenotype consistent for gene and all relevant genes for disorder tested, with no other variant of
                        interest.
                        <br />- VBC is hemizygous
                      </td>
                      <td rowSpan={2} className="border border-gray-900 p-2 text-center">
                        +0.5
                      </td>
                      <td rowSpan={2} colSpan={2} className="border border-gray-900 p-3 text-sm">
                        - Phenotype consistent for gene and all relevant genes for disorder tested, with no other variant of
                        interest.
                        <br />- VBC is hemizygous.
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-900 p-2 text-sm">
                        <div className="font-bold">CLN_ALT</div>
                        <div className="italic">Alternate Cause</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-900 p-2 text-sm">
                        <div className="font-bold">CLN_AFF</div>
                        <div className="italic">Affected Observations</div>
                      </td>
                      <td className="border border-gray-900 p-2 text-center font-bold bg-yellow-50">+1.0</td>
                      <td className="border border-gray-900 p-2 text-center">+0.5</td>
                      <td className="border border-gray-900 p-2"></td>
                      <td className="border border-gray-900 p-2"></td>
                      <td colSpan={2} className="border border-gray-900 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-900 p-2 text-sm">
                        <div className="font-bold">CLN_DNV</div>
                        <div className="italic">De Novo Observations</div>
                      </td>
                      <td className="border border-gray-900 p-2 text-center font-bold bg-yellow-50">+2.0</td>
                      <td className="border border-gray-900 p-2"></td>
                      <td className="border border-gray-900 p-2"></td>
                      <td className="border border-gray-900 p-2 text-center">+2.0</td>
                      <td colSpan={2} className="border border-gray-900 p-3 text-sm">
                        - Phenotype consistent for gene and all relevant genes for disorder tested.
                        <br />- de novo with confirmed parental relationships.
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-900 p-2 text-sm">
                        <div className="font-bold">CLN_CCS</div>
                        <div className="italic">Case-Control Studies</div>
                      </td>
                      <td className="border border-gray-900 p-2 bg-yellow-50"></td>
                      <td className="border border-gray-900 p-2"></td>
                      <td className="border border-gray-900 p-2"></td>
                      <td className="border border-gray-900 p-2"></td>
                      <td colSpan={2} className="border border-gray-900 p-2"></td>
                    </tr>

                    {/* Locus Specificity Section */}
                    <tr>
                      <td rowSpan={2} className="border border-gray-900 p-3 font-bold bg-gray-100 align-top">
                        Locus Specificity
                        <br />
                        (LOC)
                      </td>
                      <td className="border border-gray-900 p-2 text-sm">
                        <div className="font-bold">LOC_PHE</div>
                        <div className="italic">Specific Phenotype</div>
                      </td>
                      <td rowSpan={2} className="border border-gray-900 p-2 bg-yellow-50"></td>
                      <td rowSpan={2} className="border border-gray-900 p-2"></td>
                      <td rowSpan={2} className="border border-gray-900 p-2"></td>
                      <td rowSpan={2} className="border border-gray-900 p-2"></td>
                      <td rowSpan={2} colSpan={2} className="border border-gray-900 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-900 p-2 text-sm">
                        <div className="font-bold">LOC_SEG</div>
                        <div className="italic">Segregations with Disease</div>
                      </td>
                    </tr>
                  </tbody>

                  {/* Curated Data Section */}
                  <thead>
                    <tr>
                      <th colSpan={8} className="bg-blue-300 border border-gray-900 p-3 text-center font-bold text-base">
                        Curated data
                      </th>
                    </tr>
                    <tr>
                      <td colSpan={3} className="border border-gray-900 p-3"></td>
                      <td colSpan={3} className="border border-gray-900 p-3 text-center font-bold">
                        <div>Coy et al. 2021</div>
                        <div>PMID 2025233</div>
                        <div>CASE 2</div>
                      </td>
                      <td colSpan={2} className="border border-gray-900 p-3 text-center font-bold">
                        <div>Lee et al. 2008</div>
                        <div>PMID 202343243</div>
                        <div>Proband B</div>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Case Information Section */}
                    <tr>
                      <td rowSpan={9} className="border border-gray-900 p-3 font-bold bg-gray-100 align-top">
                        Case information
                      </td>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        Phenotypic features associated with proband(s) (HPO)
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2">
                        HPO:223423232
                      </td>
                      <td colSpan={2} className="border border-gray-900 p-2"></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        Free text description of disease
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2 text-sm">
                        Male age 8 with history of developmental delay, seizures beginning at 3 years of age. No urine
                        creatine results available
                      </td>
                      <td colSpan={2} className="border border-gray-900 p-2 text-sm">
                        Male age 4, severe developmental delays, urine creatine and MRS show decreased creatine levels.
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        Is Unaffected
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2"></td>
                      <td colSpan={2} className="border border-gray-900 p-2"></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        Zygosity of variant in proband
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2">
                        Hemizygous
                      </td>
                      <td colSpan={2} className="border border-gray-900 p-2">
                        Hemizygous
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        Proband(s) sex
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2">
                        Male
                      </td>
                      <td colSpan={2} className="border border-gray-900 p-2">
                        Male
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        Variant in trans
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2"></td>
                      <td colSpan={2} className="border border-gray-900 p-2"></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        de novo status
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2"></td>
                      <td colSpan={2} className="border border-gray-900 p-2">
                        De novo status = Yes
                        <br />
                        Maternity/Paternity status = Confirmed
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        variant of interest
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2"></td>
                      <td colSpan={2} className="border border-gray-900 p-2"></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        Comment
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2"></td>
                      <td colSpan={2} className="border border-gray-900 p-2"></td>
                    </tr>

                    {/* Phenotype Consistency Section */}
                    <tr>
                      <td rowSpan={7} className="border border-gray-900 p-3 font-bold bg-gray-100 align-top">
                        Phenotype
                        <br />
                        consistency
                      </td>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        Phenotype consistency
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2">
                        Phenotype consistent for gene
                      </td>
                      <td colSpan={2} className="border border-gray-900 p-2">
                        Phenotype consistent for gene
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        Phenotype highly consistent with disease
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2">
                        No
                      </td>
                      <td colSpan={2} className="border border-gray-900 p-2">
                        No
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        All relevant genes for disorder tested
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2">
                        Yes
                      </td>
                      <td colSpan={2} className="border border-gray-900 p-2">
                        Yes
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        Observed MOI differs from scoring MOI
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2"></td>
                      <td colSpan={2} className="border border-gray-900 p-2"></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        Alternate Cause
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2"></td>
                      <td colSpan={2} className="border border-gray-900 p-2"></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        Multiple probands counted
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2"></td>
                      <td colSpan={2} className="border border-gray-900 p-2"></td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border border-gray-900 p-2 font-bold">
                        Comment
                      </td>
                      <td colSpan={3} className="border border-gray-900 p-2">
                        Variant identified via clinical exome sequencing
                      </td>
                      <td colSpan={2} className="border border-gray-900 p-2"></td>
                    </tr>

                    {/* Co-segregation Section */}
                    <tr>
                      <td className="border border-gray-900 p-3 font-bold bg-gray-100 align-top">
                        Co-segregation
                        <br />
                        of variant in
                        <br />
                        relatives
                      </td>
                      <td colSpan={2} className="border border-gray-900 p-2"></td>
                      <td colSpan={3} className="border border-gray-900 p-2"></td>
                      <td colSpan={2} className="border border-gray-900 p-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </main>

          {/* Proband Data Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] flex flex-col border-2 border-gray-900">
                {/* Modal Header */}
                <div className="bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Proband Data Form</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-lg text-gray-600">Autosomal Dominant MOI</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="hover:bg-gray-100">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* Left Navigation Column */}
                  <div className="w-1/3 border-r border-gray-300 bg-gray-50 p-6 overflow-y-auto">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Form Sections</h3>
                    <nav className="space-y-2">
                      <button
                        onClick={() => scrollToSection("section-case")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeSection === "case"
                            ? "bg-blue-600 text-white font-semibold"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${activeSection === "case" ? "bg-white text-blue-600" : "bg-blue-100 text-blue-600"
                              }`}
                          >
                            1
                          </span>
                          <div>
                            <div className="font-semibold">Case Information</div>
                            <div className={`text-xs ${activeSection === "case" ? "text-blue-100" : "text-gray-500"}`}>
                              Proband details and demographics
                            </div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => scrollToSection("section-phenotype")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeSection === "phenotype"
                            ? "bg-blue-600 text-white font-semibold"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${activeSection === "phenotype" ? "bg-white text-blue-600" : "bg-blue-100 text-blue-600"
                              }`}
                          >
                            2
                          </span>
                          <div>
                            <div className="font-semibold">Phenotype Analysis</div>
                            <div className={`text-xs ${activeSection === "phenotype" ? "text-blue-100" : "text-gray-500"}`}>
                              Consistency and testing relevance
                            </div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => scrollToSection("section-family")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeSection === "family"
                            ? "bg-blue-600 text-white font-semibold"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${activeSection === "family" ? "bg-white text-blue-600" : "bg-blue-100 text-blue-600"
                              }`}
                          >
                            3
                          </span>
                          <div>
                            <div className="font-semibold">Family Data</div>
                            <div className={`text-xs ${activeSection === "family" ? "text-blue-100" : "text-gray-500"}`}>
                              Co-segregation information
                            </div>
                          </div>
                        </div>
                      </button>
                    </nav>
                  </div>

                  {/* Right Content Column */}
                  <div
                    className="w-2/3 overflow-y-auto p-6 space-y-6"
                    onScroll={(e) => {
                      const target = e.currentTarget
                      const pendingSectionId = pendingSectionRef.current

                      if (pendingSectionId) {
                        const pendingElement = document.getElementById(pendingSectionId)
                        const containerTop = target.getBoundingClientRect().top
                        const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 8
                        const isPendingSectionAtTop =
                          pendingElement !== null &&
                          Math.abs(pendingElement.getBoundingClientRect().top - containerTop - 24) <= 18

                        if (isPendingSectionAtTop || (pendingSectionId === "section-family" && isAtBottom)) {
                          pendingSectionRef.current = null
                          if (pendingSectionTimeoutRef.current !== null) {
                            window.clearTimeout(pendingSectionTimeoutRef.current)
                            pendingSectionTimeoutRef.current = null
                          }
                        } else {
                          setActiveSection(sectionMap[pendingSectionId])
                          return
                        }
                      }

                      if (target.scrollTop + target.clientHeight >= target.scrollHeight - 8) {
                        setActiveSection("family")
                        return
                      }

                      const containerTop = target.getBoundingClientRect().top
                      let closestSection: "case" | "phenotype" | "family" = "case"
                      let closestDistance = Number.POSITIVE_INFINITY

                      for (const sectionId of sectionIds) {
                        const element = document.getElementById(sectionId)
                        if (!element) continue

                        const distanceFromTop = Math.abs(element.getBoundingClientRect().top - containerTop - 24)
                        if (distanceFromTop < closestDistance) {
                          closestDistance = distanceFromTop
                          closestSection = sectionMap[sectionId]
                        }
                      }

                      setActiveSection(closestSection)
                    }}
                  >
                    {/* Section 1: Case Information */}
                    <section
                      id="section-case"
                      className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm scroll-mt-6"
                    >
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Case Information for proband(s)</h3>
                      </div>

                      <div className="space-y-4">
                        {/* Label Field */}
                        <div className="flex items-center gap-4">
                          <Label htmlFor="label" className="w-48 text-sm font-semibold">
                            Label <span className="text-red-500">*</span>
                          </Label>
                          <Input id="label" placeholder="Enter label" className="flex-1 max-w-xs" />
                        </div>

                        {/* Associated Phenotypic Features (HPO) */}
                        <div className="flex items-start gap-4">
                          <Label htmlFor="hpo" className="w-48 text-sm font-semibold pt-2">
                            Associated phenotypic feature(s) (HPO)
                          </Label>
                          <div className="flex-1 flex gap-2">
                            <Input id="hpo" placeholder="e.g HP:0010704, HP:0030300" className="flex-1 max-w-md" />
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Terms</Button>
                            <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                              Clear Terms
                            </Button>
                          </div>
                        </div>

                        {/* Associated Phenotypic Features (Free Text) */}
                        <div className="flex items-start gap-4">
                          <Label htmlFor="phenotype-text" className="w-48 text-sm font-semibold pt-2">
                            Associated phenotypic feature(s) (Free Text)
                          </Label>
                          <Textarea
                            id="phenotype-text"
                            placeholder="Enter phenotypic features"
                            className="flex-1 max-w-md"
                            rows={3}
                          />
                        </div>

                        {/* Four Column Row */}
                        <div className="grid grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="zygosity" className="text-sm font-semibold flex items-center gap-1">
                              Zygosity of variant <Info className="h-3 w-3 text-blue-600" />
                            </Label>
                            <Select>
                              <SelectTrigger id="zygosity">
                                <SelectValue placeholder="Select zygosity" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="heterozygous">Heterozygous</SelectItem>
                                <SelectItem value="homozygous">Homozygous</SelectItem>
                                <SelectItem value="hemizygous">Hemizygous</SelectItem>
                                <SelectItem value="compound-heterozygote">Compound heterozygote</SelectItem>
                                <SelectItem value="unknown">Unknown</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="sex" className="text-sm font-semibold">
                              Sex
                            </Label>
                            <Select>
                              <SelectTrigger id="sex">
                                <SelectValue placeholder="Select sex" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="unknown">Unknown</SelectItem>
                                <SelectItem value="ambiguous">Ambiguous</SelectItem>
                                <SelectItem value="intersex">Intersex</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="age" className="text-sm font-semibold">
                              Age of onset
                            </Label>
                            <Select>
                              <SelectTrigger id="age">
                                <SelectValue placeholder="Select age" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="infant">Infant</SelectItem>
                                <SelectItem value="child">Child</SelectItem>
                                <SelectItem value="adult">Adult</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="country" className="text-sm font-semibold">
                              Country of origin
                            </Label>
                            <Select>
                              <SelectTrigger id="country">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="us">United States</SelectItem>
                                <SelectItem value="uk">United Kingdom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Comments */}
                        <div className="space-y-2">
                          <Label htmlFor="case-comments" className="text-sm font-semibold">
                            Comments
                          </Label>
                          <Textarea id="case-comments" placeholder="Enter comments about case" rows={3} />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsDeNovoModalOpen(true)}>
                              <Plus className="mr-1 h-3 w-3" />
                              de novo
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsVariantInTransModalOpen(true)}>
                              <Plus className="mr-1 h-3 w-3" />
                              variant in trans
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox id="section1-complete" />
                            <Label htmlFor="section1-complete" className="text-sm font-semibold">
                              Section completed
                            </Label>
                          </div>
                        </div>

                        {deNovoData && (
                          <div className="mt-4 p-4 border border-gray-300 rounded-md bg-white">
                            <h4 className="font-semibold text-sm mb-3">De Novo Information</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">De novo status:</span>{" "}
                                <span className="capitalize">{deNovoData.status}</span>
                              </div>
                              <div>
                                <span className="font-medium">Parental confirmation:</span>{" "}
                                <span className="capitalize">{deNovoData.parentalConfirmation}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {variantInTransData && (
                          <div className="mt-4 p-4 border border-gray-300 rounded-md bg-white">
                            <h4 className="font-semibold text-sm mb-3">Variant in Trans Information</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Variant ID:</span> {variantInTransData.variantId}
                              </div>
                              <div>
                                <span className="font-medium">Classification:</span> {variantInTransData.classification}
                              </div>
                              <div>
                                <span className="font-medium">Phase status:</span> {variantInTransData.phaseStatus}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Section 2: Phenotype Analysis */}
                    <section
                      id="section-phenotype"
                      className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm scroll-mt-6"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Phenotype consistency</h3>
                      <p className="text-sm italic text-gray-600 mb-6">
                        These fields can only be completed if the disease and mode of inheritance have been defined for the
                        record
                      </p>

                      <div className="space-y-4">
                        {/* Two Column Row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="consistency" className="text-sm font-semibold">
                              Phenotype consistency <span className="text-red-500">*</span>
                            </Label>
                            <Select>
                              <SelectTrigger id="consistency">
                                <SelectValue placeholder="Select phenotype consistency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="specific">Phenotype specific for gene</SelectItem>
                                <SelectItem value="consistent">Phenotype consistent with gene</SelectItem>
                                <SelectItem value="not-consistent">Phenotype not consistent with gene</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-end">
                            <div className="flex items-center gap-2">
                              <Checkbox id="highly-consistent" />
                              <Label htmlFor="highly-consistent" className="text-sm">
                                Mark if phenotype is highly consistent for disease
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="testing" className="text-sm font-semibold">
                              Testing relevance <span className="text-red-500">*</span>
                            </Label>
                            <Select>
                              <SelectTrigger id="testing">
                                <SelectValue placeholder="Select testing relevance" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all-tested">All relevant genes were tested</SelectItem>
                                <SelectItem value="not-all-tested">Not all relevant genes were tested</SelectItem>
                                <SelectItem value="unknown">Unknown</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-end">
                            <div className="flex items-center gap-2">
                              <Checkbox id="moi-different" />
                              <Label htmlFor="moi-different" className="text-sm">
                                Mark if MOI observed in proband is different than MOI being scored
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Comments */}
                        <div className="space-y-2 pt-4">
                          <Label htmlFor="phenotype-comments" className="text-sm font-semibold">
                            Comments
                          </Label>
                          <Textarea
                            id="phenotype-comments"
                            placeholder="Enter comments about phenotype consistency in proband(s)"
                            rows={3}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" size="sm">
                            <Plus className="mr-1 h-3 w-3" />
                            alternative cause
                          </Button>
                          <Button variant="outline" size="sm">
                            <Plus className="mr-1 h-3 w-3" />
                            multiple probands
                          </Button>
                          <Button variant="outline" size="sm">
                            <Plus className="mr-1 h-3 w-3" />
                            variant of interest
                          </Button>
                        </div>
                      </div>
                    </section>

                    {/* Section 3: Family Data */}
                    <section
                      id="section-family"
                      className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm scroll-mt-6"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">Co-segregation of variant in relatives</h3>
                        <span className="text-sm font-semibold">Scoring Autosomal Dominant</span>
                      </div>
                      <p className="text-sm italic text-gray-600 mb-6">
                        These fields can only be completed if the disease and mode of inheritance have been defined for the
                        record
                      </p>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Label htmlFor="affected-relatives" className="flex-1 text-sm">
                            Number of affected relatives with monoallelic genotype?
                          </Label>
                          <Input id="affected-relatives" type="number" placeholder="Enter number" className="w-40" />
                        </div>

                        <div className="flex items-center gap-4">
                          <Label htmlFor="unaffected-relatives" className="flex-1 text-sm">
                            Number of unaffected relatives without the monoallelic genotype?
                          </Label>
                          <Input id="unaffected-relatives" type="number" placeholder="Enter number" className="w-40" />
                        </div>

                        <div className="flex items-center gap-4">
                          <Label htmlFor="matched-relatives" className="flex-1 text-sm">
                            Number of unaffected relatives with the monoallelic genotype where the age-matched penetrance of
                            the MDE is near 100%
                          </Label>
                          <Input id="matched-relatives" type="number" placeholder="Enter number" className="w-40" />
                        </div>

                        {/* Comments */}
                        <div className="space-y-2 pt-4">
                          <Label htmlFor="segregation-comments" className="text-sm font-semibold">
                            Comments
                          </Label>
                          <Textarea
                            id="segregation-comments"
                            placeholder="Enter comments about co-segregation of variant"
                            rows={3}
                            className="max-w-lg"
                          />
                        </div>

                        {/* Section Completed */}
                        <div className="flex items-center justify-end gap-2 pt-4">
                          <Checkbox id="section3-complete" />
                          <Label htmlFor="section3-complete" className="text-sm font-semibold">
                            Section completed
                          </Label>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                <div className="border-t border-gray-200 bg-white px-6 py-4 flex items-center justify-end">
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsModalOpen(false)}>
                      Submit Form
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* de novo Status Modal */}
          {isDeNovoModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg w-full max-w-2xl border-2 border-gray-900">
                {/* Modal Header */}
                <div className="border-b border-gray-300 px-6 py-4">
                  <h2 className="text-2xl font-semibold text-gray-900">de novo status</h2>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* de novo status field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        de novo status
                        <span className="text-red-500">*</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full bg-blue-500 hover:bg-blue-600 p-0"
                        >
                          <Info className="h-3 w-3 text-white" />
                        </Button>
                      </label>
                      <Select value={tempDeNovoStatus} onValueChange={setTempDeNovoStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Parental confirmation field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        Parental confirmation
                        <span className="text-red-500">*</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full bg-blue-500 hover:bg-blue-600 p-0"
                        >
                          <Info className="h-3 w-3 text-white" />
                        </Button>
                      </label>
                      <Select value={tempParentalConfirmation} onValueChange={setTempParentalConfirmation}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="assumed">Assumed</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setIsDeNovoModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleDeNovoSave}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Variant in Trans Modal */}
          {isVariantInTransModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg w-full max-w-3xl border-2 border-gray-900">
                {/* Modal Header */}
                <div className="border-b border-gray-300 px-6 py-4">
                  <h2 className="text-2xl font-semibold text-gray-900">Variant in trans</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Variant in trans should be used when the proband is a compound heterozygote and there is not a concern
                    about another variant of interest
                  </p>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Variant ID field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        Variant ID (ClinGen/Allele Registry)
                        <span className="text-red-500">*</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full bg-blue-500 hover:bg-blue-600 p-0"
                        >
                          <Info className="h-3 w-3 text-white" />
                        </Button>
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter ID"
                          value={tempVariantId}
                          onChange={(e) => setTempVariantId(e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="outline" className="whitespace-nowrap bg-transparent">
                          Get variant info
                        </Button>
                      </div>
                    </div>

                    {/* Variant classification field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        Variant classification
                        <span className="text-red-500">*</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full bg-blue-500 hover:bg-blue-600 p-0"
                        >
                          <Info className="h-3 w-3 text-white" />
                        </Button>
                      </label>
                      <Select value={tempVariantClassification} onValueChange={setTempVariantClassification}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pathogenic">Pathogenic</SelectItem>
                          <SelectItem value="likely-pathogenic">Likely Pathogenic</SelectItem>
                          <SelectItem value="uncertain-significance">Uncertain Significance</SelectItem>
                          <SelectItem value="likely-benign">Likely Benign</SelectItem>
                          <SelectItem value="benign">Benign</SelectItem>
                          <SelectItem value="not-classified">Not classified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Phase status field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        Phase status
                        <span className="text-red-500">*</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full bg-blue-500 hover:bg-blue-600 p-0"
                        >
                          <Info className="h-3 w-3 text-white" />
                        </Button>
                      </label>
                      <Select value={tempPhaseStatus} onValueChange={setTempPhaseStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed-in-trans">Confirmed in trans</SelectItem>
                          <SelectItem value="assumed-in-trans">Assumed in trans</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setIsVariantInTransModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleVariantInTransSave}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default Clinical;
