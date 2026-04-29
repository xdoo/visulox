ALTER TABLE anbieter_kostenpositionen
  ADD COLUMN IF NOT EXISTS kommentar TEXT NOT NULL DEFAULT '';
