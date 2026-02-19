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

### UserUpdateRequest
- Source: `API.UserUpdateRequest`
- Key fields used:
  - `id: number` (required in request body for current generated API)
  - `userName?: string`
  - `userAvatar?: string`
  - `userProfile?: string`

## Validation Rules (frontend)
- `userName` required, non-empty.
- `userProfile` optional,建议长度限制在 200 字以内。
- `userAvatar` optional, 支持 URL。
