CREATE TABLE IF NOT EXISTS variants (
  id SERIAL PRIMARY KEY,
  variant TEXT NOT NULL,
  gene TEXT NOT NULL,
  affiliation TEXT NOT NULL,

  preferred_title TEXT,
  car_id TEXT,
  transcripts TEXT[] DEFAULT '{}',          -- e.g. ['trx001..c:400','trx002..c:600']
  clinvar_info JSONB,                        -- free-form JSON for CV ids, accessions, etc.

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT variants_uk UNIQUE (variant, gene, affiliation)
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_variants_updated ON variants;
CREATE TRIGGER trg_variants_updated
BEFORE UPDATE ON variants
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
