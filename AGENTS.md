# AGENTS.md

## Stack
- NestJS v11, TypeScript, pnpm 10
- Jest for tests, ts-jest transform
- ESLint + Prettier (singleQuote, trailingComma: all)

## Commands
- `pnpm install` — install deps
- `pnpm run start:dev` — watch mode dev server (port 3000 or PORT env)
- `pnpm run build` — nest build → `dist/`
- `pnpm run test` — unit tests (src/**/*.spec.ts)
- `pnpm run test:e2e` — e2e tests (test/**/*.e2e-spec.ts, separate jest config)
- `pnpm run lint` — eslint with --fix
- `pnpm run format` — prettier write

## Structure
- Single package, source in `src/`, entrypoint `src/main.ts`
- App module: `src/app.module.ts`, standard NestJS layout (controller, service)
- e2e tests in `test/`, unit specs colocated with source

## TypeScript quirks
- `noImplicitAny: false` — explicit `any` allowed without error
- Decorators enabled (emitDecoratorMetadata, experimentalDecorators)
- Target ES2023, CommonJS modules, output to `dist/`

## Jest config
- Unit: inline in package.json, rootDir `src`, coverage to `../coverage`
- e2e: `test/jest-e2e.json`, rootDir `test`
