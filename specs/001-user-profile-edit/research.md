# Research: 用户信息编辑

## Decision 1: API 调用方式
- Decision: 严格使用 OpenAPI 生成客户端 `src/api/user.ts` 中的方法，不手写 axios 路由。
- Rationale: 项目宪法要求 API 层自动生成，避免接口签名漂移和重复封装。
- Alternatives considered:
  - 直接在页面中 `request('/user/update')`：违反宪法，不采用。
  - 新建 `src/services/user.ts` 再转调：增加无价值中间层，不采用。

## Decision 2: 编辑入口与页面组织
- Decision: 新增 `/user/profile` 页面，并在 `GlobalHeader` 登录下拉菜单增加入口。
- Rationale: 现有登录/注册在 `src/pages/user/`，入口语义一致且改动小。
- Alternatives considered:
  - 放在侧边栏：会污染主要业务导航，不采用。

## Decision 3: 初始值来源
- Decision: 表单初始值来自 `useLoginUserStore().loginUser`，并在页面加载时调用 `fetchLoginUser()` 兜底。
- Rationale: store 已是全局登录状态来源，避免多处状态副本。

## Decision 4: 成功后状态同步
- Decision: 保存成功后再次调用 `fetchLoginUser()`，再提示成功。
- Rationale: 确保 header 与全局状态一致，不依赖本地猜测更新。

## Decision 5: OpenAPI 再生成策略
- Decision: 先执行 `npm run openapi`，若生成结果无变化则使用现有生成客户端；若有新增“用户自助更新”接口，优先使用新接口。
- Rationale: 用户明确要求使用 OpenAPI 生成客户端，同时兼容后端已就绪但前端尚未更新场景。
