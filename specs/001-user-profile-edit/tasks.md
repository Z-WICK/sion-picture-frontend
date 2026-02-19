# Tasks: 用户信息编辑

**Input**: `specs/001-user-profile-edit/` 下的设计文档
**Prerequisites**: plan.md, spec.md, research.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 [US1] 执行 `npm run openapi` 同步客户端，确认用户更新接口存在（`src/api/user.ts`）

## Phase 2: Foundational (Blocking)

- [x] T002 [US1] 新增个人信息页骨架 `src/pages/user/UserProfilePage.vue`
- [x] T003 [US1] 在路由中注册 `/user/profile` 页面 `src/router/index.ts`

## Phase 3: User Story 1 - 编辑个人资料 (P1)

- [x] T004 [US1] 在 `src/pages/user/UserProfilePage.vue` 实现表单字段与校验（昵称必填）
- [x] T005 [US1] 在 `src/pages/user/UserProfilePage.vue` 接入 OpenAPI 生成客户端提交更新
- [x] T006 [US1] 在 `src/pages/user/UserProfilePage.vue` 提交成功后刷新登录态并处理提示/异常

## Phase 4: User Story 2 - 更新后全局信息一致 (P2)

- [x] T007 [US2] 在 `src/components/GlobalHeader.vue` 用户下拉菜单增加“个人信息”入口并跳转 `/user/profile`

## Phase 5: Polish & Verification

- [x] T008 [US1] 运行 `npm run build` 修复编译问题（如有）
- [x] T009 [US1] 运行 `npm run lint` 修复 lint 问题（如有）
