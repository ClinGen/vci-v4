import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "../../ui/Table";

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
    <Card tone="reference">
      <CardHeader>
        <CardTitle>Transcript Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* RefSeq Transcripts */}
        <div>
          <div className="text-xs font-semibold text-gray-700 mb-2">RefSeq Transcripts</div>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR className="bg-gray-50">
                  <TH>Nucleotide Change</TH>
                  <TH>Exon</TH>
                  <TH>Protein Change</TH>
                  <TH>Molecular Consequence</TH>
                </TR>
              </THead>
              <TBody>
                {refSeqTranscripts.map((transcript, index) => (
                  <TR key={index} className={`border-t hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <TD className="font-mono text-xs">
                      {transcript.nucleotideChange}
                      {transcript.maneSelect && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] rounded">
                          MANE Select
                        </span>
                      )}
                    </TD>
                    <TD className="text-xs">{transcript.exon}</TD>
                    <TD className="text-xs">{transcript.proteinChange}</TD>
                    <TD className="text-xs">{transcript.molecularConsequence}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </div>

        {/* Ensembl Transcripts */}
        <div>
          <div className="text-xs font-semibold text-gray-700 mb-2">Ensembl Transcripts</div>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR className="bg-gray-50">
                  <TH>Nucleotide Change</TH>
                  <TH>Exon</TH>
                  <TH>Protein Change</TH>
                  <TH>Molecular Consequence</TH>
                </TR>
              </THead>
              <TBody>
                {ensemblTranscripts.map((transcript, index) => (
                  <TR key={index} className={`border-t hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <TD className="font-mono text-xs">
                      {transcript.nucleotideChange}
                      {transcript.maneSelect && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] rounded">
                          MANE Select
                        </span>
                      )}
                    </TD>
                    <TD className="text-xs">{transcript.exon}</TD>
                    <TD className="text-xs">{transcript.proteinChange}</TD>
                    <TD className="text-xs">{transcript.molecularConsequence}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranscriptInfo;
