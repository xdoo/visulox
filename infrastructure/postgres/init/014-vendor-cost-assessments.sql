ALTER TABLE anbieter
  ADD COLUMN IF NOT EXISTS project_cost_assessment TEXT;

ALTER TABLE anbieter
  ADD COLUMN IF NOT EXISTS run_cost_assessment TEXT;
