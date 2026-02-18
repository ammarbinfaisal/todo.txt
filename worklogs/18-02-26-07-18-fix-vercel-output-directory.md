# Fix Vercel expecting `public` output directory

**Agent**: GPT-5.2 (Codex CLI)
**Session**: 18-02-26 07:18 - 07:25 (approx)

## What was done
- Updated `vercel.json` to explicitly set the framework preset to Next.js so Vercel doesn’t treat the project as a generic static build expecting `public/`.
- Re-verified `bun run lint`, `bun run test`, and `bun run build` locally.

## Files changed
- `vercel.json` - Added `$schema` and `framework: "nextjs"`.

## Decisions made
- Forced `framework: "nextjs"` to avoid Vercel auto-detect / dashboard overrides causing `outputDirectory` mismatches.

## Issues encountered
- None.

## Next steps
- Trigger a redeploy in Vercel and confirm the deployment is using the Next.js preset.

