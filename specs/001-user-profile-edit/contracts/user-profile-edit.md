# Contract: User Profile Edit (Frontend Usage)

## API Endpoint (from generated client)
- Preferred generated function: `postUserEdit(body: API.UserEditRequest)`
- File: `src/api/user.ts`

## Request Body
```ts
{
  userName?: string,
  userAvatar?: string,
  userProfile?: string
}
```

## Response Handling
- Success: `res.data.code === 0`
- Failure: `res.data.code !== 0` => show `res.data.message`
