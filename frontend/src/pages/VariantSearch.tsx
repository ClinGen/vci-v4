import { useState } from "react";

export default function VariantSearch() {
  const [clinvarId, setClinvarId] = useState("");
  const [variant, setVariant] = useState<object>({});
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setVariant({});

    try {
      const res = await fetch(
        `http://localhost:3001/variant?clinvar_id=${clinvarId}`
      );
      if (res.status === 404) {
        setError("Variant not found");
        return;
      }
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      setVariant(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError(`Error: ${String(err)}`);
      }
    }
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-xl font-bold mb-4">Variant Search</h1>
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
        <input
          className="input input-bordered flex-1 border px-2 py-1 rounded"
          type="text"
          placeholder="Enter ClinVar Variant ID"
          value={clinvarId}
          onChange={(e) => setClinvarId(e.target.value)}
        />
        <button type="submit" className="btn bg-blue-600 text-white px-3 py-1 rounded">Search</button>
      </form>
      {error && <div className="text-red-500">{error}</div>}
      {variant && (
        <pre className="bg-gray-100 rounded p-4 mt-4">
          {JSON.stringify(variant, null, 2)}
        </pre>
      )}
    </div>
  );
}
