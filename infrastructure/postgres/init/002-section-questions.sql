CREATE TABLE IF NOT EXISTS abschnittsfragen (
  id BIGSERIAL PRIMARY KEY,
  abschnitt_id BIGINT NOT NULL REFERENCES abschnitte(id) ON DELETE CASCADE,
  anbieter_id BIGINT NOT NULL REFERENCES anbieter(id) ON DELETE CASCADE,
  nr TEXT NOT NULL,
  frage TEXT NOT NULL,
  punkte NUMERIC(12, 4) NOT NULL,
  anteil NUMERIC(12, 6) NOT NULL,
  gewichtete_punkte NUMERIC(12, 4) NOT NULL,
  CONSTRAINT abschnittsfragen_abschnitt_anbieter_nr_unique UNIQUE (abschnitt_id, anbieter_id, nr)
);

CREATE INDEX IF NOT EXISTS abschnittsfragen_anbieter_id_idx
  ON abschnittsfragen (anbieter_id);
