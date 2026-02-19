# Chain Topology

Project-wide module dependency map and call chain patterns.
Auto-populated by `/speckit.init` and updated by pipeline impact analysis.

## Internal Modules

| Module | Path | Depends On | Depended By |
|--------|------|------------|-------------|
| API Layer | src/api/ | request.ts | pages/*, components/*, stores/* |
| Auth/Access | src/access.ts | stores/useLoginUserStore, router | App (global guard) |
| Router | src/router/index.ts | pages/* | access.ts, App.vue |
| Login Store | src/stores/useLoginUserStore.ts | api/userController | access.ts, App.vue, components/* |
| Request | src/request.ts | axios | api/* |
| Components | src/components/ | api/*, constants/*, utils/* | pages/* |
| Pages: Admin | src/pages/admin/ | api/*, components/* | router |
| Pages: Picture | src/pages/picture/ | api/*, components/*, utils/* | router |
| Pages: Space | src/pages/space/ | api/*, components/* | router |
| Pages: User | src/pages/user/ | api/* | router |
| Constants | src/constants/ | (none) | components/*, pages/* |
| Utils | src/utils/ | (none) | components/*, pages/* |
| Layouts | src/layouts/ | components/GlobalHeader, GlobalSider | App.vue |

## Call Chain Patterns

- User Action → Page Component → API Controller → Axios (request.ts) → Backend HTTP
- Route Navigation → access.ts guard → loginUserStore.fetchLoginUser → API → Backend
- WebSocket: PictureDetailPage → pictureEditWebSocket.ts → Backend WS

## SLA Budgets

<!-- Observed or target SLA data points -->
<!-- Format: Chain | P50 | P99 | Budget | Source -->

## External Dependencies

| Service | Protocol | Timeout | Fallback |
|---------|----------|---------|----------|
| Backend API | HTTP (Axios) | 60000ms | Error toast + redirect to login on 40100 |
| Backend WebSocket | WS | N/A | Reconnect logic in pictureEditWebSocket.ts |
