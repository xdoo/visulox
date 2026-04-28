# Visulox Nuxt App

This directory contains the Nuxt 4 frontend for Visulox. The current app shell provides a sidebar layout, a settings page, and a multi-step modal for creating tenders.

## Prerequisites

Install dependencies before running any local command:

```bash
npm install
```

For the save flow, `runtimeConfig.databaseUrl` defaults to the local PostgreSQL container from [infrastructure/docker-compose.yml](/home/claus/Projekte/visulox/infrastructure/docker-compose.yml):

```bash
postgresql://visulox:visulox@localhost:5432/visulox
```

If you want to override that value, configure the Nuxt runtime config through an environment variable that matches the runtime config key:

```bash
NUXT_DATABASE_URL=postgresql://visulox:visulox@localhost:5432/visulox
```

Restart the Nuxt dev server after changing your environment so the server runtime picks up the new value.

## Database Setup

The API expects these PostgreSQL tables to exist:

- `ausschreibungen`
- `abschnitte`
- `kostenbloecke`
- `anbieter`
- `abschnittsfragen`
- `ausschreibung_settings`
- `ausschreibung_chart_palette`
- `anbieter_kostenpositionen`

The repository Compose setup initializes them from [001-ausschreibungen-schema.sql](/home/claus/Projekte/visulox/infrastructure/postgres/init/001-ausschreibungen-schema.sql) on the first container start.

If your Postgres container was already created before that init script existed, recreate the database volume or run the SQL manually, because `/docker-entrypoint-initdb.d` is only processed during initial database creation.

Schema changes are kept as ordered SQL files under [infrastructure/postgres/init](/home/claus/Projekte/visulox/infrastructure/postgres/init). When adding a new column or table, create the next numbered file and keep it idempotent with `IF NOT EXISTS` where possible. For existing local databases, remember that new init scripts do not run automatically against an already-created Postgres volume; run the SQL manually or recreate the volume.

## Available Scripts

Run the development server on `http://localhost:3000`:

```bash
npm run dev
```

Lint the project:

```bash
npm run lint
```

Run the Nuxt type check:

```bash
npm run typecheck
```

Run the test suite:

```bash
npm run test
```

Build the application for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Git Workflow

Do not work directly on `main`.

Before making any code change, always create and switch to a new branch first:

```bash
git checkout -b <feature-branch-name>
```

Only after that should implementation work begin.

## Naming Convention

Use English for code artifacts and German for visible UI text.

This applies to:

- component names
- composable names
- type names
- file names
- folder names
- auto-imported component names

Use German for:

- labels
- button text
- headings
- helper text
- validation and error messages shown in the UI

Domain term mapping for code:

- `Ausschreibung` -> `Tender`
- `Abschnitt` -> `Section`
- `Anbieter` -> `Vendor`
- `Frage` -> `Question`
- `Kriterienkatalog` -> `Criteria`
- `Kostenblock` -> `CostBlock` or `PriceBlock`

Avoid mixed German/English names in code. Pick the English domain term and use it consistently.

Examples:

- `useAusschreibungDetail` -> `useTenderDetail`
- `AusschreibungVendorTabs` -> `TenderVendorTabs`
- `AusschreibungCriteriaSection` -> `TenderCriteriaSection`

## Project Structure

- `app/layouts/default.vue`: Main application shell with sidebar, header, breadcrumb, and modal trigger.
- `app/components/tender-create/Modal.vue`: Multi-step tender creation wizard.
- `app/components/tender/*`: Tender detail components for vendor tabs, sections, and CSV upload flows.
- `app/components/report/*`: Print/PDF-oriented report building blocks.
- `app/components/tender-create/*`: Step-specific form sections for the wizard.
- `app/composables/useTenderWizard.ts`: State and navigation logic for the tender workflow.
- `app/report-content/*.md`: Static Markdown report content imported with `?raw`.
- `app/utils/reportMarkdown.ts`: Restricted Markdown renderer used for PDF-safe report content.
- `app/types/tender-wizard.ts`: Shared TypeScript contracts for the tender form data.
- `app/app.css`: Global theme variables and shared semantic utility classes.

## Report Workflow

The PDF is generated from the dedicated report page, not from the interactive summary page:

- API endpoint: `server/api/tenders/[id]/report.pdf.get.ts`
- Render source: `app/pages/tenders/[id]/report.vue`
- Browser renderer: Playwright Chromium

The interactive `/tenders/:id/summary` page can link to the PDF download, but changes to that page do not affect the PDF unless they touch shared report/chart components or shared composables.

Report content currently combines:

- structured tender data loaded through `useTenderDetail`
- static Markdown files from `app/report-content`
- category-specific Markdown result assessments stored in `abschnitte.result_assessment`

For static report blocks, prefer Markdown files in `app/report-content` and render them with `ReportMarkdownBlock`. For tender-specific or category-specific text, persist it in Postgres and load it through `TenderDetail` or a focused API.

## Category Result Assessments

The category comparison overview supports a per-category JSON export and a separate result assessment editor:

- JSON export logic: `app/composables/useCategoryQuestionsJsonExport.ts`
- result assessment editor logic: `app/composables/useCategoryResultAssessmentEditor.ts`
- result assessment modal: `app/components/tender/CategoryResultAssessmentModal.vue`
- persistence endpoint: `server/api/sections/[id]/result-assessment.patch.ts`
- database column: `abschnitte.result_assessment`

The result assessment is separate from the general category description in `abschnitte.description`. Use `description` for structural/category context from settings. Use `result_assessment` for LLM-derived interpretation of the category results, rendered below the category chart in the PDF report.

## Styling Guidelines

The project uses Tailwind CSS v4 together with Nuxt UI v4. Theme tokens live in `app/app.css` and are exposed through semantic helper classes:

- `ui-bg-surface`
- `ui-bg-muted`
- `ui-border`
- `ui-text-muted`

Prefer those semantic classes over repeating raw color utilities inside components.
