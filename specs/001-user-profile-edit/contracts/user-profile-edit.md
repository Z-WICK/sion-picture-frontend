# Contract: User Profile Edit (Frontend Usage)

## API Endpoint (from generated client)
- Preferred generated function: `postUserUpdate(body: API.UserUpdateRequest)`
- File: `src/api/user.ts`

## Request Body
```ts
{
  id: number,
  userName?: string,
  userAvatar?: string,
  userProfile?: string
}
```

## Response Handling
- Success: `res.data.code === 0`
- Failure: `res.data.code !== 0` => show `res.data.message`
