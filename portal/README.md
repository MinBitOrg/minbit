# MinBit Portal

The stack configurator of [MinBit](../README.md), kept in the monorepo under `portal/`.

## Develop

Requires Node.js 22 and npm.

```sh
cd portal
npm ci          # install exactly what package-lock.json pins
npm run dev     # dev server on http://localhost:8080
```

## Check

These are the same commands CI runs (see [docs/ci.md](../docs/ci.md)):

```sh
npm run lint    # ESLint: errors fail CI, warnings do not
npm test        # Vitest
npm run build   # production build into dist/
```

## Stack

Vite, TypeScript, React, shadcn-ui and Tailwind CSS.
