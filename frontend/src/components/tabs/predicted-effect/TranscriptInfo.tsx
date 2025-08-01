import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/Card";

const refSeqTranscripts = [
  {
    nucleotideChange: "NM_000546.6:c.215C>G (TP53)",
    exon: "4/11",
    proteinChange: "NP_000537.3:p.Pro72Arg",
    molecularConsequence: "missense_variant",
    maneSelect: true,
  },
  {
    nucleotideChange: "NM_001126112.3:c.215C>G (TP53)",
    exon: "4/11",
    proteinChange: "NP_001119.3:p.Pro72Arg",
    molecularConsequence: "missense_variant",
    maneSelect: false,
  },
];

const ensemblTranscripts = [
  {
    nucleotideChange: "ENST00000269305.8:c.215C>G (TP53)",
    exon: "4/11",
    proteinChange: "ENSP00000269305.4:p.Pro72Arg",
    molecularConsequence: "missense_variant",
    maneSelect: false,
  },
  {
    nucleotideChange: "ENST00000445888.6:c.215C>G (TP53)",
    exon: "4/11",
    proteinChange: "ENSP00000391127.2:p.Pro72Arg",
    molecularConsequence: "missense_variant",
    maneSelect: true,
  },
];

const TranscriptInfo = () => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="font-bold">Transcript Information</CardTitle>
        <CardDescription>RefSeq and Ensembl transcript details for this variant</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* RefSeq Transcripts */}
        <div>
          <h3 className="text-lg font-bold mb-3">RefSeq Transcripts</h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y">
                  <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Nucleotide Change</th>
                  <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Exon</th>
                  <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Protein Change</th>
                  <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Molecular Consequence</th>
                </tr>
              </thead>
              <tbody>
                {refSeqTranscripts.map((transcript, index) => (
                  <tr
                    key={index}
                    className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="p-3 font-mono">
                      {transcript.nucleotideChange}
                      {transcript.maneSelect && (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                          MANE Select
                        </span>
                      )}
                    </td>
                    <td className="p-3">{transcript.exon}</td>
                    <td className="p-3">{transcript.proteinChange}</td>
                    <td className="p-3">{transcript.molecularConsequence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ensembl Transcripts */}
        <div>
          <h3 className="text-lg font-bold mb-3">Ensembl Transcripts</h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y">
                  <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Nucleotide Change</th>
                  <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Exon</th>
                  <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Protein Change</th>
                  <th className="text-left p-3 text-gray-600 font-bold tracking-tight">Molecular Consequence</th>
                </tr>
              </thead>
              <tbody>
                {ensemblTranscripts.map((transcript, index) => (
                  <tr
                    key={index}
                    className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="p-3 font-mono">
                      {transcript.nucleotideChange}
                      {transcript.maneSelect && (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                          MANE Select
                        </span>
                      )}
                    </td>
                    <td className="p-3">{transcript.exon}</td>
                    <td className="p-3">{transcript.proteinChange}</td>
                    <td className="p-3">{transcript.molecularConsequence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TranscriptInfo;
