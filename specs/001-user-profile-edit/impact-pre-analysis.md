# Impact Pre-Analysis (Stage 3.5)

## Scope
- Type: PRE-IMPLEMENTATION (based on plan/spec only)
- Confidence: LOW (PLANNED)

## Potentially Touched Modules
1. `src/pages/user/` (新增 `UserProfilePage.vue`)
2. `src/router/index.ts` (新增路由)
3. `src/components/GlobalHeader.vue` (新增菜单入口)
4. `src/stores/useLoginUserStore.ts` (复用 `fetchLoginUser` 进行提交后同步)
5. `src/api/user.ts` (仅调用生成客户端，不手工改动)

## Cross-Module Call Chain (Planned)
- Header Dropdown → Router(`/user/profile`) → UserProfilePage
- UserProfilePage Submit → OpenAPI Client (`postUserEdit`) → Backend
- Submit Success → loginUserStore.fetchLoginUser → Header Re-render

## Schema / Data Compatibility
- 前端仅使用已存在的 `API.UserEditRequest` 与 `API.LoginUserVO` 字段。
- 无数据库迁移，无 schema 变更。

## SLA / Performance Risks
- [LOW] 保存后额外触发一次 `get/login` 请求用于状态刷新，会增加一次网络往返。
- [LOW] 若头像 URL 较大或不可访问，头像显示可能延迟（不影响保存主流程）。

## Risk Classification
- CRITICAL: 0
- HIGH: 0
- MEDIUM: 0
- LOW: 2

## Recommendations
- 保持提交按钮 loading，避免重复提交。
- 统一错误提示文案并保留用户输入。
