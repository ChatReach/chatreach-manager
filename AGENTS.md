<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## What this app is

The internal, staff-facing admin panel for managing ChatReach tenants/customers — not the
customer-facing product (that's `chatreach-next`). See [`../../AGENTS.md`](../../AGENTS.md) for
how this fits with the sibling repos (`chatreach-api`, `chatreach-next`, `chatreach-reverb`,
`chatreach-shopify-extension`).

## Structure

- `src/app/(protected)/` and `src/app/(auth)/` — route groups for authenticated staff views vs.
  login.
- `src/api/` — `admin/`, `auth/`, `tenants/` client wrappers calling `chatreach-api`, plus
  `fetchClient.ts` / `cookies.ts`.
- `src/components/` — `sidebar`, `settings`, `auth`, `webhook-calls`, `common`, `layouts`, `ui`
  (shadcn primitives).
- `src/providers/UserContext.tsx`, `src/hooks`, `src/lib`, `src/constants`.

## Commands

- `pnpm dev` — dev server (port 3000 by default).
- `pnpm ssldev` — HTTPS dev on port 3001 (matches `MANAGER_URL=http://localhost:3001` in
  `chatreach-api`'s `.env.example`), using the same local cert pair as `chatreach-next`.
- `pnpm build` / `pnpm start`.
- `pnpm lint` (ESLint 9), `pnpm typecheck` (`tsc --noEmit`), `pnpm format` (Prettier + Tailwind
  plugin) — run these before considering a change done; `chatreach-next` doesn't have
  `typecheck`/`format` scripts, but this app does, so use them here.

## Conventions

- UI components: this project uses shadcn/ui — use the `shadcn` skill (installed under
  `.claude/skills/shadcn`) rather than hand-rolling component patterns from scratch.
- Real-time: `pusher-js` connects to `chatreach-reverb` (a separate Reverb app id from
  `chatreach-next`'s).
- This app can impersonate/reveal tenant data for support purposes (see `RevealGate`-style
  components) — treat any such code as security-sensitive and don't loosen its checks casually.

