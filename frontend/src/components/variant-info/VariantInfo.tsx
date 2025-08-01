const VariantInfo = () => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4 tracking-tight">Variant Information</h2>
      <div className="space-y-3">
        <div className="font-medium">NM_000546.6(TP53):c.215C&gt;G</div>

        <div className="grid grid-cols-[120px_1fr] gap-y-2">
          <div className="font-medium">Protein:</div>
          <div>p.Pro72Arg</div>

          <div className="font-medium">ClinVar ID:</div>
          <div>
            <a href="#" className="text-blue-600 hover:underline">
              12351
            </a>
          </div>

          <div className="font-medium">Allele Registry:</div>
          <div>
            <a href="#" className="text-blue-600 hover:underline">
              CA000072
            </a>
          </div>

          <div className="font-medium">Coordinates:</div>
          <div>GRCh38 chr17:7676154 C&gt;G</div>

          <div className="font-medium">UCSC:</div>
          <div>
            <a href="#" className="text-blue-600 hover:underline">
              GRCh38
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VariantInfo;