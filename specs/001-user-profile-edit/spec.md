# Feature Specification: 用户信息编辑

**Feature Branch**: `001-user-profile-edit`  
**Created**: 2026-02-19  
**Status**: Draft  
**Input**: User description: "新增一个用户信息编辑功能，后端接口已准备好，前端必须使用 OpenAPI 生成客户端"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 编辑个人资料 (Priority: P1)

已登录用户可以进入“个人信息编辑”页面，修改昵称、头像、简介并保存。

**Why this priority**: 这是用户基础自服务能力，影响账号可用性与个人展示，必须优先交付。

**Independent Test**: 登录后打开编辑页，修改字段并提交；页面显示成功提示，刷新后仍可看到更新值。

**Acceptance Scenarios**:

1. **Given** 用户已登录并进入个人信息编辑页，**When** 修改昵称并提交，**Then** 前端调用 OpenAPI 生成接口并提示更新成功。
2. **Given** 用户在编辑页输入非法值（例如昵称为空），**When** 点击保存，**Then** 前端阻止提交并给出校验提示。

---

### User Story 2 - 更新后全局信息一致 (Priority: P2)

用户更新资料后，顶部导航显示的头像/昵称应与新资料一致，不需要重新登录。

**Why this priority**: 保证体验一致性，避免“保存成功但头部仍是旧信息”的感知错误。

**Independent Test**: 编辑成功后直接查看全局头部用户名/头像展示，应与最新资料一致。

**Acceptance Scenarios**:

1. **Given** 用户刚提交成功，**When** 观察头部用户区域，**Then** 展示最新昵称与头像。

### Edge Cases

- 用户未登录直接访问编辑路由，应被重定向到登录页（由现有拦截器/权限流处理）。
- 接口返回业务错误时，保留用户输入并展示错误信息，不清空表单。
- 头像 URL 为空时，展示默认头像并允许仅更新昵称/简介。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须提供一个仅登录用户可访问的“用户信息编辑”页面。
- **FR-002**: 页面必须预填充当前登录用户的 `userName`、`userAvatar`、`userProfile`。
- **FR-003**: 页面提交必须调用 OpenAPI 生成的用户更新客户端方法，禁止手写重复 API 封装。
- **FR-004**: 提交成功后必须刷新并同步全局登录用户状态（Pinia store），使头部展示立即更新。
- **FR-005**: 系统必须对必填字段（昵称）做前端校验，并在失败时阻止提交。
- **FR-006**: 接口失败时必须提示后端错误信息并保持表单可继续编辑。

### Key Entities *(include if feature involves data)*

- **LoginUserVO**: 当前登录用户视图对象，包含 id、userName、userAvatar、userProfile、userRole。
- **UserUpdateRequest**: 用户更新请求对象，包含 id、userName、userAvatar、userProfile（以及服务端允许字段）。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% 通过编辑页发起的资料更新请求都走 OpenAPI 生成客户端。
- **SC-002**: 用户在 30 秒内可完成一次资料修改并看到成功反馈。
- **SC-003**: 更新成功后，当前页面和头部展示在一次交互内一致，无需手动刷新或重新登录。

## Clarifications

- Q: 提交用户信息编辑时应调用哪个接口？ -> A: 使用 OpenAPI 生成客户端中的用户编辑接口（当前客户端为 `postUserEdit`），并按生成类型传参。 | Source: UserInput(2026-02-19)
- Q: 编辑成功后是否需要刷新登录态？ -> A: 需要调用 `fetchLoginUser` 同步 Pinia 中的 `loginUser`，确保头部昵称和头像实时更新。 | Source: Spec-FR-004
- Q: 个人信息编辑入口放在哪里？ -> A: 放在头部用户下拉菜单，新增“个人信息”入口并跳转到独立路由页面。 | Source: UX-Decision-Stage2
