import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ucscLinkForGenomicHgvs, ensemblLinkForGenomicHgvs, ncbiVariationViewerLinkForGenomicHgvs } from "../../lib/genomeBrowserLinks";

const VariantInfo = () => {
  const [collapsed, setCollapsed] = useState(false);

  const variantHgvs = "NM_000546.6(TP53):c.215C>G";
  const displayProteinChange = "p.Pro72Arg";
  const displayClinvarId = "12351";
  const displayClinvarUrl = "https://www.ncbi.nlm.nih.gov/clinvar/variation/12351/";
  const displayCaid = "CA000072";
  const displayArUrl = "https://reg.clinicalgenome.org/redmine/projects/registry/genboree_registry/by_canonicalid?canonicalid=CA000072";
  const displayRsid = "rs1042522";
  const displayDbsnpUrl = "https://www.ncbi.nlm.nih.gov/snp/rs1042522";
  const displayGenomic38 = "NC_000017.11:g.7676154C>G";
  const displayGenomic37 = "NC_000017.10:g.7579472C>G";

  const ucscHg38 = ucscLinkForGenomicHgvs(displayGenomic38, "GRCh38");
  const ucscHg19 = ucscLinkForGenomicHgvs(displayGenomic37, "GRCh37");
  const ensemblHg38 = ensemblLinkForGenomicHgvs(displayGenomic38, "GRCh38");
  const ensemblHg19 = ensemblLinkForGenomicHgvs(displayGenomic37, "GRCh37");
  const ncbiHg38 = ncbiVariationViewerLinkForGenomicHgvs(displayGenomic38, "GRCh38");
  const ncbiHg19 = ncbiVariationViewerLinkForGenomicHgvs(displayGenomic37, "GRCh37");

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between mb-3 text-left"
      >
        <h2 className="font-serif text-base font-bold text-gray-900">Variant Information</h2>
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-400 flex-none" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 flex-none" />
        )}
      </button>
      {!collapsed && (
        <div className="space-y-3 text-xs">
          <div className="font-medium text-gray-900">{variantHgvs}</div>
          <div className="flex justify-between">
            <span className="text-gray-700">Protein:</span>
            <span>{displayProteinChange}</span>
          </div>
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-gray-700 flex-none">ClinVar ID:</span>
            <a href={displayClinvarUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
              {displayClinvarId}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Allele Registry:</span>
            <a href={displayArUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
              {displayCaid}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">dbSNP:</span>
            <a href={displayDbsnpUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
              {displayRsid}
            </a>
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between">
              <span className="text-gray-700">GRCh38:</span>
              <span className="font-mono text-xs">{displayGenomic38}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">GRCh37:</span>
              <span className="font-mono text-xs">{displayGenomic37}</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="flex justify-between">
              <span className="text-gray-700">UCSC:</span>
              <span className="flex items-center gap-1.5">
                {ucscHg38 ? <a href={ucscHg38} target="_blank" rel="noopener noreferrer" className="text-blue-600">hg38</a> : <span className="text-gray-400">hg38</span>}
                <span className="text-gray-400">|</span>
                {ucscHg19 ? <a href={ucscHg19} target="_blank" rel="noopener noreferrer" className="text-blue-600">hg19</a> : <span className="text-gray-400">hg19</span>}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Ensembl:</span>
              <span className="flex items-center gap-1.5">
                {ensemblHg38 ? <a href={ensemblHg38} target="_blank" rel="noopener noreferrer" className="text-blue-600">GRCh38</a> : <span className="text-gray-400">GRCh38</span>}
                <span className="text-gray-400">|</span>
                {ensemblHg19 ? <a href={ensemblHg19} target="_blank" rel="noopener noreferrer" className="text-blue-600">GRCh37</a> : <span className="text-gray-400">GRCh37</span>}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">NCBI:</span>
              <span className="flex items-center gap-1.5">
                {ncbiHg38 ? <a href={ncbiHg38} target="_blank" rel="noopener noreferrer" className="text-blue-600">GRCh38</a> : <span className="text-gray-400">GRCh38</span>}
                <span className="text-gray-400">|</span>
                {ncbiHg19 ? <a href={ncbiHg19} target="_blank" rel="noopener noreferrer" className="text-blue-600">GRCh37</a> : <span className="text-gray-400">GRCh37</span>}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VariantInfo;
