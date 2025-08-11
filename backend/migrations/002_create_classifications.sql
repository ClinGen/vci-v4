CREATE TABLE IF NOT EXISTS classifications (
  id SERIAL PRIMARY KEY,
  variant_id INTEGER NOT NULL REFERENCES variants(id) ON DELETE CASCADE,

  disease TEXT NOT NULL,                  -- or INT FK to diseases(id)
  moi TEXT NOT NULL,                      -- e.g., 'AD', 'AR'
  method TEXT NOT NULL,                   -- e.g., 'SPEC01' (or FK)

  daf_threshold NUMERIC(6,4),             -- e.g., 0.1
  calc_score NUMERIC(6,2),                -- e.g., 16.5
  final_score NUMERIC(6,2),

  classification TEXT,                    -- 'Pathogenic','Likely pathogenic', etc. (You can convert to ENUM later)

  selected_trx TEXT,                      -- e.g., 'trx002'
  select_trx_nmd_boundary TEXT,           -- e .g., 'c.600'

  -- region lists (pick a representation; arrays are simplest to start)
  alt_inframe_start TEXT[],               -- e.g., ['c.40','c.100','c.200']
  critical_region_list TEXT[],            -- or use int4range[] if you prefer ranges

  transcript_protein_size INTEGER,        -- e.g., 1000

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT classification_nat_uk UNIQUE (variant_id, disease, moi, method)
);

DROP TRIGGER IF EXISTS trg_classifications_updated ON classifications;
CREATE TRIGGER trg_classifications_updated
BEFORE UPDATE ON classifications
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
