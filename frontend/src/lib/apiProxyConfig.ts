// Shared client-side config for routing outbound API calls through the
// generic CORS proxy (see /proxy in the project root for the deployable
// server-side code) instead of hitting the upstream APIs directly.
//
// Set PROXY_BASE_URL to your deployed proxy's URL once you have one
// (e.g. "https://your-project.vercel.app/api/proxy"). Leave it empty to
// call the upstream APIs directly from the browser -- works for sources
// that don't need it (gnomAD, Ensembl VEP both responded directly with
// no CORS issue), and fails with the "couldn't reach" error for sources
// that do (confirmed so far: the ClinGen Allele Registry).

const PROXY_BASE_URL: string =
  import.meta.env.VITE_PROXY_BASE_URL ||
  "https://clingen-vci-prototype-proxy.markmand.workers.dev";

// Wraps a target URL so it goes through the proxy if one's configured,
// or is called directly otherwise. Every client file's fetch() calls
// should pass their target URL through this before fetching.
export function viaProxy(targetUrl: string): string {
  if (!PROXY_BASE_URL) return targetUrl;
  return `${PROXY_BASE_URL}?url=${encodeURIComponent(targetUrl)}`;
}
