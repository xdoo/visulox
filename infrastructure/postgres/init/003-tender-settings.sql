CREATE TABLE IF NOT EXISTS ausschreibung_settings (
  ausschreibung_id BIGINT PRIMARY KEY REFERENCES ausschreibungen(id) ON DELETE CASCADE,
  score_min INTEGER NOT NULL DEFAULT 0,
  score_max INTEGER NOT NULL DEFAULT 10,
  chart_palette TEXT[] NOT NULL DEFAULT ARRAY[
    '#0D57A6', '#B47D00',
    '#083B73', '#7A5500',
    '#6C9FCB', '#D2B36A',
    '#5F7F9E', '#9E8A5F',
    '#6F7A53', '#AAB38A',
    '#4A4A4A', '#BDBDBD'
  ]::TEXT[]
);
