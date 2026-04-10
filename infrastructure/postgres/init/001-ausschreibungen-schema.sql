CREATE TABLE IF NOT EXISTS ausschreibungen (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ausschreibungen_created_at_id_idx
  ON ausschreibungen (created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS abschnitte (
  id BIGSERIAL PRIMARY KEY,
  ausschreibung_id BIGINT NOT NULL REFERENCES ausschreibungen(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS abschnitte_ausschreibung_id_id_idx
  ON abschnitte (ausschreibung_id, id);

CREATE TABLE IF NOT EXISTS kostenbloecke (
  id BIGSERIAL PRIMARY KEY,
  ausschreibung_id BIGINT NOT NULL REFERENCES ausschreibungen(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS kostenbloecke_ausschreibung_id_id_idx
  ON kostenbloecke (ausschreibung_id, id);

CREATE TABLE IF NOT EXISTS anbieter (
  id BIGSERIAL PRIMARY KEY,
  ausschreibung_id BIGINT NOT NULL REFERENCES ausschreibungen(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS anbieter_ausschreibung_id_id_idx
  ON anbieter (ausschreibung_id, id);
