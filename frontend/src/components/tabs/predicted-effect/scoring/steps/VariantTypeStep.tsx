import { Check } from "lucide-react";

const VariantTypeStep = () => {
  return (
    <>
      <h3 className="text-lg font-medium mb-4">
        Select Variant Type <span className="text-red-500">*</span>
      </h3>
      <div>
        <div className="relative">
          <div className="flex items-center justify-between border rounded-md p-2.5 bg-white">
            <div className="flex items-center">
              <span>Missense</span>
              <span className="ml-2 text-sm text-gray-500">(pre-filled from molC on transcript)</span>
            </div>
            <Check className="h-5 w-5 text-green-500" />
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          A missense variant results in a different amino acid at the affected position.
        </p>
      </div>
    </>
  );
}

export default VariantTypeStep;
