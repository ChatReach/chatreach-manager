# chatreach-manager

A Next.js application with shadcn/ui. All source lives under `src/`.

## Development

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm ssldev     # https://chatreach.test:3001 (uses local certs)
```

## Adding components

```bash
pnpm dlx shadcn@latest add button
```

This places the UI components in `src/components/ui`.

## Using components

```tsx
import { Button } from "@/components/ui/button";
```

## Scripts

- `pnpm dev` / `pnpm ssldev` — dev server (HTTP / HTTPS)
- `pnpm build` — production build
- `pnpm start` — serve the production build
- `pnpm lint` — ESLint
- `pnpm typecheck` — TypeScript check
- `pnpm format` — Prettier
