ALTER TABLE ausschreibung_settings
  ADD COLUMN IF NOT EXISTS consideration_years INTEGER NOT NULL DEFAULT 10;

