export const isDevAuthBypassEnabled =
  import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'

export const devMockCredentials = {
  token: 'dev-only-mock-token',
  user: {
    id: 'dev-user',
    email: 'dev@example.com',
  },
} as const
