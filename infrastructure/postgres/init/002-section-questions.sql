CREATE TABLE IF NOT EXISTS abschnittsfragen (
  id BIGSERIAL PRIMARY KEY,
  abschnitt_id BIGINT NOT NULL REFERENCES abschnitte(id) ON DELETE CASCADE,
  nr TEXT NOT NULL,
  frage TEXT NOT NULL,
  punkte NUMERIC(12, 4) NOT NULL,
  anteil NUMERIC(12, 6) NOT NULL,
  gewichtete_punkte NUMERIC(12, 4) NOT NULL
);
