# Sion Picture Frontend Constitution

## Core Principles

### I. Composition API Only
All Vue components MUST use `<script setup lang="ts">`. Options API is prohibited. Composition API ensures type safety, better IDE support, and consistent code style across the project.

### II. Auto-Generated API Layer
The `src/api/` directory is auto-generated from backend Swagger via `@umijs/openapi`. NEVER manually edit files in `src/api/`. Run `npm run openapi` to regenerate after backend API changes.

### III. Single UI Library
Ant Design Vue is the sole UI component library. Do NOT introduce alternative UI libraries (Element Plus, Naive UI, etc.). Custom components should extend or compose Ant Design Vue components.

### IV. Type Safety
TypeScript strict mode is enforced via `vue-tsc`. All new code must pass `npm run type-check`. Avoid `any` type unless absolutely necessary and documented. API types come from `src/api/typings.d.ts`.

### V. Simplicity & YAGNI
Start with the simplest solution. Do not add abstractions, patterns, or dependencies unless the current complexity demands it. Every new dependency must justify its inclusion.

## Code Quality Standards

- ESLint + Prettier enforced: `npm run lint` must pass before merge
- Type checking: `npm run type-check` must pass before merge
- No console.log in production code (use conditional logging)
- Route guards and auth logic centralized in `src/access.ts`
- State management through Pinia stores only — no global mutable state

## Development Workflow

- Feature branches from `main`
- Build must succeed: `npm run build` (includes type-check)
- Lint must pass: `npm run lint`
- API changes: regenerate with `npm run openapi`, verify types
- No direct commits to `main`

## Governance

This constitution supersedes ad-hoc conventions. Amendments require documentation and team review. Use this file as the reference for all code review decisions.

**Version**: 1.0.0 | **Ratified**: 2026-02-18 | **Last Amended**: 2026-02-18
