CREATE TABLE IF NOT EXISTS kriterienkataloge (
  id BIGSERIAL PRIMARY KEY,
  ausschreibung_id BIGINT NOT NULL REFERENCES ausschreibungen(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS kriterienkataloge_ausschreibung_id_position_id_idx
  ON kriterienkataloge (ausschreibung_id, position, id);

ALTER TABLE abschnitte
  ADD COLUMN IF NOT EXISTS kriterienkatalog_id BIGINT REFERENCES kriterienkataloge(id) ON DELETE CASCADE;

WITH created_catalogs AS (
  INSERT INTO kriterienkataloge (ausschreibung_id, name, position)
  SELECT a.id, 'Kriterienkatalog A', 1
  FROM ausschreibungen a
  WHERE NOT EXISTS (
    SELECT 1
    FROM kriterienkataloge k
    WHERE k.ausschreibung_id = a.id
  )
  RETURNING id, ausschreibung_id
)
UPDATE abschnitte s
SET kriterienkatalog_id = c.id
FROM created_catalogs c
WHERE s.ausschreibung_id = c.ausschreibung_id
  AND s.kriterienkatalog_id IS NULL;

WITH first_catalog_per_tender AS (
  SELECT DISTINCT ON (k.ausschreibung_id) k.ausschreibung_id, k.id
  FROM kriterienkataloge k
  ORDER BY k.ausschreibung_id, k.position ASC, k.id ASC
)
UPDATE abschnitte s
SET kriterienkatalog_id = f.id
FROM first_catalog_per_tender f
WHERE s.ausschreibung_id = f.ausschreibung_id
  AND s.kriterienkatalog_id IS NULL;
