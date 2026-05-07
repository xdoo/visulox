ALTER TABLE kriterienkataloge
  ADD COLUMN IF NOT EXISTS catalog_type TEXT NOT NULL DEFAULT 'draft';

WITH first_catalog_per_tender AS (
  SELECT DISTINCT ON (ausschreibung_id) id
  FROM kriterienkataloge
  ORDER BY ausschreibung_id, position ASC, id ASC
)
UPDATE kriterienkataloge k
SET catalog_type = 'main'
FROM first_catalog_per_tender f
WHERE k.id = f.id
  AND k.catalog_type = 'draft';
