import os
import time
import json
import requests
from typing import Any, Optional

class ProviderError(Exception): ...
class NotFound(ProviderError): ...
class RateLimited(ProviderError): ...
class UpstreamFailure(ProviderError): ...

def get_json(url: str, *, params: Optional[dict]=None, headers: Optional[dict]=None, retries: int=1) -> Any:
  for i in range(retries + 1):
    try:
      r = requests.get(url, params=params or {}, headers=headers or {}, timeout=15)
      if r.status_code == 404: raise NotFound(url)
      if r.status_code == 429: raise RateLimited(url)
      r.raise_for_status()
      return r.json()
    except requests.RequestException as e:
      if i < retries:
        time.sleep(0.4 * (i + 1))
      else:
        raise UpstreamFailure(f"{url}: {e}") from e