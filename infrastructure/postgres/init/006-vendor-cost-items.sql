CREATE TABLE IF NOT EXISTS anbieter_kostenpositionen (
  id BIGSERIAL PRIMARY KEY,
  anbieter_id BIGINT NOT NULL REFERENCES anbieter(id) ON DELETE CASCADE,
  kostenblock_id BIGINT NOT NULL REFERENCES kostenbloecke(id) ON DELETE CASCADE,
  amount NUMERIC(14, 2),
  CONSTRAINT anbieter_kostenpositionen_anbieter_kostenblock_unique UNIQUE (anbieter_id, kostenblock_id)
);

CREATE INDEX IF NOT EXISTS anbieter_kostenpositionen_kostenblock_id_idx
  ON anbieter_kostenpositionen (kostenblock_id);

