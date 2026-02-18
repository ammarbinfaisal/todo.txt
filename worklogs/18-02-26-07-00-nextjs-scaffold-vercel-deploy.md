# Next.js scaffold for Vercel deploy

**Agent**: GPT-5.2 (Codex CLI)
**Session**: 18-02-26 07:00 - 07:15 (approx)

## What was done
- Added a minimal Next.js 16 App Router scaffold so Vercel can build and serve `/`.
- Configured Tailwind CSS 4 via PostCSS and added `app/globals.css`.
- Set up ESLint + Next rules using a flat `eslint.config.mjs` (since `next lint` is not available in Next 16 CLI).
- Added Vitest with a small smoke test and verified `build`, `lint`, and `test` pass locally.

## Files changed
- `package.json` - Added Next/React deps and standard scripts (`dev/build/start/lint/test`).
- `package-lock.json` - Dependency lockfile for reproducible installs.
- `next.config.ts` - Enabled `reactStrictMode` and set `turbopack.root`.
- `tsconfig.json` - TypeScript strict config compatible with Next App Router.
- `next-env.d.ts` - Next type references.
- `tailwind.config.ts` - Tailwind content globs for `app/` and `components/`.
- `postcss.config.mjs` - Tailwind PostCSS plugin config.
- `eslint.config.mjs` - Flat config using `eslint-config-next` presets.
- `.gitignore` - Ignored `.next`, `node_modules`, and common artifacts.
- `app/layout.tsx` - Root layout + basic metadata.
- `app/page.tsx` - Minimal root page placeholder for deploy verification.
- `app/globals.css` - Tailwind import.
- `vitest.config.ts` - Vitest config.
- `lib/smoke.test.ts` - Smoke test to ensure `npm run test` passes.

## Decisions made
- Used a minimal manual scaffold instead of `create-next-app` to avoid conflicts with an existing non-empty repo.
- Used `eslint-config-next` flat exports (`core-web-vitals` + `typescript`) after `next lint` was found to be unavailable in Next 16 CLI.

## Issues encountered
- `next lint` command not present in Next 16 CLI; switched `lint` script to `eslint` directly.
- ESLint config initially failed with circular JSON errors when attempting legacy/compat configs; resolved by using `eslint-config-next` flat exports.

## Next steps
- Implement `lib/todo-parser.ts` + serializer and add real unit tests.
- Add IndexedDB storage (`lib/db.ts`) and basic UI skeleton per `INSTRUCTIONS.md`.

