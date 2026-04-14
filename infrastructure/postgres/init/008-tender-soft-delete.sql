ALTER TABLE ausschreibungen
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS ausschreibungen_deleted_at_created_at_id_idx
  ON ausschreibungen (deleted_at, created_at DESC, id DESC);
