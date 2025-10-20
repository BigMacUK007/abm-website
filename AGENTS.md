# Repository Guidelines

This AstroWind-derived site powers the ABM Prospector marketing presence. Follow the steps below to keep pages fast, accessible, and easy to maintain.

## Project Structure & Module Organization
- `src/pages/` hosts route files (`.astro`, `.md`, `.mdx`); blog routes live in `src/pages/[...blog]/`.
- `src/components/` contains UI, widget, and layout pieces reused across pages; prefer composing new views here.
- `src/content/post/` stores MD/MDX articles registered via `src/content/config.ts`.
- `src/assets/` holds Tailwind styles, images, and favicon sources; unprocessed static files stay in `public/`.
- Configuration lives in `astro.config.ts`, `tailwind.config.js`, and `src/config.yaml`; update all when introducing new sections or branding changes.

## Build, Test, and Development Commands
- `npm install` – install dependencies for Astro, Tailwind, and linting.
- `npm run dev` – start the dev server at `http://localhost:4321` with hot reload.
- `npm run build` – produce the optimized site in `./dist/` for deployment.
- `npm run preview` – serve the `dist` build locally to validate before releasing.
- `npm run check` – run Astro diagnostics, ESLint, and Prettier validation.
- `npm run fix` – auto-fix lint and formatting problems; review diffs before committing.

## Coding Style & Naming Conventions
Use Prettier (configured via `eslint.config.js` and Prettier plugins) to keep two-space indentation and single quotes. Name components in PascalCase (`HeroBanner.astro`), page folders in kebab-case, and content slugs in lowercase-kebab (`case-study-ai.mdx`). Favor typed imports and explicit exports in `.ts` utilities under `src/utils/`. Tailwind classes should be grouped logically (layout → spacing → color) to ease review.

## Testing Guidelines
The repo currently relies on static analysis. Run `npm run check` and resolve every issue before PRs. When modifying MD/MDX content, ensure frontmatter matches the schema in `src/content/config.ts`. For visual changes, capture a Lighthouse run or screenshots from `npm run preview` to document regressions.

## Commit & Pull Request Guidelines
Follow the existing imperative style (`Add ABM Prospector website content and branding`). Keep messages under 75 characters and elaborate in the body if needed. PRs should describe the goal, link related issues or tickets, list key changes, and attach before/after screenshots for UI updates. Confirm CI checks or local `npm run build` results in the PR description to speed up reviews.
