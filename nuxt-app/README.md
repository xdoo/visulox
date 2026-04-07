# Visulox Nuxt App

This directory contains the Nuxt 4 frontend for Visulox. The current app shell provides a sidebar layout, a settings page, and a multi-step modal for creating tenders.

## Prerequisites

Install dependencies before running any local command:

```bash
npm install
```

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

## Project Structure

- `app/layouts/default.vue`: Main application shell with sidebar, header, breadcrumb, and modal trigger.
- `app/components/NewTenderModal.vue`: Multi-step tender creation wizard.
- `app/components/new-tender/*`: Step-specific form sections for the wizard.
- `app/composables/useNewTender.ts`: State and navigation logic for the tender workflow.
- `app/types/new-tender.ts`: Shared TypeScript contracts for the tender form data.
- `app/app.css`: Global theme variables and shared semantic utility classes.

## Styling Guidelines

The project uses Tailwind CSS v4 together with Nuxt UI v4. Theme tokens live in `app/app.css` and are exposed through semantic helper classes:

- `ui-bg-surface`
- `ui-bg-muted`
- `ui-border`
- `ui-text-muted`

Prefer those semantic classes over repeating raw color utilities inside components.
