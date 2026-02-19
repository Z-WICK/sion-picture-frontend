# Sion Picture Frontend Development Guidelines

## Project Overview

**Name**: sion-picture-frontend
**Type**: Vue 3 SPA (Single Page Application) — 图片管理平台前端
**Stack**: Vue 3 + TypeScript + Vite 6 + Ant Design Vue 4 + Pinia
**Backend API**: RESTful API at `http://localhost:8123` (OpenAPI/Swagger)

## Technology Stack

- **Language**: TypeScript ~5.6
- **Framework**: Vue 3.5 (Composition API + `<script setup>`)
- **Build Tool**: Vite 6
- **UI Library**: Ant Design Vue 4.2
- **State Management**: Pinia 2.2
- **Router**: Vue Router 4.4
- **HTTP Client**: Axios 1.7 (wrapped in `src/request.ts`)
- **Charts**: ECharts 5.6 + vue-echarts 7
- **Image Editing**: vue-cropper 1.1, vue3-colorpicker 2.3
- **API Code Generation**: @umijs/openapi (from backend Swagger)
- **Linting**: ESLint 9 + eslint-plugin-vue + Prettier
- **Type Checking**: vue-tsc

## Project Structure

```text
src/
├── access.ts              # Route guards (auth/permission)
├── App.vue                # Root component
├── main.ts                # App entry point
├── request.ts             # Axios instance & interceptors
├── api/                   # Auto-generated API clients (@umijs/openapi)
│   ├── typings.d.ts       # API type definitions
│   ├── index.ts           # API exports
│   ├── userController.ts
│   ├── pictureController.ts
│   ├── spaceController.ts
│   ├── spaceUserController.ts
│   ├── spaceAnalyzeController.ts
│   ├── fileController.ts
│   └── mainController.ts
├── assets/                # Static assets
├── components/            # Shared components
│   ├── analyze/           # Analytics chart components
│   ├── icons/             # Icon components
│   ├── GlobalHeader.vue
│   ├── GlobalSider.vue
│   ├── PictureList.vue
│   ├── PictureSearchForm.vue
│   ├── PictureUpload.vue
│   ├── ImageCropper.vue
│   ├── ImageOutPainting.vue
│   ├── BatchEditPictureModal.vue
│   ├── ShareModal.vue
│   └── UrlPictureUpload.vue
├── constants/             # Constants & enums
│   ├── picture.ts
│   └── space.ts
├── layouts/               # Layout components
│   └── BasicLayout.vue
├── pages/                 # Page components (by feature domain)
│   ├── HomePage.vue
│   ├── admin/             # Admin pages (user/picture/space manage)
│   ├── picture/           # Picture pages (add/detail/search/batch)
│   ├── space/             # Space pages (add/my/detail/analyze)
│   └── user/              # User pages (login/register)
├── router/                # Vue Router config
│   └── index.ts
├── stores/                # Pinia stores
│   ├── counter.ts
│   └── useLoginUserStore.ts
├── utils/                 # Utility modules
│   ├── index.ts
│   └── pictureEditWebSocket.ts
└── views/                 # Legacy views
    ├── AboutView.vue
    └── HomeView.vue
```

## Commands

```bash
# Development
npm run dev              # Start Vite dev server

# Build
npm run build            # Type check + build (production)
npm run pure-build       # Build only (skip type check)
npm run build-only       # Vite build only

# Code Quality
npm run lint             # ESLint with auto-fix
npm run format           # Prettier format src/
npm run type-check       # vue-tsc type checking

# API Generation
npm run openapi          # Regenerate API clients from backend Swagger

# Preview
npm run preview          # Preview production build
```

## Code Style & Conventions

- Use Composition API with `<script setup lang="ts">` exclusively
- Use Ant Design Vue components — do NOT introduce alternative UI libraries
- API layer is auto-generated via `@umijs/openapi` — do NOT manually edit `src/api/` files
- HTTP requests go through the shared Axios instance at `src/request.ts`
- State management uses Pinia composable stores (`defineStore` with setup syntax)
- Route guards and permission checks live in `src/access.ts`
- Chinese route names are used for display; English paths for URLs
- Constants are organized by domain in `src/constants/`
- WebSocket utilities live in `src/utils/`

## Important Notes

- Backend API base URL: `http://localhost:8123` (configured in `src/request.ts`)
- Authentication: cookie-based (`withCredentials: true`), 40100 code = not logged in
- Admin routes (`/admin/*`) require `userRole === "admin"`
- The `src/api/` directory is auto-generated — manual edits will be overwritten by `npm run openapi`
- No test framework is currently configured (no Jest/Vitest)
