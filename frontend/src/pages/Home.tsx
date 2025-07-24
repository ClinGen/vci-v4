export default function Home() {
  return (
    <div className="bg-gray-50 py-8 px-4">
      <section className="max-w-5xl mx-auto">
        {/* Main Title & Announcement */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">ClinGen Variant Curation</h1>
          <p className="text-lg text-gray-700 max-w-2xl mb-2">
            Variant Curation is available for public use. To register, create an account via "Login", and then contact our VCI helpdesk at <a href="mailto:vci@clinicalgenome.org" className="text-blue-700 underline">vci@clinicalgenome.org</a>.

          </p>
          <button className="mt-2 px-4 py-2 bg-gray-200 rounded shadow hover:bg-gray-300 text-gray-800">Demo version...</button>
        </div>
        {/* Announcement Card */}
        <div className="mb-8 max-w-xl">
          <div className="bg-green-100 border border-green-300 rounded-lg px-4 py-3">
            <span className="block font-semibold text-green-800 mb-1">VCI v4 now in active development!</span>
          </div>
        </div>
        {/* Two Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Variant Curation */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Variant Curation</h2>
            <p className="mb-2 text-gray-700">Which changes in the gene cause disease?</p>
            <p className="mb-2 text-gray-600 text-sm">
              The ClinGen variant curation process combines clinical, genetic, population, and functional evidence with expert review to classify variants into 1 of 5 categories according to the <a href="https://www.acmg.net/" target="_blank" rel="noopener" className="text-blue-700 underline">ACMG guidelines</a>.
            </p>
            <p className="mb-2 font-semibold text-gray-700">Pathogenic • Likely Pathogenic • Uncertain • Likely Benign • Benign</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Learn more</button>
          </div>
        </div>
        {/* Bottom Description */}
        <div className="text-center text-gray-600 text-sm mt-10 max-w-4xl mx-auto">
          ClinGen is a National Institutes of Health (NIH)-funded resource dedicated to building an authoritative central resource that defines the clinical relevance of genes and variants for use in precision medicine and research. One of the key goals of ClinGen is to implement an evidence-based consensus for curating genes and variants. For more information on the ClinGen resource, please visit the ClinGen portal at <a href="https://clinicalgenome.org/" className="text-blue-700 underline" target="_blank" rel="noopener">clinicalgenome.org</a>.
        </div>
      </section>
    </div>
  );
}
