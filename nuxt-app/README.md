# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Theming & Design System

Dieses Projekt verwendet **Tailwind CSS v4** in Kombination mit **Nuxt UI v4**. Das Theming erfolgt zentral über CSS-Variablen und semantische Klassen.

### Globales Theme
Die zentralen Farbdefinitionen (Primärfarben, Graustufen) befinden sich in:
`nuxt-app/app/app.css`

Dort werden die Tailwind-Standardfarben auf CSS-Variablen gemappt, die von Nuxt UI Komponenten automatisch verwendet werden.

### Semantische CSS-Klassen
Um ein konsistentes Design über alle Komponenten hinweg zu gewährleisten, sollten bevorzugt die folgenden semantischen Klassen verwendet werden:

- `ui-bg-surface`: Standard-Hintergrund für Karten, Header und Inhaltsbereiche.
- `ui-bg-muted`: Dezenter Hintergrund für Sidebars oder inaktive Bereiche.
- `ui-border`: Standard-Rahmenfarbe für Trennlinien und Container.
- `ui-text-muted`: Farbe für weniger wichtige Texte oder Hilfsinformationen.

### Typsicherheit
Das Projekt ist vollständig in **TypeScript** geschrieben. Nutze für Komponenten-Props und Composables die entsprechenden Typen aus `@nuxt/ui` (z. B. `NavigationMenuItem`).

Ein Type-Check kann jederzeit durchgeführt werden:
```bash
npm run typecheck
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```
