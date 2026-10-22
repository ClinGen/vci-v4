import { FieldRow } from "./Modal"

interface MolecularMechanismMatrixFieldProps {
  lofMechanism: string
  exonRelevance: string
  onLofMechanismChange: (value: string) => void
  onExonRelevanceChange: (value: string) => void
  lofMechanismLabel: Record<string, string>
  exonRelevanceLabel: Record<string, string>
  initialScore: number
  modifiedScore: number | null
  fraction: number | undefined
  matrixFractionFn: (row: string, col: string) => number
}

export function MolecularMechanismMatrixField({
  lofMechanism, exonRelevance, onLofMechanismChange, onExonRelevanceChange,
  lofMechanismLabel, exonRelevanceLabel, initialScore, modifiedScore, fraction, matrixFractionFn,
}: MolecularMechanismMatrixFieldProps) {
  return (
    <div className="border border-blue-200 rounded-md divide-y divide-blue-100 bg-white">
      <FieldRow label="Loss of Function Mechanism Classification" required empty={!lofMechanism}>
        <select className="w-full border rounded-md p-2 bg-white text-xs" value={lofMechanism} onChange={(e) => onLofMechanismChange(e.target.value)}>
          <option value="">Select...</option>
          {Object.entries(lofMechanismLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </FieldRow>
      <FieldRow label="Exon(s) containing VBC present in..." required empty={!exonRelevance}>
        <select className="w-full border rounded-md p-2 bg-white text-xs" value={exonRelevance} onChange={(e) => onExonRelevanceChange(e.target.value)}>
          <option value="">Select...</option>
          <option value="all">All clinically-relevant transcripts</option>
          <option value="most">Most clinically-relevant transcripts</option>
          <option value="few">Few clinically-relevant transcripts</option>
        </select>
      </FieldRow>
      {exonRelevance && lofMechanism && fraction !== undefined && (
        <div className="px-3 py-2 text-xs text-indigo-600">
          Fraction applied: {"×"}{fraction.toFixed(2)}
          {" "}({initialScore.toFixed(1)} {"×"} {fraction.toFixed(2)} = {modifiedScore !== null ? modifiedScore.toFixed(1) : "—"})
        </div>
      )}
      <details className="px-3 py-2">
        <summary className="text-xs text-blue-700 font-medium cursor-pointer">View Molecular Mechanism and Exon Relevance Matrix</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className="border border-gray-200 bg-gray-50 px-2 py-1"></th>
                {Object.entries(lofMechanismLabel).map(([key, label]) => <th key={key} className="border border-gray-200 bg-gray-50 px-2 py-1">{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {Object.entries(exonRelevanceLabel).map(([rowKey, rowLabel]) => (
                <tr key={rowKey}>
                  <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-left">{rowLabel}</th>
                  {Object.keys(lofMechanismLabel).map((colKey) => (
                    <td key={colKey} className="border border-gray-200 px-2 py-1 text-center font-mono text-gray-700">
                      {Math.round(matrixFractionFn(rowKey, colKey) * 100)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
