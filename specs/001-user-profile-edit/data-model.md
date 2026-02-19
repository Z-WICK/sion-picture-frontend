# Data Model: 用户信息编辑

## Entities

### LoginUserVO
- Source: `API.LoginUserVO`
- Key fields used:
  - `id: number`
  - `userName: string`
  - `userAvatar?: string`
  - `userProfile?: string`
  - `userRole?: string`

### UserEditRequest
- Source: `API.UserEditRequest`
- Key fields used:
  - `userName?: string`
  - `userAvatar?: string`
  - `userProfile?: string`

## Validation Rules (frontend)
- `userName` required, non-empty.
- `userProfile` optional,建议长度限制在 200 字以内。
- `userAvatar` optional, 支持 URL。
