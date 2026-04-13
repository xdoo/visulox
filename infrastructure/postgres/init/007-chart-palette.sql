CREATE TABLE IF NOT EXISTS ausschreibung_chart_palette (
  ausschreibung_id BIGINT NOT NULL REFERENCES ausschreibungen(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  fill_color TEXT NOT NULL,
  text_color TEXT NOT NULL DEFAULT '#FFFFFF',
  PRIMARY KEY (ausschreibung_id, position)
);

CREATE INDEX IF NOT EXISTS ausschreibung_chart_palette_ausschreibung_position_idx
  ON ausschreibung_chart_palette (ausschreibung_id, position);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ausschreibung_settings'
      AND column_name = 'chart_palette_text_colors'
  ) THEN
    INSERT INTO ausschreibung_chart_palette (ausschreibung_id, position, fill_color, text_color)
    SELECT
      s.ausschreibung_id,
      palette.idx - 1,
      palette.fill_color,
      COALESCE(s.chart_palette_text_colors[palette.idx], '#FFFFFF')
    FROM ausschreibung_settings s
    CROSS JOIN LATERAL unnest(s.chart_palette) WITH ORDINALITY AS palette(fill_color, idx)
    ON CONFLICT (ausschreibung_id, position) DO UPDATE
    SET fill_color = EXCLUDED.fill_color,
        text_color = EXCLUDED.text_color;
  ELSE
    INSERT INTO ausschreibung_chart_palette (ausschreibung_id, position, fill_color, text_color)
    SELECT
      s.ausschreibung_id,
      palette.idx - 1,
      palette.fill_color,
      '#FFFFFF'
    FROM ausschreibung_settings s
    CROSS JOIN LATERAL unnest(s.chart_palette) WITH ORDINALITY AS palette(fill_color, idx)
    ON CONFLICT (ausschreibung_id, position) DO UPDATE
    SET fill_color = EXCLUDED.fill_color,
        text_color = EXCLUDED.text_color;
  END IF;
END $$;
