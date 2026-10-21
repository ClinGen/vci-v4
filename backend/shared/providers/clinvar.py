import os

from shared.providers.base import get_json

CLINVAR_BASE = os.getenv(
  "CLINVAR_API_BASE", 
  "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=clinvar&rettype=vcv&is_variationid&from_esearch=true&id="
)

def fetch_variant(clinvar_id):
  return get_json(f"{CLINVAR_BASE}{clinvar_id}")