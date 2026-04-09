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

The repository Compose setup initializes them from [001-ausschreibungen-schema.sql](/home/claus/Projekte/visulox/infrastructure/postgres/init/001-ausschreibungen-schema.sql) on the first container start.

If your Postgres container was already created before that init script existed, recreate the database volume or run the SQL manually, because `/docker-entrypoint-initdb.d` is only processed during initial database creation.

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
- `app/components/tender-create/*`: Step-specific form sections for the wizard.
- `app/composables/useTenderWizard.ts`: State and navigation logic for the tender workflow.
- `app/types/tender-wizard.ts`: Shared TypeScript contracts for the tender form data.
- `app/app.css`: Global theme variables and shared semantic utility classes.

## Styling Guidelines

The project uses Tailwind CSS v4 together with Nuxt UI v4. Theme tokens live in `app/app.css` and are exposed through semantic helper classes:

- `ui-bg-surface`
- `ui-bg-muted`
- `ui-border`
- `ui-text-muted`

Prefer those semantic classes over repeating raw color utilities inside components.
