# Implementation Plan: 用户信息编辑

**Branch**: `001-user-profile-edit` | **Date**: 2026-02-19 | **Spec**: `spec.md`
**Input**: Feature specification from `specs/001-user-profile-edit/spec.md`

## Summary

新增用户个人信息编辑能力：提供 `/user/profile` 页面，让已登录用户修改昵称、头像、简介；提交通过 OpenAPI 生成客户端调用后端更新接口；成功后刷新 Pinia 登录态，保证头部显示立即同步。

## Technical Context

**Language/Version**: TypeScript 5.6  
**Primary Dependencies**: Vue 3.5, Vue Router 4, Pinia, Ant Design Vue, Axios, @umijs/openapi  
**Storage**: N/A（前端仅调用后端接口）  
**Testing**: `npm run build`（含 `vue-tsc`）+ `npm run lint`  
**Target Platform**: Web SPA (Vite)  
**Project Type**: Single frontend project (`src/`)  
**Performance Goals**: 表单提交与反馈在常规网络下可用；页面交互无明显阻塞  
**Constraints**: 必须使用 OpenAPI 生成客户端；不可修改 `src/api/*` 手写逻辑  
**Scale/Scope**: 1 新页面 + 2-4 个既有文件改动

## Constitution Check

- Composition API only: PASS（新增页面使用 `<script setup lang="ts">`）
- Auto-generated API layer: PASS（仅调用 `src/api/user.ts` 生成方法）
- Single UI library: PASS（使用 Ant Design Vue 表单组件）
- Type safety: PASS（使用 `API.UserUpdateRequest`、`API.LoginUserVO` 类型）
- Simplicity & YAGNI: PASS（不新增抽象层，不引入新依赖）

## Project Structure

### Documentation (this feature)

```text
specs/001-user-profile-edit/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── pages/user/
│   └── UserProfilePage.vue        # new
├── router/
│   └── index.ts                   # update route
├── components/
│   └── GlobalHeader.vue           # add menu entry
└── stores/
    └── useLoginUserStore.ts       # reuse fetchLoginUser after save
```

**Structure Decision**: 沿用现有 user 页面与路由组织，不新增服务层。

## Implementation Notes

1. 先执行 `npm run openapi` 同步客户端。
2. 在新页面中加载当前用户信息并回填表单。
3. 使用生成客户端提交更新请求。
4. 成功后刷新登录态并给出反馈。
5. 在 header 增加“个人信息”入口。
6. 跑 build/lint 验证。
